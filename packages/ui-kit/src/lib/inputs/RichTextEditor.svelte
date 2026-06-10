<script lang="ts">
	import { DEBOUNCE_DELAY, FORMAT_OPTIONS, RICHTEXT_ICONS } from '@aryagg/types';
	import type { ITextFormat, IRichTextIcon, TextFormatKeys } from '@aryagg/types';
	import { onMount } from 'svelte';

	let {
		uniqRef,
		errorMsg = '',
		onChangeInput,
		value	} = $props<{
		uniqRef: string;
		required?: boolean;
		errorMsg?: string;
		value?: string;
		onChangeInput: (item: any) => void;
		isRegister?: boolean;
	}>();



	let selTick = $state(0);
	let fontPx = $state(16);
	const textFormat = $state<ITextFormat>({
		formatBlock: '',
		fontSize: '',
		foreColor: '',
		hiliteColor: ''
	});

	const PX_MIN = 8;
	const PX_MAX = 96;

	const DEFAULT_OL = 'decimal'; // 1,2,3
	const DEFAULT_UL = 'disc'; // •
	const DEFAULT_INDENT = '1.25rem';

	let typingSpan: HTMLElement | null = null;
	let lastRange: Range | null = null;
	let isShowCode = $state(false);
	let contentEditable: HTMLElement;

	const undoStack = $state<string[]>([]);
	const redoStack = $state<string[]>([]);

	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
	onMount(() => {
		if (value && contentEditable) {
			contentEditable.innerHTML = value;
		}
		undoStack.splice(0, undoStack.length, contentEditable?.innerHTML ?? '');

		const onSelectionChange = () => {
			saveRangeIfInEditor();
			selTick++;
		};
		document.addEventListener('selectionchange', onSelectionChange);
		contentEditable?.addEventListener('keyup', saveRangeIfInEditor);
		contentEditable?.addEventListener('mouseup', saveRangeIfInEditor);

		return () => {
			document.removeEventListener('selectionchange', onSelectionChange);
			contentEditable?.removeEventListener('keyup', saveRangeIfInEditor);
			contentEditable?.removeEventListener('mouseup', saveRangeIfInEditor);
		};
	});


	function getFormatValue(cmd: TextFormatKeys): string {
		return textFormat[cmd] ?? '';
	}
	function setFormatValue(cmd: TextFormatKeys, v: string) {
		textFormat[cmd] = v;

		if (cmd === 'foreColor' || cmd === 'hiliteColor') {
			restoreSelection();
		}
		formatText(cmd, v);
	}

	function onIconClick(icon: IRichTextIcon, value: string | null = null) {
		if (icon.command === 'createLink') {
			const url = window.prompt('Insert url') ?? '';
			value = url;
		}
		formatText(icon.command, value);
		selTick++;
	}

	function clampPx(v: number) {
		return Math.max(PX_MIN, Math.min(PX_MAX, Math.round(v)));
	}
	function sameInlineStyle(a: HTMLElement, style: Partial<CSSStyleDeclaration>) {
		for (const k of Object.keys(style) as (keyof CSSStyleDeclaration)[]) {
			if ((a.style as any)[k] !== (style as any)[k]) return false;
		}
		return true;
	}

	function selectionInEditor(ed: HTMLElement): Range | null {
		// Ensure that contentEditable is not null
		if (!ed) return null;

		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;

		const r = sel.getRangeAt(0);
		if (!ed.contains(r.startContainer) || !ed.contains(r.endContainer)) return null;
		return r;
	}

	function saveRangeIfInEditor() {
		const r = selectionInEditor(contentEditable);
		if (r) lastRange = r.cloneRange();
	}

	function restoreSelection(): boolean {
		if (!lastRange) return false;
		const sel = window.getSelection();
		contentEditable.focus();
		sel?.removeAllRanges();
		sel?.addRange(lastRange);
		return true;
	}
	function getCaretNode(): { node: Node; offset: number } | null {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const r = sel.getRangeAt(0);
		return { node: r.startContainer, offset: r.startOffset };
	}
	function closestSpan(el: Node | null): HTMLElement | null {
		let p = el?.nodeType === 1 ? (el as HTMLElement) : (el?.parentElement ?? null);
		while (p && p.tagName !== 'SPAN') p = p.parentElement;
		return p?.tagName === 'SPAN' ? p : null;
	}

	function removeZWSPAtEdges(span?: HTMLElement | null) {
		if (!span) return;
		const isZWSP = (n: Node) => n.nodeType === 3 && (n as Text).data === '\u200B';
		if (span.firstChild && isZWSP(span.firstChild)) span.firstChild.remove();
		if (span.lastChild && isZWSP(span.lastChild)) span.lastChild.remove();
	}
	function mergeAdjSpansAll(root: HTMLElement) {
		const spans = root.querySelectorAll('span');
		spans.forEach(s => mergeAdjSpans(s as HTMLElement));
	}

	function removeEmptySpans(root: HTMLElement) {
		root.querySelectorAll('span').forEach(s => {
			const txt = s.textContent ?? '';
			const onlyZWSP = txt.replace(/\u200B/g, '') === '';
			if (onlyZWSP && s.children.length === 0) s.remove();
		});
	}
	function applyAtCaretColor(style: Partial<CSSStyleDeclaration>) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const range = sel.getRangeAt(0);
		if (!range.collapsed) return null;

		const caret = getCaretNode();
		if (!caret) return null;

		const parentSpan = closestSpan(caret.node);
		if (parentSpan && sameInlineStyle(parentSpan, style)) {
			typingSpan = parentSpan;
			return parentSpan;
		}

		if (typingSpan && document.body.contains(typingSpan)) {
			const atBoundary =
				range.startContainer === typingSpan.lastChild ||
				range.startContainer === typingSpan ||
				range.startContainer.parentElement === typingSpan;
			if (atBoundary) {
				Object.assign(typingSpan.style, style);
				return typingSpan;
			}
		}

		const span = document.createElement('span');
		Object.assign(span.style, style);
		const zwsp = document.createTextNode('\u200B');
		span.appendChild(zwsp);

		range.insertNode(span);
		const r2 = document.createRange();
		r2.setStart(zwsp, 1);
		r2.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r2);

		typingSpan = span;
		mergeAdjSpans(span);
		return span;
	}
	function selectedTag(isDivNeeded: boolean, selection: Selection, range: Range): HTMLElement {
		const common = range.commonAncestorContainer as HTMLElement;
		const container: HTMLElement = isDivNeeded
			? document.createElement('div')
			: document.createElement('span');
		container.appendChild(range.cloneContents());
		const innerHTML = container.innerHTML;
		if (innerHTML === (common as HTMLElement).innerHTML) {
			return common;
		} else {
			const newRange = range.cloneRange();
			range.deleteContents();
			range.insertNode(container);
			newRange.setStart(container, 0);
			newRange.setEnd(container, container.childNodes.length);
			selection.removeAllRanges();
			selection.addRange(newRange);
			return container;
		}
	}

	function addLinkText(value: string | null, selectedElement: HTMLElement) {
		if (!value) return;
		const link = document.createElement('a');
		link.href = value;
		link.className = selectedElement.className;
		const computedStyles = window.getComputedStyle(selectedElement);
		link.style.cssText = computedStyles.cssText;
		link.textContent = selectedElement.textContent;
		selectedElement.parentNode?.replaceChild(link, selectedElement);
	}

	const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

	function isBlockNode(n: Node | null) {
		return !!n && n.nodeType === 1 && BLOCK_TAGS.has((n as HTMLElement).tagName);
	}

	function nearestBlock(root: HTMLElement, node: Node): HTMLElement {
		let el = node.nodeType === 1 ? (node as HTMLElement) : (node.parentElement as HTMLElement);
		while (el && el !== root && !isBlockNode(el)) el = el.parentElement as HTMLElement;
		return el && el !== root ? el : root;
	}

	function collectBlocksInRange(root: HTMLElement, range: Range): HTMLElement[] {
		const startBlock = nearestBlock(root, range.startContainer);
		const endBlock = nearestBlock(root, range.endContainer);
		if (startBlock === root || endBlock === root) return [];

		const blocks: HTMLElement[] = [];
		let cur: HTMLElement | null = startBlock;
		while (cur) {
			if (isBlockNode(cur)) blocks.push(cur);
			if (cur === endBlock) break;

			let next: HTMLElement | null = null;
			if (cur.nextElementSibling) next = cur.nextElementSibling as HTMLElement;
			else {
				let up: HTMLElement | null = cur.parentElement;
				while (up && up !== root && !up.nextElementSibling) up = up.parentElement;
				next = up && up !== root ? (up.nextElementSibling as HTMLElement) : null;
			}

			while (next && !isBlockNode(next)) {
				next = (next.nextElementSibling as HTMLElement) || null;
			}
			cur = next;
		}
		return blocks;
	}

	function unwrapList(listEl: HTMLElement) {
		const frag = document.createDocumentFragment();
		Array.from(listEl.children).forEach(li => {
			const div = document.createElement('div');
			while (li.firstChild) div.appendChild(li.firstChild);
			frag.appendChild(div);
		});
		listEl.replaceWith(frag);
	}
	function styleList(list: HTMLElement, tag: 'ol' | 'ul', type?: string) {
		list.style.listStyleType = type || (tag === 'ol' ? DEFAULT_OL : DEFAULT_UL);
		list.style.listStylePosition = 'outside';
		list.style.paddingLeft = DEFAULT_INDENT;
	}

	function switchListType(listEl: HTMLElement, tag: 'ol' | 'ul', type?: string) {
		if (listEl.tagName.toLowerCase() === tag) {
			styleList(listEl, tag, type);
			return;
		}
		const newList = document.createElement(tag);
		while (listEl.firstChild) newList.appendChild(listEl.firstChild);
		listEl.replaceWith(newList);
		styleList(newList, tag, type);
	}
	function wrapBlocksIntoList(blocks: HTMLElement[], tag: 'ol' | 'ul', type?: string) {
		if (!blocks.length) return null;
		const list = document.createElement(tag);
		const first = blocks[0];
		if(first) first.parentNode?.insertBefore(list, first);

		blocks.forEach(b => {
			const li = document.createElement('li');
			while (b.firstChild) li.appendChild(b.firstChild);
			b.remove();
			list.appendChild(li);
		});

		styleList(list, tag, type);
		return list;
	}

	function allInSameList(blocks: HTMLElement[]) {
		const parents = blocks.map(b => {
			let p: HTMLElement | null = b;
			while (p && p.tagName !== 'UL' && p.tagName !== 'OL') p = p.parentElement;
			return p;
		});
		const first = parents[0];
		if (!first) return { same: false, list: null as HTMLElement | null };
		const same = parents.every(p => p === first);
		return { same, list: first };
	}

	function ensureNonCollapsedBlock(root: HTMLElement, range: Range) {
		if (!range.collapsed) return;
		const block = nearestBlock(root, range.startContainer);
		if (block === root) {
			const div = document.createElement('div');
			div.appendChild(document.createTextNode('\u200B'));
			range.insertNode(div);
			range.selectNodeContents(div);
		} else {
			const r = document.createRange();
			r.selectNode(block);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(r);
		}
	}

	function convertToList(isOrdered: boolean, range: Range) {
		const root = contentEditable;
		ensureNonCollapsedBlock(root, range);

		const blocks = collectBlocksInRange(root, range);
		if (!blocks.length) return;

		const { same, list } = allInSameList(blocks);
		const tag: 'ol' | 'ul' = isOrdered ? 'ol' : 'ul';

		if (same && list) {
			if (list.tagName.toLowerCase() === tag) {
				//   unwrapList(list);
				styleList(list, tag);
			} else {
				switchListType(list, tag);
			}
		} else {
			const created = wrapBlocksIntoList(blocks, tag);
			if (created) {
				const sel = window.getSelection();
				sel?.removeAllRanges();
				const r = document.createRange();
				r.selectNodeContents(created);
				r.collapse(false);
				sel?.addRange(r);
			}
		}
	}

	function wrapTypingWithClasses(classes: string) {
		if (!classes) return;
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;
		const range = sel.getRangeAt(0);
		if (!range.collapsed) return;

		const span = document.createElement('span');
		classes
			.split(' ')
			.filter(Boolean)
			.forEach(c => span.classList.add(c));
		const zwsp = document.createTextNode('\u200B');
		span.appendChild(zwsp);

		range.insertNode(span);

		const newRange = document.createRange();
		newRange.setStart(zwsp, 1);
		newRange.collapse(true);
		sel.removeAllRanges();
		sel.addRange(newRange);
	}

	function stylesEqual(a: HTMLElement, b: HTMLElement) {
		return a.getAttribute('style') === b.getAttribute('style');
	}
	function mergeAdjSpans(span: HTMLElement) {
		const prev = span.previousSibling as HTMLElement | null;
		if (prev && prev.nodeType === 1 && prev.tagName === 'SPAN' && stylesEqual(prev, span)) {
			while (span.firstChild) prev.appendChild(span.firstChild);
			span.remove();
			span = prev;
		}
		const next = span.nextSibling as HTMLElement | null;
		if (next && next.nodeType === 1 && next.tagName === 'SPAN' && stylesEqual(next, span)) {
			while (next.firstChild) span.appendChild(next.firstChild);
			next.remove();
		}
	}
	function getSelectedInEditable(ed: HTMLElement) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const range = sel.getRangeAt(0);
		if (!ed.contains(range.startContainer) || !ed.contains(range.endContainer)) return null;
		return { sel, range };
	}
	function isUnderlineActive(node: HTMLElement) {
		const cs = window.getComputedStyle(node);
		return cs.textDecoration.includes('underline');
	}
	function nearestElement(range: Range) {
		return (
			range.startContainer.nodeType === 1
				? (range.startContainer as HTMLElement)
				: (range.startContainer.parentElement as HTMLElement)
		)!;
	}
	function breakAncestorUnderline(range: Range) {
		const frag = range.extractContents();
		const span = document.createElement('span');
		span.style.textDecoration = 'none';
		span.style.display = 'inline-block';
		span.appendChild(frag);
		range.insertNode(span);
		mergeAdjSpans(span);
		const r = document.createRange();
		r.setStartAfter(span);
		r.collapse(true);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(r);
		return span;
	}
	function applyInlineStyle(range: Range, style: Partial<CSSStyleDeclaration>) {
		const frag = range.extractContents();
		const span = document.createElement('span');
		Object.assign(span.style, style);
		span.appendChild(frag);
		range.insertNode(span);
		mergeAdjSpans(span);
		const sel = window.getSelection();
		if (sel) {
			sel.removeAllRanges();
			const r = document.createRange();
			r.setStartAfter(span);
			r.collapse(true);
			sel.addRange(r);
		}
		return span;
	}
	function applyAtCaretNoNest(style: Partial<CSSStyleDeclaration>) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return null;
		const range = sel.getRangeAt(0);
		if (!range.collapsed) return null;
		const zwsp = document.createTextNode('\u200B');
		const span = document.createElement('span');
		Object.assign(span.style, style);
		span.appendChild(zwsp);
		let container = nearestElement(range);
		let topSpan: HTMLElement | null = null;
		let cur: HTMLElement | null = container;
		while (cur && cur.tagName === 'SPAN') {
			topSpan = cur;
			cur = cur.parentElement;
		}
		if (topSpan && topSpan.parentNode) {
			topSpan.parentNode.insertBefore(span, topSpan.nextSibling);
		} else {
			range.insertNode(span);
		}
		const r = document.createRange();
		r.setStart(zwsp, 1);
		r.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r);
		mergeAdjSpans(span);
		return span;
	}
	function toggleInline(command: string, node: HTMLElement, range: Range, value?: string | null) {
		switch (command) {
			case 'bold': {
				const active = /bold|[7-9]\d{2}/.test(window.getComputedStyle(node).fontWeight);
				return active
					? applyInlineStyle(range, { fontWeight: 'normal' })
					: applyInlineStyle(range, { fontWeight: 'bold' });
			}
			case 'italic': {
				const active = ['italic', 'oblique'].includes(window.getComputedStyle(node).fontStyle);
				return active
					? applyInlineStyle(range, { fontStyle: 'normal' })
					: applyInlineStyle(range, { fontStyle: 'italic' });
			}
			case 'underline': {
				const active = isUnderlineActive(node);
				if (active) return breakAncestorUnderline(range);
				return applyInlineStyle(range, { textDecoration: 'underline' });
			}
			case 'strikethrough': {
				const active = window.getComputedStyle(node).textDecorationLine === 'line-through';
				return active
					? applyInlineStyle(range, { textDecoration: 'none' })
					: applyInlineStyle(range, { textDecoration: 'line-through' });
			}
			case 'foreColor':
				applyAtCaretColor({ color: value || getFormatValue('foreColor') });
				break;
			case 'hiliteColor':
				applyAtCaretColor({ backgroundColor: value || getFormatValue('hiliteColor') });
				break;
		}
		return null;
	}
	function setBlockAlign(range: Range, align: 'left' | 'center' | 'right' | 'justify') {
		const el = document.createElement('div');
		el.style.textAlign = align;
		el.appendChild(range.extractContents());
		range.insertNode(el);
		const sel = window.getSelection();
		if (sel) {
			sel.removeAllRanges();
			const r = document.createRange();
			r.selectNodeContents(el);
			r.collapse(false);
			sel.addRange(r);
		}
	}
	function formatText(command: string, value: string | null = null) {
		if (command === 'undo') {
			undo();
			return;
		}
		if (command === 'redo') {
			redo();
			return;
		}
		const ctx = getSelectedInEditable(contentEditable);
		if (!ctx) return;
		const { sel, range } = ctx;
		value = value ?? '';
		if (command === 'insertOrderedList' || command === 'insertUnorderedList') {
			const inOrdered = isCommandActive('insertOrderedList');
			const inUnordered = isCommandActive('insertUnorderedList');

			if (
				(command === 'insertOrderedList' && inOrdered) ||
				(command === 'insertUnorderedList' && inUnordered)
			) {
				const ctxList = getSelectedInEditable(contentEditable);
				if (ctxList) {
					const { range } = ctxList;

					let node = nearestElement(range);
					while (
						node &&
						node !== contentEditable &&
						node.tagName !== 'OL' &&
						node.tagName !== 'UL'
					) {
						node = node.parentElement!;
					}
					if (node && (node.tagName === 'OL' || node.tagName === 'UL')) {
						unwrapList(node);
					}
				}
			} else {
				convertToList(command === 'insertOrderedList', range);
			}

			undoStack.push(contentEditable.innerHTML);
			selTick++;
			return;
		}

		if (command.startsWith('justify')) {
			const align = command.replace('justify', '').toLowerCase() as any;
			setBlockAlign(range, align || 'left');
			undoStack.push(contentEditable.innerHTML);
			selTick++;
			return;
		}
		if (range.collapsed) {
			contentEditable.focus();
			switch (command) {
				case 'bold':
					applyAtCaretNoNest({ fontWeight: isCommandActive('bold') ? 'normal' : 'bold' });
					break;
				case 'italic':
					applyAtCaretNoNest({ fontStyle: isCommandActive('italic') ? 'normal' : 'italic' });
					break;
				case 'underline': {
					const node = nearestElement(range);
					if (isUnderlineActive(node)) {
						applyAtCaretNoNest({ textDecoration: 'none', display: 'inline-block' });
					} else {
						applyAtCaretNoNest({ textDecoration: 'underline' });
					}
					break;
				}
				case 'fontSizePx': {
					const px = value ? parseInt(value) : fontPx;
					applyAtCaretNoNest({ fontSize: `${clampPx(px)}px` });
					fontPx = clampPx(px);
					undoStack.push(contentEditable.innerHTML);
					selTick++;
					break;
				}
				case 'strikethrough':
					applyAtCaretNoNest({
						textDecoration: isCommandActive('strikethrough') ? 'none' : 'line-through'
					});
					break;

				case 'foreColor':
					applyAtCaretColor({ color: value || getFormatValue('foreColor') });
					break;
				case 'hiliteColor':
					applyAtCaretColor({ backgroundColor: value || getFormatValue('hiliteColor') });
					break;
				case 'formatBlock':
				case 'fontSize':
					wrapTypingWithClasses(value || getFormatValue(command as any));
					break;
			}
			undoStack.push(contentEditable.innerHTML);
			selTick++;
			return;
		}
		const node = nearestElement(range);
		switch (command) {
			case 'bold':
			case 'italic':
			case 'underline':
			case 'strikethrough':
			case 'foreColor':
			case 'hiliteColor':
				toggleInline(command, node, range, value);
				break;
			case 'formatBlock':
			case 'fontSize': {
				const span = applyInlineStyle(range, {});
				if (span) {
					Array.from(span.classList).forEach(cls => {
						if (cls.startsWith('text-')) span.classList.remove(cls);
					});
					(value || '')
						.split(' ')
						.filter(Boolean)
						.forEach(cls => span.classList.add(cls));
				}
				break;
			}
			case 'fontSizePx': {
				const px = value ? parseInt(value) : fontPx;
				applyInlineStyle(range, { fontSize: `${clampPx(px)}px` });
				fontPx = clampPx(px);
				break;
			}
			case 'createLink':
				addLinkText(value, selectedTag(false, sel, range));
				break;
		}
		undoStack.push(contentEditable.innerHTML);
		selTick++;
	}

	function isCommandActive(command: string): boolean {
		const sel = window.getSelection();

		if (!sel || sel.rangeCount === 0) return false;

		const range = sel.getRangeAt(0);
		let node = (
			range.startContainer.nodeType === Node.ELEMENT_NODE
				? (range.startContainer as HTMLElement)
				: range.startContainer.parentElement
		) as HTMLElement | null;
		if (!node) return false;
		const cs = window.getComputedStyle(node);

		switch (command) {
			case 'bold':
				return cs.fontWeight === 'bold' || parseInt(cs.fontWeight) >= 700; // <-- no !
			case 'italic':
				return cs.fontStyle === 'italic' || cs.fontStyle === 'oblique';
			case 'underline':
				return cs.textDecoration.includes('underline');
			case 'strikethrough':
				return cs.textDecorationLine === 'line-through';
			case 'justifyLeft':
				return cs.textAlign === 'left' || cs.textAlign === 'start';
			case 'justifyCenter':
				return cs.textAlign === 'center';
			case 'justifyRight':
				return cs.textAlign === 'right' || cs.textAlign === 'end';
			case 'justifyJustify':
				return cs.textAlign === 'justify';
			case 'insertOrderedList':
				while (node && node !== contentEditable) {
					if (node.tagName === 'OL') return true;
					node = node.parentElement;
				}
				return false;
			case 'insertUnorderedList':
				while (node && node !== contentEditable) {
					if (node.tagName === 'UL') return true;
					node = node.parentElement;
				}
				return false;
			default:
				return false;
		}
	}
	function undo() {
		if (undoStack.length > 1) {
			redoStack.push(undoStack.pop() ?? '');
			contentEditable.innerHTML = undoStack[undoStack.length - 1] || '';
		}
	}

	function redo() {
		if (redoStack.length) {
			undoStack.push(redoStack.pop() ?? '');
			contentEditable.innerHTML = undoStack[undoStack.length - 1] || '';
		}
	}

	function handleInput() {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			undoStack.push(contentEditable?.innerHTML ?? '');
			onChangeInput(contentEditable);
			removeZWSPAtEdges(typingSpan);
			removeEmptySpans(contentEditable);
			mergeAdjSpansAll(contentEditable);
		}, DEBOUNCE_DELAY);
	}
	function showCode() {
		isShowCode = !isShowCode;
		if (contentEditable) {
			if (isShowCode) {
				contentEditable.textContent = contentEditable.innerHTML;
			} else {
				contentEditable.innerHTML = contentEditable.textContent || '';
			}
		}
	}


	export function getContent() {
		return contentEditable?.innerHTML ?? '';
	}

</script>

<div class="my-2 flex w-full flex-col rounded-md bg-primary text-base shadow-sm">
	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-2 border bg-gray-50 p-3"
		class:border-red-300={errorMsg}
	>
		<!-- Format Options -->
		{#each FORMAT_OPTIONS as formatOption}
			{#if formatOption.type === 'select'}
				<select
					class="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					title={formatOption.title}
					value={getFormatValue(formatOption.command as TextFormatKeys)}
					onchange={e =>
						setFormatValue(
							formatOption.command as TextFormatKeys,
							(e.target as HTMLSelectElement).value
						)}
				>
					<option value="" disabled>{formatOption.title}</option>
					{#each formatOption.options ?? [] as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{:else if formatOption.type === 'color'}
				<div class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1">
					<label for={uniqRef + formatOption.id} class="text-xs text-gray-600">
						{formatOption.title}:
					</label>
					<input
						id={uniqRef + formatOption.id}
						type="color"
						class="h-6 w-8 cursor-pointer rounded border-0"
						title={formatOption.title}
						value={getFormatValue(formatOption.command as TextFormatKeys)}
						onchange={e =>
							setFormatValue(
								formatOption.command as TextFormatKeys,
								(e.target as HTMLInputElement).value
							)}
					/>
				</div>
			{/if}
		{/each}

		<!-- Divider -->
		<div class="h-6 w-px bg-gray-300"></div>

		<!-- Formatting Icons -->
		{#key selTick}
			<div class="flex flex-wrap gap-1">
				{#each RICHTEXT_ICONS as icon}
					<button
						type="button"
						onclick={() => onIconClick(icon)}
						class={`flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors hover:bg-gray-100 ${
							isCommandActive(icon.command)
								? 'border-blue-300 bg-blue-100 text-blue-700'
								: 'border-gray-300 bg-white text-gray-700'
						}`}
						title={icon.title}
						aria-label={icon.title}
						aria-pressed={isCommandActive(icon.command)}
					>
						<i class={`bi ${icon.icon}`}></i>
					</button>
				{/each}
			</div>
		{/key}

		<!-- Divider -->
		<div class="h-6 w-px bg-gray-300"></div>

		<!-- Image Upload -->
		<!-- <label
			for={uniqRef + '_image'}
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100"
			title="Insert Image"
		>
			<i class="bi bi-image text-sm"></i>
			<input
				id={uniqRef + '_image'}
				type="file"
				class="hidden"
				accept="image/*"
				onchange={handleImageUpload}
			/>
		</label> -->

		<!-- Code Toggle -->
		<button
			type="button"
			class={`flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors hover:bg-gray-100 ${
				isShowCode
					? 'border-blue-300 bg-blue-100 text-blue-700'
					: 'border-gray-300 bg-white text-gray-700'
			}`}
			onclick={showCode}
			title="Toggle HTML View"
			aria-pressed={isShowCode}
		>
			<span class="font-mono text-xs">&lt;/&gt;</span>
		</button>
	</div>

	<!-- Editor -->
	<div
		bind:this={contentEditable}
		id={uniqRef + 'content'}
		class={`max-h-40 min-h-32 flex-auto overflow-auto border border-t-0  p-4 outline-none ${errorMsg ? 'border-red-300' : 'border-primary'}`}
		contenteditable="true"
		spellcheck="true"
		oninput={handleInput}
	></div>

	<!-- Error Message -->
	<!-- {#if errorMsg}
		<div class="border-t border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
			{errorMsg}
		</div>
	{/if} -->
</div>

<style>
	.upload-container {
		text-align: center;
		padding: 10px;
	}

	.uploaded-image {
		cursor: pointer;
		max-width: 100%;
		max-height: 300px;
		margin-top: 10px;
	}

	.resize-controls {
		margin-top: 10px;
		text-align: center;
	}
</style>

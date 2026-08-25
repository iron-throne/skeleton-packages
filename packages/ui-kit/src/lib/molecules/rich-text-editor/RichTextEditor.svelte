<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ArrowClockwise,
		ArrowCounterclockwise,
		ChevronDown,
		CodeSlash,
		Justify,
		Link45deg,
		ListOl,
		ListUl,
		TextCenter,
		TextLeft,
		TextRight,
		TypeBold,
		TypeItalic,
		TypeStrikethrough,
		TypeUnderline
	} from 'svelte-bootstrap-icons';

	type EditorChangeHandler = (element: HTMLElement) => void;
	type Command =
		| 'bold'
		| 'italic'
		| 'underline'
		| 'strikeThrough'
		| 'justifyLeft'
		| 'justifyCenter'
		| 'justifyRight'
		| 'justifyFull'
		| 'insertOrderedList'
		| 'insertUnorderedList'
		| 'createLink'
		| 'undo'
		| 'redo';

	let {
		uniqRef,
		required = false,
		errorMsg = '',
		value = $bindable(''),
		onChangeInput = () => {},
		disabled = false,
		placeholder = 'Write something…',
		ariaLabel = 'Rich text editor'
	}: {
		uniqRef: string;
		required?: boolean;
		errorMsg?: string;
		value?: string;
		onChangeInput?: EditorChangeHandler;
		isRegister?: boolean;
		disabled?: boolean;
		placeholder?: string;
		ariaLabel?: string;
	} = $props();

	let editor = $state<HTMLElement>();
	let savedRange: Range | null = null;
	let htmlMode = $state(false);
	let rawHtml = $state('');
	let selectionVersion = $state(0);

	const headings = [
		{ label: 'Paragraph', value: 'p' },
		{ label: 'Heading 1', value: 'h1' },
		{ label: 'Heading 2', value: 'h2' },
		{ label: 'Heading 3', value: 'h3' },
		{ label: 'Heading 4', value: 'h4' },
		{ label: 'Heading 5', value: 'h5' },
		{ label: 'Heading 6', value: 'h6' }
	];

	const fontSizes = [
		{ label: '12 px', value: '1' },
		{ label: '14 px', value: '2' },
		{ label: '16 px', value: '3' },
		{ label: '18 px', value: '4' },
		{ label: '24 px', value: '5' },
		{ label: '32 px', value: '6' },
		{ label: '48 px', value: '7' }
	];

	const controls: { title: string; label: string; command: Command; icon: typeof TypeBold }[] = [
		{ title: 'Make selected text bold', label: 'Bold', command: 'bold', icon: TypeBold },
		{ title: 'Make selected text italic', label: 'Italic', command: 'italic', icon: TypeItalic },
		{ title: 'Underline selected text', label: 'Underline', command: 'underline', icon: TypeUnderline },
		{ title: 'Strike through selected text', label: 'Strike', command: 'strikeThrough', icon: TypeStrikethrough },
		{ title: 'Align text to the left', label: 'Left', command: 'justifyLeft', icon: TextLeft },
		{ title: 'Center text', label: 'Center', command: 'justifyCenter', icon: TextCenter },
		{ title: 'Align text to the right', label: 'Right', command: 'justifyRight', icon: TextRight },
		{ title: 'Justify text', label: 'Justify', command: 'justifyFull', icon: Justify },
		{ title: 'Create a numbered list', label: 'Numbered', command: 'insertOrderedList', icon: ListOl },
		{ title: 'Create a bullet list', label: 'Bullets', command: 'insertUnorderedList', icon: ListUl },
		{ title: 'Insert a link', label: 'Link', command: 'createLink', icon: Link45deg },
		{ title: 'Undo the last change', label: 'Undo', command: 'undo', icon: ArrowCounterclockwise },
		{ title: 'Redo the last change', label: 'Redo', command: 'redo', icon: ArrowClockwise }
	];

	onMount(() => {
		if (!editor) return;
		editor.innerHTML = value ?? '';

		const handleSelection = () => {
			saveSelection();
			selectionVersion++;
		};
		document.addEventListener('selectionchange', handleSelection);
		return () => document.removeEventListener('selectionchange', handleSelection);
	});

	function saveSelection() {
		if (!editor || htmlMode) return;
		const selection = window.getSelection();
		if (!selection?.rangeCount) return;
		const range = selection.getRangeAt(0);
		if (editor.contains(range.commonAncestorContainer)) savedRange = range.cloneRange();
	}

	function restoreSelection() {
		if (!savedRange || !editor) {
			editor?.focus();
			return;
		}
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(savedRange);
	}

	function emitChange() {
		if (!editor) return;
		value = editor.innerHTML;
		rawHtml = value;
		onChangeInput(editor);
	}

	function run(command: Command, commandValue?: string) {
		if (disabled || htmlMode || !editor) return;
		restoreSelection();

		if (command === 'createLink') {
			const url = window.prompt('Enter a URL');
			if (!url) return;
			commandValue = url;
		}

		document.execCommand(command, false, commandValue);
		editor.focus();
		saveSelection();
		selectionVersion++;
		emitChange();
	}

	function applySelect(command: 'formatBlock' | 'fontSize', event: Event) {
		if (!editor) return;
		const selectedValue = (event.currentTarget as HTMLSelectElement).value;
		restoreSelection();
		document.execCommand(command, false, command === 'formatBlock' ? `<${selectedValue}>` : selectedValue);
		editor.focus();
		saveSelection();
		selectionVersion++;
		emitChange();
	}

	function applyColor(command: 'foreColor' | 'hiliteColor', event: Event) {
		if (!editor) return;
		restoreSelection();
		document.execCommand(command, false, (event.currentTarget as HTMLInputElement).value);
		editor.focus();
		saveSelection();
		selectionVersion++;
		emitChange();
	}

	function isActive(command: Command) {
		selectionVersion;
		if (typeof document === 'undefined' || htmlMode) return false;
		try {
			return document.queryCommandState(command);
		} catch {
			return false;
		}
	}

	async function toggleHtmlMode() {
		if (disabled) return;
		if (!htmlMode) {
			rawHtml = editor?.innerHTML ?? value;
			htmlMode = true;
			return;
		}

		value = rawHtml;
		htmlMode = false;
		await tick();
		if (editor) editor.innerHTML = value;
		emitChange();
	}

	function updateRawHtml(event: Event) {
		rawHtml = (event.currentTarget as HTMLTextAreaElement).value;
		value = rawHtml;
	}

	export function getContent() {
		return htmlMode ? rawHtml : (editor?.innerHTML ?? value ?? '');
	}

	export function focus() {
		editor?.focus();
	}
</script>

<div class="w-full overflow-hidden rounded-lg border {errorMsg ? 'border-error' : 'border-border-primary'} bg-surface-primary shadow-sm">
	<div
		class="flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-border-primary bg-surface-secondary p-2"
		aria-label="Text formatting toolbar"
		role="toolbar"
	>
		<div class="relative w-28 shrink-0">
			<select
				aria-label="Paragraph and heading style"
				title="Paragraph and heading style"
				disabled={disabled || htmlMode}
				class="!h-8 !w-28 !rounded-md !border-border-primary !bg-surface-primary !px-2 !py-0 !pr-7 !text-xs !leading-4 font-medium !text-primary outline-none transition hover:!border-accent focus:!border-accent disabled:opacity-50"
				onmousedown={saveSelection}
				onchange={(event) => applySelect('formatBlock', event)}
			>
				{#each headings as heading (heading.value)}
					<option value={heading.value}>{heading.label}</option>
				{/each}
			</select>
			<ChevronDown
				class="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-tertiary"
			/>
		</div>

		<div class="relative w-20 shrink-0">
			<select
				aria-label="Font size in pixels"
				title="Font size in pixels"
				disabled={disabled || htmlMode}
				class="!h-8 !w-20 !rounded-md !border-border-primary !bg-surface-primary !px-2 !py-0 !pr-7 !text-xs !leading-4 font-medium !text-primary outline-none transition hover:!border-accent focus:!border-accent disabled:opacity-50"
				onmousedown={saveSelection}
				onchange={(event) => applySelect('fontSize', event)}
			>
				{#each fontSizes as size (size.value)}
					<option value={size.value}>{size.label}</option>
				{/each}
			</select>
			<ChevronDown
				class="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-tertiary"
			/>
		</div>

		<label
			class="grid size-8 shrink-0 place-items-center rounded-md border border-border-primary bg-surface-primary"
			title="Text color"
		>
			<span class="sr-only">Text color</span>
			<input
				type="color"
				title="Text color"
				aria-label="Text color"
				disabled={disabled || htmlMode}
				class="size-5 cursor-pointer border-0 bg-transparent p-0 disabled:opacity-50"
				onmousedown={saveSelection}
				onchange={(event) => applyColor('foreColor', event)}
			/>
		</label>

		<label
			class="grid size-8 shrink-0 place-items-center rounded-md border border-border-primary bg-surface-primary"
			title="Background highlight color"
		>
			<span class="sr-only">Background highlight color</span>
			<input
				type="color"
				title="Background highlight color"
				aria-label="Background highlight color"
				disabled={disabled || htmlMode}
				class="size-5 cursor-pointer border-0 bg-transparent p-0 disabled:opacity-50"
				onmousedown={saveSelection}
				onchange={(event) => applyColor('hiliteColor', event)}
			/>
		</label>

		<span class="mx-1 h-6 w-px shrink-0 bg-border-primary"></span>

		{#each controls as control (control.command)}
			<button
				type="button"
				title={control.title}
				aria-label={control.title}
				aria-pressed={isActive(control.command)}
				disabled={disabled || htmlMode}
				class="grid size-8 shrink-0 place-items-center rounded-md border p-0! transition disabled:cursor-not-allowed disabled:opacity-40 {isActive(
					control.command
				)
					? 'border-accent bg-accent/10 text-accent'
					: 'border-border-primary bg-surface-primary text-secondary hover:border-accent hover:text-accent'}"
				onmousedown={(event) => {
					event.preventDefault();
					saveSelection();
				}}
				onclick={() => run(control.command)}
			>
				<control.icon class="size-4" />
			</button>
		{/each}

		<span class="mx-1 h-6 w-px shrink-0 bg-border-primary"></span>

		<button
			type="button"
			title="Toggle HTML source"
			aria-label="Toggle HTML source"
			aria-pressed={htmlMode}
			disabled={disabled}
			class="grid size-8 shrink-0 place-items-center rounded-md border p-0! transition disabled:opacity-40 {htmlMode
				? 'border-accent bg-accent/10 text-accent'
				: 'border-border-primary bg-surface-primary text-secondary hover:border-accent hover:text-accent'}"
			onclick={toggleHtmlMode}
		>
			<CodeSlash class="size-4" />
		</button>
	</div>

	{#if htmlMode}
		<textarea
			id="{uniqRef}source"
			aria-label="{ariaLabel} HTML source"
			required={required}
			disabled={disabled}
			value={rawHtml}
			class="min-h-64 w-full resize-y border-0 bg-surface-primary p-4 font-mono text-sm leading-6 text-primary outline-none disabled:opacity-60"
			oninput={updateRawHtml}
		></textarea>
	{:else}
		<div class="relative">
			{#if !value}
				<span class="pointer-events-none absolute top-4 left-4 text-sm text-tertiary">{placeholder}</span>
			{/if}
			<div
				bind:this={editor}
				id="{uniqRef}content"
				role="textbox"
				tabindex={disabled ? -1 : 0}
				aria-label={ariaLabel}
				aria-multiline="true"
				aria-required={required}
				contenteditable={!disabled}
				spellcheck="true"
				class="min-h-64 overflow-auto bg-surface-primary p-4 text-sm leading-6 text-primary outline-none [&_a]:text-accent [&_a]:underline [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
				oninput={emitChange}
				onkeyup={saveSelection}
				onmouseup={saveSelection}
			></div>
		</div>
	{/if}
</div>

{#if errorMsg}
	<p class="mt-1.5 text-xs text-error">{errorMsg}</p>
{/if}

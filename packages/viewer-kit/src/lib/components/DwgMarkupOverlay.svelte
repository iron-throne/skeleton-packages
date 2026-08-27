<script module lang="ts">
	export type DwgMarkupTool =
		'navigate' | 'select' | 'freehand' | 'arrow' | 'rectangle' | 'text' | 'comment';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { screenToWorld, worldToScreen, type ViewTransform } from '@cadview/core';
	import type { DwgMarkup, DwgMarkupStyle, DwgWorldPoint } from '../utils/dwg-markup';

	type DraftMarkup =
		| { type: 'freehand'; points: DwgWorldPoint[] }
		| { type: 'arrow' | 'rectangle'; start: DwgWorldPoint; end: DwgWorldPoint };

	interface Props {
		enabled: boolean;
		tool: DwgMarkupTool;
		view: ViewTransform;
		presentationId: string;
		markups: DwgMarkup[];
		selectedId?: string;
		color: string;
		strokeWidth: number;
		draftText: string;
		oncreate?: (markup: DwgMarkup) => void;
		onselect?: (id?: string) => void;
		ondelete?: () => void;
		onundo?: () => void;
		onredo?: () => void;
		onzoom?: (factor: number) => void;
	}

	let {
		enabled,
		tool,
		view,
		presentationId,
		markups,
		selectedId,
		color,
		strokeWidth,
		draftText,
		oncreate,
		onselect,
		ondelete,
		onundo,
		onredo,
		onzoom
	}: Props = $props();

	let svg: SVGSVGElement;
	let dimensions = $state({ width: 1, height: 1 });
	let draft = $state<DraftMarkup>();
	let activePointer = -1;
	let lastSample = { x: 0, y: 0 };
	let visibleMarkups = $derived(
		markups.filter((markup) => markup.presentationId === presentationId)
	);

	function markupId() {
		return (
			globalThis.crypto?.randomUUID?.() ??
			`markup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
		);
	}

	function now() {
		return new Date().toISOString();
	}

	function style(): DwgMarkupStyle {
		return { color, strokeWidth };
	}

	function screenPoint(point: DwgWorldPoint) {
		const [x, y] = worldToScreen(view, point.x, point.y);
		return { x, y };
	}

	function worldPoint(screenX: number, screenY: number): DwgWorldPoint {
		const [x, y] = screenToWorld(view, screenX, screenY);
		return { x, y };
	}

	function localPoint(event: PointerEvent) {
		const bounds = svg.getBoundingClientRect();
		return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
	}

	function path(points: DwgWorldPoint[]) {
		return points
			.map((point, index) => {
				const projected = screenPoint(point);
				return `${index ? 'L' : 'M'} ${projected.x.toFixed(2)} ${projected.y.toFixed(2)}`;
			})
			.join(' ');
	}

	function common<TType extends DwgMarkup['type']>(type: TType) {
		const timestamp = now();
		return {
			id: markupId(),
			type,
			presentationId,
			createdAt: timestamp,
			updatedAt: timestamp,
			style: style()
		};
	}

	function pointerDown(event: PointerEvent) {
		if (!enabled || event.button !== 0) return;
		if (tool === 'select') {
			onselect?.();
			return;
		}
		if (tool === 'navigate') return;

		const screen = localPoint(event);
		const point = worldPoint(screen.x, screen.y);
		if (tool === 'comment') {
			const comment = draftText.trim();
			if (!comment) return;
			oncreate?.({ ...common('comment'), position: point, comment, resolved: false });
			return;
		}
		if (tool === 'text') {
			const text = draftText.trim();
			if (!text) return;
			oncreate?.({ ...common('text'), position: point, text });
			return;
		}

		activePointer = event.pointerId;
		lastSample = screen;
		if (tool === 'freehand') draft = { type: 'freehand', points: [point] };
		else if (tool === 'arrow' || tool === 'rectangle')
			draft = { type: tool, start: point, end: point };
		else return;
		svg.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function pointerMove(event: PointerEvent) {
		if (event.pointerId !== activePointer || !draft) return;
		const screen = localPoint(event);
		const point = worldPoint(screen.x, screen.y);
		if (draft.type === 'freehand') {
			if (Math.hypot(screen.x - lastSample.x, screen.y - lastSample.y) < 2) return;
			if (draft.points.length >= 4000) return;
			draft = { ...draft, points: [...draft.points, point] };
			lastSample = screen;
		} else {
			draft = { ...draft, end: point };
		}
	}

	function pointerUp(event: PointerEvent) {
		if (event.pointerId !== activePointer || !draft) return;
		if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
		const completed = draft;
		draft = undefined;
		activePointer = -1;
		if (completed.type === 'freehand') {
			if (completed.points.length > 1) {
				oncreate?.({ ...common('freehand'), points: completed.points });
			}
			return;
		}
		const start = screenPoint(completed.start);
		const end = screenPoint(completed.end);
		if (Math.hypot(end.x - start.x, end.y - start.y) < 3) return;
		if (completed.type === 'arrow') {
			oncreate?.({ ...common('arrow'), start: completed.start, end: completed.end });
		} else {
			oncreate?.({ ...common('rectangle'), start: completed.start, end: completed.end });
		}
	}

	function pointerCancel(event: PointerEvent) {
		if (event.pointerId !== activePointer) return;
		draft = undefined;
		activePointer = -1;
	}

	function selectMarkup(event: PointerEvent, id: string) {
		if (!enabled || tool !== 'select') return;
		event.stopPropagation();
		onselect?.(id);
	}

	function keydown(event: KeyboardEvent) {
		if (!enabled) return;
		if (event.key === 'Escape') {
			if (draft || selectedId) {
				event.preventDefault();
				draft = undefined;
				onselect?.();
			}
			return;
		}
		if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
			event.preventDefault();
			ondelete?.();
			return;
		}
		if (!(event.ctrlKey || event.metaKey)) return;
		if (event.key.toLowerCase() === 'z') {
			event.preventDefault();
			if (event.shiftKey) onredo?.();
			else onundo?.();
		} else if (event.key.toLowerCase() === 'y') {
			event.preventDefault();
			onredo?.();
		}
	}

	function wheel(event: WheelEvent) {
		if (!enabled) return;
		event.preventDefault();
		onzoom?.(Math.exp(-event.deltaY * 0.0015));
	}

	onMount(() => {
		const resize = () => {
			dimensions = {
				width: Math.max(1, svg.clientWidth),
				height: Math.max(1, svg.clientHeight)
			};
		};
		const observer = new ResizeObserver(resize);
		observer.observe(svg);
		svg.addEventListener('wheel', wheel, { passive: false });
		resize();
		return () => {
			observer.disconnect();
			svg.removeEventListener('wheel', wheel);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svg
	bind:this={svg}
	viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
	class={`absolute inset-0 z-10 size-full outline-none ${enabled ? 'pointer-events-auto touch-none' : 'pointer-events-none'}`}
	role="application"
	aria-label="Drawing markup layer"
	aria-hidden={!enabled}
	tabindex={enabled ? 0 : -1}
	onpointerdown={pointerDown}
	onpointermove={pointerMove}
	onpointerup={pointerUp}
	onpointercancel={pointerCancel}
	onkeydown={keydown}
>
	<defs>
		<marker
			id="dwg-markup-arrow"
			viewBox="0 0 10 10"
			refX="9"
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
		</marker>
	</defs>

	{#each visibleMarkups as markup (markup.id)}
		{@const selected = markup.id === selectedId}
		{@const stroke = selected ? '#38bdf8' : markup.style.color}
		{@const width = markup.style.strokeWidth + (selected ? 2 : 0)}
		{#if markup.type === 'freehand'}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<path
				d={path(markup.points)}
				fill="none"
				{stroke}
				stroke-width={width}
				stroke-linecap="round"
				stroke-linejoin="round"
				class={enabled && tool === 'select' ? 'pointer-events-stroke cursor-pointer' : ''}
				onpointerdown={(event) => selectMarkup(event, markup.id)}
			/>
		{:else if markup.type === 'arrow'}
			{@const start = screenPoint(markup.start)}
			{@const end = screenPoint(markup.end)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<line
				x1={start.x}
				y1={start.y}
				x2={end.x}
				y2={end.y}
				{stroke}
				stroke-width={width}
				stroke-linecap="round"
				marker-end="url(#dwg-markup-arrow)"
				class={enabled && tool === 'select' ? 'pointer-events-stroke cursor-pointer' : ''}
				onpointerdown={(event) => selectMarkup(event, markup.id)}
			/>
		{:else if markup.type === 'rectangle'}
			{@const start = screenPoint(markup.start)}
			{@const end = screenPoint(markup.end)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<rect
				x={Math.min(start.x, end.x)}
				y={Math.min(start.y, end.y)}
				width={Math.abs(end.x - start.x)}
				height={Math.abs(end.y - start.y)}
				fill={selected ? 'rgba(56, 189, 248, 0.08)' : 'transparent'}
				{stroke}
				stroke-width={width}
				class={enabled && tool === 'select' ? 'pointer-events-all cursor-pointer' : ''}
				onpointerdown={(event) => selectMarkup(event, markup.id)}
			/>
		{:else if markup.type === 'text'}
			{@const position = screenPoint(markup.position)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<text
				x={position.x}
				y={position.y}
				fill={stroke}
				stroke={selected ? '#0f172a' : 'none'}
				stroke-width={selected ? 3 : 0}
				paint-order="stroke"
				font-size="15"
				font-weight="700"
				class={enabled && tool === 'select'
					? 'pointer-events-all cursor-pointer select-none'
					: 'select-none'}
				onpointerdown={(event) => selectMarkup(event, markup.id)}>{markup.text}</text
			>
		{:else}
			{@const position = screenPoint(markup.position)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				class={enabled && tool === 'select' ? 'pointer-events-all cursor-pointer' : ''}
				onpointerdown={(event) => selectMarkup(event, markup.id)}
			>
				<circle
					cx={position.x}
					cy={position.y}
					r={selected ? 13 : 11}
					fill={markup.resolved ? '#16a34a' : markup.style.color}
					stroke={selected ? '#38bdf8' : '#ffffff'}
					stroke-width={selected ? 3 : 2}
				/>
				<text
					x={position.x}
					y={position.y + 4}
					text-anchor="middle"
					font-size="12"
					font-weight="800"
					fill="#ffffff"
					class="pointer-events-none select-none">!</text
				>
			</g>
		{/if}
	{/each}

	{#if draft?.type === 'freehand'}
		<path
			d={path(draft.points)}
			fill="none"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
			class="pointer-events-none"
		/>
	{:else if draft?.type === 'arrow'}
		{@const start = screenPoint(draft.start)}
		{@const end = screenPoint(draft.end)}
		<line
			x1={start.x}
			y1={start.y}
			x2={end.x}
			y2={end.y}
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			marker-end="url(#dwg-markup-arrow)"
			class="pointer-events-none"
		/>
	{:else if draft?.type === 'rectangle'}
		{@const start = screenPoint(draft.start)}
		{@const end = screenPoint(draft.end)}
		<rect
			x={Math.min(start.x, end.x)}
			y={Math.min(start.y, end.y)}
			width={Math.abs(end.x - start.x)}
			height={Math.abs(end.y - start.y)}
			fill="transparent"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-dasharray="6 4"
			class="pointer-events-none"
		/>
	{/if}
</svg>

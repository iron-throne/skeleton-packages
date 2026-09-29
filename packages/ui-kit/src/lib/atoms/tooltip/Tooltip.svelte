<script lang="ts">
	import { fade } from 'svelte/transition';
	import { portal } from '@aryagg/utils';
	import type { Snippet } from 'svelte';

	type Position = 'top' | 'bottom' | 'left' | 'right';

	let {
		text,
		position = 'top',
		children
	}: {
		text: string;
		position?: Position;
		children: Snippet;
	} = $props();

	const gap = 12;

	let wrapperEl = $state<HTMLDivElement>();
	let show = $state(false);
	let panelStyle = $state('');

	// The tooltip is portaled to <body> and positioned with `fixed` coordinates computed
	// from the wrapper's own screen position, instead of `absolute` inside the wrapper -
	// so it isn't clipped by a scrollable/overflow-hidden ancestor (e.g. a modal or table cell).
	function positionTooltip() {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();

		if (position === 'top') {
			panelStyle = `bottom:${window.innerHeight - rect.top + gap}px; left:${rect.left + rect.width / 2}px; transform:translateX(-50%);`;
		} else if (position === 'bottom') {
			panelStyle = `top:${rect.bottom + gap}px; left:${rect.left + rect.width / 2}px; transform:translateX(-50%);`;
		} else if (position === 'left') {
			panelStyle = `top:${rect.top + rect.height / 2}px; right:${window.innerWidth - rect.left + gap}px; transform:translateY(-50%);`;
		} else {
			panelStyle = `top:${rect.top + rect.height / 2}px; left:${rect.right + gap}px; transform:translateY(-50%);`;
		}
	}

	function open() {
		positionTooltip();
		show = true;
	}

	function close() {
		show = false;
	}

	// A `fixed` position won't follow the trigger on its own if a scrollable ancestor
	// scrolls or the viewport resizes, so keep it in sync while the tooltip is shown.
	$effect(() => {
		if (!show) return;
		window.addEventListener('scroll', positionTooltip, true);
		window.addEventListener('resize', positionTooltip);
		return () => {
			window.removeEventListener('scroll', positionTooltip, true);
			window.removeEventListener('resize', positionTooltip);
		};
	});
</script>

<div
	bind:this={wrapperEl}
	role="presentation"
	class="relative inline-flex"
	onmouseenter={open}
	onmouseleave={close}
	onfocusin={open}
	onfocusout={close}
>
	{@render children()}
</div>

{#if show}
	<div
		use:portal
		role="tooltip"
		style={panelStyle}
		transition:fade={{ duration: 100 }}
		class="bg-surface-primary text-content-secondary pointer-events-none fixed z-60
               rounded-md border
               px-2.5 py-1.5 text-xs whitespace-nowrap
               shadow-md"
	>
		{text}
	</div>
{/if}

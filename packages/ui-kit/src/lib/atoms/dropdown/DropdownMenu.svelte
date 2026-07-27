<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { clickOutside, portal } from '@aryagg/utils';
	import { type IMenu, EMenuAlign } from '@aryagg/types';
	import DropdownMenuItem from './DropdownMenuItem.svelte';

	let {
		menus,
		align = EMenuAlign.RIGHT,
		placement = 'bottom',
		trigger,
		menuClass
	}: {
		menus: IMenu[];
		align?: EMenuAlign;
		/**
		 * Where the panel opens relative to its trigger:
		 * - `'bottom'` (default): a regular dropdown, opening below the trigger and
		 *   hugging its left/right edge per `align`.
		 * - `'top'`: opens above the trigger instead, e.g. for a trigger pinned to the
		 *   bottom of the screen where there's no room to open downward.
		 * - `'side'`: a flyout opening beside the trigger (used e.g. by an icon rail),
		 *   top-aligned, on the edge opposite `align`.
		 */
		placement?: 'bottom' | 'top' | 'side';
		menuClass?: string;
		/** The element that opens/closes the menu */
		trigger: Snippet<[{ open: boolean; toggle: () => void }]>;
	} = $props();

	let open = $state(false);
	let wrapperEl: HTMLDivElement | undefined;

	// The panel is portaled to <body> and positioned with `fixed` + these inline coordinates
	// (computed from the trigger wrapper's own screen position) instead of `absolute` inside
	// this wrapper. `absolute` would get clipped by any `overflow: hidden/auto/scroll`
	// ancestor the trigger happens to sit in (a modal, a table cell, a collapsing sidebar) -
	// escaping to <body> sidesteps that regardless of where the trigger lives in the tree.
	let panelStyle = $state('');
	const gap = 8;

	function positionPanel() {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();

		if (placement === 'side') {
			panelStyle =
				align === EMenuAlign.RIGHT
					? `position:fixed; top:${rect.top}px; right:${window.innerWidth - rect.left + gap}px; transform-origin:top right;`
					: `position:fixed; top:${rect.top}px; left:${rect.right + gap}px; transform-origin:top left;`;
		} else if (placement === 'top') {
			const vSide = `bottom:${window.innerHeight - rect.top + gap}px;`;
			panelStyle =
				align === EMenuAlign.RIGHT
					? `position:fixed; ${vSide} right:${window.innerWidth - rect.right}px; transform-origin:bottom right;`
					: `position:fixed; ${vSide} left:${rect.left}px; transform-origin:bottom left;`;
		} else {
			const vSide = `top:${rect.bottom + gap}px;`;
			panelStyle =
				align === EMenuAlign.RIGHT
					? `position:fixed; ${vSide} right:${window.innerWidth - rect.right}px; transform-origin:top right;`
					: `position:fixed; ${vSide} left:${rect.left}px; transform-origin:top left;`;
		}
	}

	function close() {
		open = false;
	}

	function toggle() {
		if (!open) positionPanel();
		open = !open;
	}

	// Keeps the panel aligned with its trigger while open (a `fixed` position won't follow it
	// on its own if a scrollable ancestor scrolls or the viewport resizes), and closes it on
	// Escape - the panel is portaled out of this wrapper, so focus inside it wouldn't otherwise
	// bubble a keydown back up to the wrapper's own handler.
	$effect(() => {
		if (!open) return;

		function reposition() {
			positionPanel();
		}
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
		}

		window.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition);
		document.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('scroll', reposition, true);
			window.removeEventListener('resize', reposition);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div bind:this={wrapperEl} role="presentation" class="relative inline-block w-full" use:clickOutside={close}>
	<!-- Trigger slot -->
	{@render trigger({ open, toggle })}

	<!-- Menu panel: portaled to <body> and positioned with fixed coordinates. -->
	{#if open}
		<div
			use:portal
			data-dropdown-menu
			style={panelStyle}
			transition:scale={{ duration: 160, start: 0.94, opacity: 0, easing: cubicOut }}
			class="bg-surface-primary! border-border-primary fixed z-50 min-w-48 max-h-96 overflow-y-auto
				rounded-xl border p-2 shadow-xl {menuClass}"
			role="menu"
		>
			{#each menus as menu, ind (menu.id ?? ind)}
				<DropdownMenuItem {menu} {align} onNavigate={close} />
			{/each}
		</div>
	{/if}
</div>

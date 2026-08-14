<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { clickOutside, portal } from '@aryagg/utils';
	import DropdownMenuItem from './DropdownMenuItem.svelte';
	import type { DropdownItem, DropdownMenuProps } from './types';

	let {
		menus,
		align = 'right',
		placement = 'bottom',
		variant = 'v3',
		width = 200,
		maxHeight = '24rem',
		gap = 8,
		trigger,
		header,
		footer,
		menuClass,
		activeKlass,
		selected = $bindable(),
		closeOnSelect = true,
		onSelect
	}: DropdownMenuProps = $props();

	let open = $state(false);
	let wrapperEl = $state<HTMLDivElement>();

	// The panel is portaled to <body> and positioned with `fixed` + these inline coordinates
	// (computed from the trigger wrapper's own screen position) instead of `absolute` inside
	// this wrapper. `absolute` would get clipped by any `overflow: hidden/auto/scroll`
	// ancestor the trigger happens to sit in (a modal, a table cell, a collapsing sidebar) -
	// escaping to <body> sidesteps that regardless of where the trigger lives in the tree.
	let panelStyle = $state('');
	const panelWidth = $derived(typeof width === 'number' ? `${width}px` : width);

	function positionPanel() {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();

		if (placement === 'side') {
			panelStyle =
				align === 'right'
					? `position:fixed; top:${rect.top}px; right:${window.innerWidth - rect.left + gap}px; transform-origin:top right;`
					: `position:fixed; top:${rect.top}px; left:${rect.right + gap}px; transform-origin:top left;`;
		} else if (placement === 'top') {
			const vSide = `bottom:${window.innerHeight - rect.top + gap}px;`;
			panelStyle =
				align === 'right'
					? `position:fixed; ${vSide} right:${window.innerWidth - rect.right}px; transform-origin:bottom right;`
					: `position:fixed; ${vSide} left:${rect.left}px; transform-origin:bottom left;`;
		} else {
			const vSide = `top:${rect.bottom + gap}px;`;
			panelStyle =
				align === 'right'
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

	function selectItem(item: DropdownItem) {
		selected = item.id;
		item.onclick?.();
		onSelect?.(item);
		if (closeOnSelect) close();
	}

	// Keeps the panel aligned with its trigger while open (a `fixed` position won't follow it
	// on its own if a scrollable ancestor scrolls or the viewport resizes), and closes it on
	// Escape - the panel is portaled out of this wrapper, so focus inside it wouldn't otherwise
	// bubble a keydown back up to the wrapper's own handler.
	$effect(() => {
		if (!open) return;

		function reposition() {
			// The trigger can become hidden out from under an open panel (e.g. a
			// responsive layout swapping it for a different trigger past a
			// breakpoint) without ever calling close(). Since the panel is
			// portaled to <body>, it would otherwise keep floating with no
			// trigger left to dismiss it.
			const rect = wrapperEl?.getBoundingClientRect();
			if (!rect || (rect.width === 0 && rect.height === 0)) {
				close();
				return;
			}
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

<div
	bind:this={wrapperEl}
	role="presentation"
	class="relative inline-block w-full text-sm"
	use:clickOutside={close}
>
	<!-- Trigger slot -->
	{@render trigger({ open, toggle, close })}

	<!-- Menu panel: portaled to <body> and positioned with fixed coordinates. -->
	{#if open}
		<div
			use:portal
			data-dropdown-menu
			style={panelStyle}
			style:width={panelWidth}
			style:max-height={maxHeight}
			transition:scale={{ duration: 160, start: 0.94, opacity: 0, easing: cubicOut }}
			class="fixed z-60 min-w-40 overflow-auto border border-border-primary bg-surface-primary shadow-lg {variant ===
			'rounded'
				? 'rounded-xl'
				: 'rounded-lg'} {menuClass ?? ''}"
			role="menu"
		>
			{#if header}
				<div class="border-b border-border-primary px-3.5 py-3">{@render header({ close })}</div>
			{/if}
			<div class={variant === 'rounded' ? 'p-2' : 'py-1'}>
				{#each menus as menu, ind (menu.id ?? ind)}
					<DropdownMenuItem
						{menu}
						{align}
						{variant}
						onNavigate={selectItem}
						bind:selected
						{activeKlass}
					/>
				{/each}
			</div>
			{#if footer}
				<div class="border-t border-border-primary px-3.5 py-3">{@render footer({ close })}</div>
			{/if}
		</div>
	{/if}
</div>

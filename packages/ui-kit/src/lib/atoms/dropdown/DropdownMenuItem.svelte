<script lang="ts">
	import DropdownMenuItem from './DropdownMenuItem.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { type IMenu, EMenuAlign } from '@aryagg/types';
	import { portal } from '@aryagg/utils';
	import { CaretRightFill } from 'svelte-bootstrap-icons';
	import Icon from '../icon/Icon.svelte';

	let {
		menu,
		align,
		onNavigate
	}: {
		menu: IMenu;
		align: EMenuAlign;
		/** Called when a leaf item is activated, so the root DropdownMenu can close itself. */
		onNavigate: () => void;
	} = $props();

	// A menu item with children is itself a trigger for a nested flyout, so it recurses
	// via a self-import for each child - one component instance per menu-tree level.
	let isOpen = $state(false);
	let closeTimer: ReturnType<typeof setTimeout>;
	let triggerEl: HTMLButtonElement | null = $state(null);

	// The flyout is portaled to <body> and positioned with `fixed` + these inline coordinates
	// (computed from the trigger's own screen position) rather than `absolute` inside this row.
	// A parent panel is typically `overflow-y-auto` to cap its height, and CSS forces
	// `overflow-x` to clip too whenever `overflow-y` isn't `visible` - so an `absolute` flyout
	// that pops out sideways gets cut off by that ancestor. Escaping to <body> sidesteps it.
	let submenuStyle = $state('');
	const gap = 4;

	function positionSubmenu() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		submenuStyle =
			align === EMenuAlign.RIGHT
				? `top:${rect.top}px; right:${window.innerWidth - rect.left + gap}px;`
				: `top:${rect.top}px; left:${rect.right + gap}px;`;
	}

	function openSubmenu() {
		clearTimeout(closeTimer);
		positionSubmenu();
		isOpen = true;
	}

	// Keeps the flyout aligned with its trigger while open, since a `fixed` position won't
	// follow it on its own if a scrollable ancestor (e.g. the parent panel's own
	// `overflow-y-auto`) scrolls, or the viewport resizes. `scroll` doesn't bubble, so this
	// listens in the capture phase to catch it from any descendant, not just window itself.
	$effect(() => {
		if (!isOpen) return;
		function reposition() {
			positionSubmenu();
		}
		document.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition);
		return () => {
			document.removeEventListener('scroll', reposition, true);
			window.removeEventListener('resize', reposition);
		};
	});

	function cancelCloseSubmenu() {
		clearTimeout(closeTimer);
	}

	function scheduleCloseSubmenu() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => (isOpen = false), 150);
	}

	function itemClass(m: IMenu) {
		if (m.disabled) return 'cursor-not-allowed text-tertiary opacity-50';
		if (m.danger) return 'text-error hover:bg-error/10';
		if (m.selected) return 'bg-accent/10 text-accent';
		return 'hover:text-primary hover:bg-surface-secondary text-secondary';
	}
</script>

{#snippet menuIcon(m: IMenu)}
	<Icon icon={m.selected && m.selectedIcon ? m.selectedIcon : m.icon} klass="opacity-70 size-15"/>
{/snippet}

{#if menu.divider}
	<div class="border-border-primary my-1 border-t"></div>
{/if}

{#if menu.children?.length}
	<div
		class="relative"
		role="none"
		onmouseenter={openSubmenu}
		onmouseleave={scheduleCloseSubmenu}
	>
		<button
			bind:this={triggerEl}
			type="button"
			role="menuitem"
			disabled={menu.disabled}
			aria-haspopup="true"
			aria-expanded={isOpen}
			class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 transition-colors duration-150 {itemClass(
				menu
			)} {menu.class ?? ''}"
		>
			{@render menuIcon(menu)}
			<span class="flex-1 text-left">{menu.label}</span>
			<CaretRightFill
				class="size-2.5 shrink-0 text-tertiary opacity-70 {align === EMenuAlign.RIGHT
					? 'rotate-180'
					: ''}"
			/>
		</button>
		{#if isOpen}
			<div
				use:portal
				data-dropdown-menu
				style={submenuStyle}
				transition:scale={{ duration: 140, start: 0.94, opacity: 0, easing: cubicOut }}
				class="bg-surface-primary! border-border-primary fixed z-50 min-w-44 max-h-96 overflow-y-auto
					rounded-xl border p-2 shadow-xl"
				role="menu"
				tabindex="-1"
				onmouseenter={cancelCloseSubmenu}
				onmouseleave={scheduleCloseSubmenu}
			>
				{#each menu.children as child, childIndex (child.id ?? childIndex)}
					<DropdownMenuItem menu={child} {align} {onNavigate} />
				{/each}
			</div>
		{/if}
	</div>
{:else if menu.href && !menu.disabled}
	<a
		role="menuitem"
		href={menu.href}
		aria-current={menu.selected ? 'page' : undefined}
		onclick={() => {
			menu.onclick?.();
			onNavigate();
		}}
		class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 no-underline transition-colors duration-150 {itemClass(
			menu
		)} {menu.class ?? ''}"
	>
		{@render menuIcon(menu)}
		{menu.label}
	</a>
{:else}
	<button
		type="button"
		role="menuitem"
		disabled={menu.disabled}
		onclick={() => {
			menu.onclick?.();
			onNavigate();
		}}
		class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 transition-colors duration-150 {itemClass(
			menu
		)} {menu.class ?? ''}"
	>
		{@render menuIcon(menu)}
		{menu.label}
	</button>
{/if}

<script lang="ts">
	import DropdownMenuItem from './DropdownMenuItem.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { portal } from '@aryagg/utils';
	import { CaretRightFill } from 'svelte-bootstrap-icons';
	import Icon from '../icon/Icon.svelte';
	import type { DropdownItem, DropdownVariant } from './types';

	let {
		menu,
		align,
		variant,
		onNavigate,
		selected = $bindable(),
		activeKlass = ''
	}: {
		menu: DropdownItem;
		align: 'left' | 'right';
		variant: DropdownVariant;
		/** Called when a leaf item is activated, so the root DropdownMenu can close itself. */
		onNavigate: (item: DropdownItem) => void;
		/** id of the last-clicked leaf item, two-way bound up through the whole menu tree. */
		selected?: string;
		/** Extra class(es) applied to any item while it is selected - common to all items, independent of each item's own `class`. */
		activeKlass?: string;
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
			align === 'right'
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

	function isSelected(m: DropdownItem) {
		return Boolean(m.selected) || (m.id !== undefined && m.id === selected);
	}

	function iconKlass(m: DropdownItem) {
		return (isSelected(m) ? m.selectedIconClass || m.iconClass : m.iconClass) ?? '';
	}

	function itemClass(m: DropdownItem) {
		return `flex min-h-9 w-full items-center gap-[9px] border-0 bg-transparent px-3.5 py-2 text-left text-[13px]  no-underline transition-colors hover:bg-surface-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 ${
			variant === 'rounded' ? 'rounded-lg' : ''
		} ${isSelected(m) ? `bg-accent/10 font-semibold text-accent ${activeKlass}` : ''} ${
			m.danger ? 'text-error' : 'text-secondary'
		} ${m.class ?? ''}`;
	}
</script>

{#snippet menuIcon(m: DropdownItem)}
	<Icon
		icon={isSelected(m) && m.selectedIcon ? m.selectedIcon || m.icon : m.icon}
		klass="size-4 shrink-0 opacity-70 {iconKlass(m)}"
	/>
{/snippet}

{#if menu.divider}
	<div class="my-1 h-px bg-border-primary"></div>
{/if}

{#if menu.children?.length}
	<div class="relative" role="none" onmouseenter={openSubmenu} onmouseleave={scheduleCloseSubmenu}>
		<button
			bind:this={triggerEl}
			type="button"
			role="menuitem"
			disabled={menu.disabled}
			aria-haspopup="true"
			aria-expanded={isOpen}
			class={itemClass(menu)}
		>
			{@render menuIcon(menu)}
			<span class="flex-1 text-left">{menu.label}</span>
			<CaretRightFill
				class="size-2.5 shrink-0 text-tertiary opacity-70 {align === 'right' ? 'rotate-180' : ''}"
			/>
		</button>
		{#if isOpen}
			<div
				use:portal
				data-dropdown-menu
				style={submenuStyle}
				transition:scale={{ duration: 140, start: 0.94, opacity: 0, easing: cubicOut }}
				class="fixed z-[61] max-h-96 min-w-45 overflow-y-auto border border-border-primary bg-surface-primary shadow-lg {variant ===
				'rounded'
					? 'rounded-xl p-2'
					: 'rounded-lg py-1'}"
				role="menu"
				tabindex="-1"
				onmouseenter={cancelCloseSubmenu}
				onmouseleave={scheduleCloseSubmenu}
			>
				{#each menu.children as child, childIndex (child.id ?? childIndex)}
					<DropdownMenuItem
						menu={child}
						{align}
						{variant}
						{onNavigate}
						bind:selected
						{activeKlass}
					/>
				{/each}
			</div>
		{/if}
	</div>
{:else if menu.href && !menu.disabled}
	<a
		role="menuitem"
		href={menu.href}
		aria-current={isSelected(menu) ? 'page' : undefined}
		onclick={() => {
			onNavigate(menu);
		}}
		class={itemClass(menu)}
	>
		{@render menuIcon(menu)}
		<span class="flex min-w-0 flex-1 flex-col"
			><span>{menu.label}</span>{#if menu.description}<small
					class="mt-px text-[10.5px] font-normal text-tertiary">{menu.description}</small
				>{/if}</span
		>
		{#if menu.badge !== undefined}<span
				class="rounded-full bg-surface-tertiary px-[5px] py-px text-[10px] font-bold text-tertiary"
				>{menu.badge}</span
			>{/if}
		{#if menu.shortcut}<kbd class="font-mono text-[9px] text-tertiary">{menu.shortcut}</kbd>{/if}
	</a>
{:else}
	<button
		type="button"
		role="menuitem"
		disabled={menu.disabled}
		onclick={() => {
			onNavigate(menu);
		}}
		class={itemClass(menu)}
	>
		{@render menuIcon(menu)}
		<span class="flex min-w-0 flex-1 flex-col"
			><span>{menu.label}</span>{#if menu.description}<small
					class="mt-px text-[10.5px] font-normal text-tertiary">{menu.description}</small
				>{/if}</span
		>
		{#if menu.badge !== undefined}<span
				class="rounded-full bg-surface-tertiary px-[5px] py-px text-[10px] font-bold text-tertiary"
				>{menu.badge}</span
			>{/if}
		{#if menu.shortcut}<kbd class="font-mono text-[9px] text-tertiary">{menu.shortcut}</kbd>{/if}
	</button>
{/if}

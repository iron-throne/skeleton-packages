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
		selected = $bindable()
	}: {
		menu: DropdownItem;
		align: 'left' | 'right';
		variant: DropdownVariant;
		/** Called when a leaf item is activated, so the root DropdownMenu can close itself. */
		onNavigate: (item: DropdownItem) => void;
		/** id of the last-clicked leaf item, two-way bound up through the whole menu tree. */
		selected?: string;
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
</script>

{#snippet menuIcon(m: DropdownItem)}
	<Icon
		icon={isSelected(m) && m.selectedIcon ? m.selectedIcon || m.icon : m.icon}
		klass="ui-dropdown-item__icon {iconKlass(m)}"
	/>
{/snippet}

{#if menu.divider}
	<div class="ui-dropdown-item__divider"></div>
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
			class="ui-dropdown-item ui-dropdown-item--{variant} {isSelected(menu)
				? 'ui-dropdown-item--selected'
				: ''} {menu.danger ? 'ui-dropdown-item--danger' : ''} {menu.class ?? ''}"
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
				class="ui-dropdown-submenu ui-dropdown-submenu--{variant}"
				role="menu"
				tabindex="-1"
				onmouseenter={cancelCloseSubmenu}
				onmouseleave={scheduleCloseSubmenu}
			>
				{#each menu.children as child, childIndex (child.id ?? childIndex)}
					<DropdownMenuItem menu={child} {align} {variant} {onNavigate} bind:selected />
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
		class="ui-dropdown-item ui-dropdown-item--{variant} {isSelected(menu)
			? 'ui-dropdown-item--selected'
			: ''} {menu.danger ? 'ui-dropdown-item--danger' : ''} {menu.class ?? ''}"
	>
		{@render menuIcon(menu)}
		<span class="ui-dropdown-item__content"
			><span>{menu.label}</span>{#if menu.description}<small>{menu.description}</small>{/if}</span
		>
		{#if menu.badge !== undefined}<span class="ui-dropdown-item__badge">{menu.badge}</span>{/if}
		{#if menu.shortcut}<kbd>{menu.shortcut}</kbd>{/if}
	</a>
{:else}
	<button
		type="button"
		role="menuitem"
		disabled={menu.disabled}
		onclick={() => {
			onNavigate(menu);
		}}
		class="ui-dropdown-item ui-dropdown-item--{variant} {isSelected(menu)
			? 'ui-dropdown-item--selected'
			: ''} {menu.danger ? 'ui-dropdown-item--danger' : ''} {menu.class ?? ''}"
	>
		{@render menuIcon(menu)}
		<span class="ui-dropdown-item__content"
			><span>{menu.label}</span>{#if menu.description}<small>{menu.description}</small>{/if}</span
		>
		{#if menu.badge !== undefined}<span class="ui-dropdown-item__badge">{menu.badge}</span>{/if}
		{#if menu.shortcut}<kbd>{menu.shortcut}</kbd>{/if}
	</button>
{/if}

<style>
	.ui-dropdown-item {
		display: flex;
		align-items: center;
		gap: 9px;
		width: 100%;
		min-height: 36px;
		padding: 8px 14px;
		border: 0;
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		font-size: 13px;
		text-align: left;
		text-decoration: none;
		transition:
			background 0.1s,
			color 0.1s;
	}
	.ui-dropdown-item--rounded {
		border-radius: 8px;
	}
	.ui-dropdown-item:hover {
		background: var(--surface-secondary);
		color: var(--text-primary);
	}
	.ui-dropdown-item--selected {
		background: var(--color-primary-soft);
		color: var(--color-primary);
		font-weight: 600;
	}
	.ui-dropdown-item--danger {
		color: var(--color-error);
	}
	.ui-dropdown-item:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	:global(.ui-dropdown-item__icon) {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		opacity: 0.7;
	}
	.ui-dropdown-item__content {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
	}
	.ui-dropdown-item__content small {
		margin-top: 1px;
		color: var(--text-tertiary);
		font-size: 10.5px;
		font-weight: 400;
	}
	.ui-dropdown-item__badge {
		padding: 1px 5px;
		border-radius: 99px;
		background: var(--surface-tertiary);
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 700;
	}
	kbd {
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 9px;
	}
	.ui-dropdown-item__divider {
		height: 1px;
		margin: 4px 0;
		background: var(--border-primary);
	}
	.ui-dropdown-submenu {
		position: fixed;
		z-index: 61;
		min-width: 180px;
		max-height: 24rem;
		overflow-y: auto;
		border: 1px solid var(--border-primary);
		background: var(--surface-primary);
		box-shadow: var(--shadow-lg);
	}
	.ui-dropdown-submenu--v3 {
		padding: 4px 0;
		border-radius: 8px;
	}
	.ui-dropdown-submenu--rounded {
		padding: 8px;
		border-radius: 12px;
	}
</style>

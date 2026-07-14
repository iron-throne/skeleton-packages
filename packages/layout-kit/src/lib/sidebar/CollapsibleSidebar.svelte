<script lang="ts">
	import { EMenuAlign, type IMenu } from '@aryagg/types';
	import { DropdownMenu } from '@aryagg/ui-kit';
	import type { Snippet } from 'svelte';
	import { CaretDownFill, CaretLeftFill, Person } from 'svelte-bootstrap-icons';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';

	let {
		menus = [],

		logosrc,
		logohref = '/',
		logoAlt = 'Logo',

		collapsed = $bindable(false),
		collapsible = true,
		collapsedMode = 'icons',
		position = 'left',

		onToggle,

		headerSlot,
		footerSlot,

		mainClass = '',
		logoClass = '',
		listClass = '',
		itemClass = '',
		toggleClass = ''
	}: {
		menus?: IMenu[];

		logosrc?: string;
		logohref?: string;
		logoAlt?: string;

		/** Bindable so the parent can read/drive the collapsed state, e.g. `bind:collapsed`. */
		collapsed?: boolean;
		collapsible?: boolean;
		/**
		 * How the sidebar behaves while `collapsed`:
		 * - `'icons'` (default): shrinks to an icon-only rail; groups open their children via
		 *   a flyout on hover/click.
		 * - `'hide'`: collapses to zero width and is inerted, i.e. the whole sidebar disappears.
		 *   Since its own toggle button disappears with it, `collapsed` must be driven externally
		 *   (e.g. `bind:collapsed` from a topbar button) to bring it back.
		 */
		collapsedMode?: 'icons' | 'hide';
		/** Which edge of the screen the sidebar sits on, used to pick flyout/toggle direction. */
		position?: 'left' | 'right';

		onToggle?: (collapsed: boolean) => void;

		headerSlot?: Snippet;
		footerSlot?: Snippet;

		mainClass?: string;
		logoClass?: string;
		listClass?: string;
		itemClass?: string;
		toggleClass?: string;
	} = $props();

	// Inline accordion state for parent items, only relevant while the sidebar is expanded.
	// While collapsed, children are shown via a flyout (DropdownMenu) instead.
	let openGroups = $state(new Set<string>());

	let isHidden = $derived(collapsed && collapsedMode === 'hide');

	function toggleCollapsed() {
		collapsed = !collapsed;
		onToggle?.(collapsed);
	}

	function toggleGroup(id: string) {
		if (openGroups.has(id)) {
			openGroups.delete(id);
		} else {
			openGroups.add(id);
		}
		openGroups = new Set(openGroups);
	}

	function rowClass(menu: IMenu) {
		return [
			'group rounded-lg text-sm font-medium transition-colors',
			menu.disabled
				? 'pointer-events-none cursor-not-allowed opacity-40'
				: menu.selected
					? 'bg-accent/75 text-on-accent hover:text-on-accent!'
					: 'text-primary/65 hover:bg-accent/10 hover:text-accent',
			menu.class ?? ''
		].join(' ');
	}

	// Flyouts should open away from the screen edge the sidebar is docked to.
</script>

{#snippet ItemIcon(menu: IMenu)}
	{@const Icon = menu.selected && menu.selectedIcon ? menu.selectedIcon : menu.icon}
	{#if Icon}
		<Icon
			class="
    size-5
    shrink-0
    transition-transform
    duration-200
    group-hover:scale-110
    "
		/>
	{/if}
{/snippet}

{#snippet Label(text: string)}
	<span
		class="overflow-hidden whitespace-nowrap transition-all duration-200 ease-out {collapsed
			? 'max-w-0 -translate-x-2 opacity-0 hidden'
			: 'max-w-44 translate-x-0 opacity-100 delay-100'}">{text}</span
	>
{/snippet}

{#snippet Leaf(menu: IMenu, depth: number)}
	{@const style = !collapsed && depth > 0 ? `padding-left:${0.75 + depth}rem` : undefined}
	{#if menu.disabled}
		<span
			class="{rowClass(menu)} transition-all duration-200 flex items-center gap-3 {collapsed
				? 'mx-auto size-10 justify-center'
				: 'w-full px-3 py-2'} {itemClass}"
			{style}
			role="link"
			aria-disabled="true"
			title={collapsed ? menu.label : undefined}
		>
			{@render ItemIcon(menu)}
			{@render Label(menu.label)}
		</span>
	{:else}
		<a
			href={menu.href ?? '#'}
			onclick={menu.onclick}
			class="{rowClass(menu)} transition-all duration-200 flex items-center gap-3 {collapsed
				? 'mx-auto size-10 justify-center'
				: 'w-full px-3 py-2'} {itemClass}"
			{style}
			aria-current={menu.selected ? 'page' : undefined}
			title={collapsed ? menu.label : undefined}
		>
			{@render ItemIcon(menu)}
			{@render Label(menu.label)}
		</a>
	{/if}
{/snippet}

{#snippet Group(menu: IMenu, depth: number)}
	{#if collapsed}
		<DropdownMenu
			menus={menu.children ?? []}
			align={position === 'right' ? EMenuAlign.RIGHT : EMenuAlign.LEFT}
			menuClass={'text-sm'}
		>
			{#snippet trigger({ open, toggle })}
				<button
					type="button"
					aria-haspopup="true"
					aria-expanded={open}
					title={menu.label}
					disabled={menu.disabled}
					onclick={toggle}
					onmouseenter={() => !open && toggle()}
					class="{rowClass(
						menu
					)} mx-auto flex size-10 items-center justify-center border-0 {itemClass}"
				>
					{@render ItemIcon(menu)}
				</button>
			{/snippet}
		</DropdownMenu>
	{:else}
		{@const isOpen = openGroups.has(menu.id)}
		{@const style = depth > 0 ? `padding-left:${0.75 + depth}rem` : undefined}
		<button
			type="button"
			aria-expanded={isOpen}
			disabled={menu.disabled}
			onclick={() => toggleGroup(menu.id)}
			class="{rowClass(
				menu
			)} transition-all duration-200 flex w-full items-center gap-3 px-3 py-2 border-0 {itemClass}"
			{style}
		>
			{@render ItemIcon(menu)}
			<span class="flex-1 truncate text-left">{menu.label}</span>
			<CaretDownFill
				class="size-3 shrink-0 transition-transform duration-300 ease-in-out {isOpen
					? 'rotate-180'
					: ''}"
			/>
		</button>
		{#if isOpen}
			<div
				class="flex flex-col gap-0.5 overflow-hidden"
				transition:slide={{ duration: 220, easing: cubicOut }}
			>
				{#each menu.children ?? [] as child (child.id)}
					{@render MenuRow(child, depth + 1)}
				{/each}
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet MenuRow(menu: IMenu, depth: number)}
	{#if menu.divider}
		<div class="my-1 {collapsed ? 'mx-2' : 'mx-1'} h-px bg-border-primary" role="separator"></div>
	{/if}
	{#if menu.children?.length}
		{@render Group(menu, depth)}
	{:else}
		{@render Leaf(menu, depth)}
	{/if}
{/snippet}

{#snippet SidebarContent()}
	<div
		class="flex shrink-0 items-center gap-2 p-3 border-b border-border-primary {collapsed
			? 'flex-col'
			: 'justify-between'} {logoClass}"
	>
		{#if logosrc}
			<a href={logohref} class="flex min-w-0 items-center gap-2" aria-label={logoAlt}>
				<img src={logosrc} alt={logoAlt} class="size-8 shrink-0 object-contain" />
			</a>
		{/if}

		<div
			class="
    overflow-hidden
    transition-all
    duration-200

    {collapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'}
    "
		>
			{#if headerSlot}
				{@render headerSlot()}
			{/if}
		</div>

		{#if collapsible}
			<button
				type="button"
				onclick={toggleCollapsed}
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				aria-expanded={!collapsed}
				class="flex size-8 shrink-0 items-center justify-center rounded-lg text-primary/65 hover:bg-accent/10 hover:text-accent p-1 {toggleClass}"
			>
				<CaretLeftFill
					class="size-3.5 transition-transform duration-300 ease-in-out {(position === 'left') ===
					collapsed
						? 'rotate-180'
						: ''}"
				/>
			</button>
		{/if}
	</div>

	<nav
		class="flex
    flex-1
    flex-col
    gap-2
    overflow-y-auto
    transition-all p-3
    duration-300 {listClass}"
	>
		{#each menus as menu (menu.id)}
			{@render MenuRow(menu, 0)}
		{/each}
	</nav>

	<div class="shrink-0 border-t border-border-primary p-2">
		{#if footerSlot}
			{@render footerSlot()}
		{:else}
			<a
				href="/"
				aria-label="Account"
				title={collapsed ? 'Account' : undefined}
				class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary/65 hover:bg-accent/10 hover:text-accent {collapsed
					? 'mx-auto size-10 justify-center px-0'
					: 'w-full'}"
			>
				<Person class="size-5 shrink-0" />
				{@render Label('Account')}
			</a>
		{/if}
	</div>
{/snippet}

<aside
	class="relative flex h-full shrink-0 flex-col overflow-hidden
		bg-surface-primary shadow
		transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]
		{isHidden ? 'w-0 border-0 shadow-none opacity-0 pointer-events-none' : collapsed ? 'w-16' : 'w-60'}
		{mainClass}"
	aria-hidden={isHidden}
	inert={isHidden}
	in:fly={{ x: position === 'right' ? 320 : -320, duration: 350, easing: cubicOut }}
>
	{@render SidebarContent()}
</aside>

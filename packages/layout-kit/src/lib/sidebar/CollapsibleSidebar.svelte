<script lang="ts">
	import { EMenuAlign, type IMenu } from '@aryagg/types';
	import { DropdownMenu } from '@aryagg/ui-kit';
	import type { Snippet } from 'svelte';
	import { Person, ChevronRight, ChevronLeft, CaretRight } from 'svelte-bootstrap-icons';

	let {
		menus,
		logosrc,
		logohref = '/',
		mainClass = '',
		logoClass = '',
		listClass = '',
		isCollapsed = $bindable(),
		hideToggleButton = false,
		ToggleBtnSlot,
		FooterSlot,
		MenuSlot
	}: {
		menus: IMenu[];
		logosrc?: string;
		logohref?: string;
		mainClass?: string;
		logoClass?: string;
		listClass?: string;
		isCollapsed: boolean;
		hideToggleButton?: boolean;
		ToggleBtnSlot?: Snippet;
		FooterSlot?: Snippet;
		MenuSlot?: Snippet<[IMenu]>;
	} = $props();

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<aside
	class={`flex h-full flex-col border-r border-border-primary bg-surface-primary shadow-sm relative
		transition-[width] duration-200 ease-out
		${isCollapsed ? 'w-16' : 'w-60'}
		${mainClass}`}
>
	<!-- Header -->
	<div
		class={`flex items-center px-4 py-2 border-b border-border-primary
			${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}
	>
		{#if logosrc}
			<a href={logohref} class={logoClass}>
				<img src={logosrc} alt="Logo" class="size-9 object-contain shrink-0" />
			</a>
		{/if}

		{@render CollapseButton()}
	</div>

	<!-- Menu -->
	<div
		class={`flex-1 overflow-y-auto px-4 py-2 space-y-2
			${isCollapsed ? 'items-center' : ''}
			${listClass}`}
	>
		{#each menus as menu}
			{@render Menu(menu)}
		{/each}
	</div>

	<!-- Footer -->
	<div class="border-t border-border-primary p-2 shrink-0">
		{#if FooterSlot}
			{@render FooterSlot()}
		{:else}
			<a
				href="/"
				class={`flex h-10 items-center rounded-lg text-sm font-medium
					transition-colors duration-150
					text-text-secondary hover:bg-surface-secondary hover:text-text-primary
					${isCollapsed ? 'w-10 justify-center px-0 mx-auto' : 'w-full gap-3 px-3'}`}
			>
				<Person class="size-5 shrink-0" />

				{#if !isCollapsed}
					<span>Account</span>
				{/if}
			</a>
		{/if}
	</div>
</aside>

{#snippet Menu(menu: IMenu)}
	{#if menu.divider}
		<div class="my-2 h-px w-full bg-border-primary"></div>
	{/if}

	{#if menu.children?.length}
		<DropdownMenu menus={menu.children} align={EMenuAlign.LEFT} menuClass="-mt-6 shadow left-5 ml-0!">
			{#snippet trigger({ open, toggle })}
				{@render Leaf(menu, true, open, toggle)}
			{/snippet}
		</DropdownMenu>
	{:else}
		{@render Leaf(menu, false)}
	{/if}
{/snippet}

{#snippet Leaf(menu: IMenu, isGroup: boolean, open?: boolean, toggle?: () => void)}
	{@const Icon = menu.selected ? menu.selectedIcon : menu.icon}

	{#if MenuSlot}
		{@render MenuSlot(menu)}
	{:else}
		<a
			href={menu.href}
			title={isCollapsed ? menu.label : undefined}
			aria-expanded={open}
			onclick={(e) => {
				if (isGroup) {
					e.preventDefault();
					toggle?.();
				}
			}}
			onmouseenter={() => {
				if (isGroup && !isCollapsed) {
					toggle?.();
				}
			}}
			class={`group flex w-full px-3 py-2 items-center rounded-lg transition-all duration-150 hover:bg-accent/10 hover:text-on-accent relative
				${isCollapsed ? 'justify-center mx-auto' : 'w-full gap-3'}
				
				${
					menu.selected
						? 'bg-accent/65 text-on-accent shadow-sm'
						: menu.disabled
							? 'pointer-events-none opacity-40 text-secondary'
							: 'text-secondary'
				}
				
				${menu.class ?? ''}`}
		>
			{#if Icon}
				<Icon class="size-5 shrink-0" />
			{/if}

			{#if !isCollapsed}
				<span class="truncate text-sm font-medium" title={menu.label}>
					{menu.label}
				</span>
			{/if}

			{#if isGroup && !isCollapsed}
				<CaretRight
					class={`ml-auto size-3 shrink-0 transition-transform duration-200
						${open ? 'rotate-90' : ''}`}
				/>
			{/if}
		</a>
	{/if}
{/snippet}

{#snippet CollapseButton()}
	{#if !hideToggleButton}
		{#if ToggleBtnSlot}
			{@render ToggleBtnSlot()}
		{:else}
			<button
				type="button"
				onclick={toggleCollapse}
				title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				class="flex size-9 items-center justify-center rounded-lg p-1
					bg-accent text-on-accent
					transition-all duration-150
					hover:opacity-90 active:scale-95"
			>
				{#if isCollapsed}
					<ChevronRight class="size-4" />
				{:else}
					<ChevronLeft class="size-4" />
				{/if}
			</button>
		{/if}
	{/if}
{/snippet}

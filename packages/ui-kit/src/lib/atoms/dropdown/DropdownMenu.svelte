<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { clickOutside } from '@aryagg/utils';
	import { type IMenu, EMenuAlign } from '@aryagg/types';

	let {
		menus,
		align = EMenuAlign.RIGHT,
		trigger,
		menuClass
	}: {
		menus: IMenu[];
		align?: EMenuAlign;
		menuClass?: string;
		/** The element that opens/closes the menu */
		trigger: Snippet<[{ open: boolean; toggle: () => void }]>;
	} = $props();

	let open = $state(false);
	const toggle = () => (open = !open);
	const close = () => (open = false);

	const alignClass: Record<EMenuAlign, string> = {
		[EMenuAlign.RIGHT]: 'right-0',
		[EMenuAlign.LEFT]: 'left-0'
	};

	type ItemIcon = Component<{ width?: number; height?: number; class?: string }>;

	function itemClass(menu: IMenu) {
		if (menu.disabled) return 'cursor-not-allowed text-tertiary opacity-50';
		if (menu.danger) return 'text-error hover:bg-error/10';
		if (menu.selected) return 'bg-accent/10 text-accent';
		return 'hover:text-primary hover:bg-surface-secondary text-secondary';
	}
</script>

{#snippet menuIcon(menu: IMenu)}
	{@const icon = (menu.selected && menu.selectedIcon ? menu.selectedIcon : menu.icon) as
		| ItemIcon
		| undefined}
	{#if icon}
		{@const Icon = icon}
		<Icon width={15} height={15} class="shrink-0 opacity-70" />
	{/if}
{/snippet}

{#snippet menuItem(menu: IMenu)}
	{#if menu.children?.length}
		<div class="group/item relative">
			<button
				role="menuitem"
				disabled={menu.disabled}
				aria-haspopup="true"
				class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 text-xs transition-colors {itemClass(
					menu
				)}  {menu.class ?? ''}"
			>
				{@render menuIcon(menu)}
				<span class="flex-1 text-left">{menu.label}</span>
				<span class="text-tertiary text-[10px]">></span>
			</button>
			<div
				class="bg-surface-primary! border-border-primary invisible absolute top-0 z-50 min-w-44
					rounded-xl p-2 opacity-0 shadow-lg transition-opacity group-hover/item:visible group-hover/item:opacity-100
					{align === EMenuAlign.RIGHT ? 'right-full mr-1' : 'left-full ml-1'}"
				role="menu"
			>
				{#each menu.children as child, childIndex (child.id ?? childIndex)}
					{@render menuItem(child)}
				{/each}
			</div>
		</div>
	{:else if menu.href && !menu.disabled}
		<a
			role="menuitem"
			href={menu.href}
			aria-current={menu.selected ? 'page' : undefined}
			onclick={() => {
				menu.onclick?.();
				close();
			}}
			class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 text-xs no-underline transition-colors {itemClass(
				menu
			)} {menu.class ?? ''}"
		>
			{@render menuIcon(menu)}
			{menu.label}
		</a>
	{:else}
		<button
			role="menuitem"
			disabled={menu.disabled}
			onclick={() => {
				menu.onclick?.();
				close();
			}}
			class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 text-xs transition-colors {itemClass(
				menu
			)} {menu.class ?? ''}"
		>
			{@render menuIcon(menu)}
			{menu.label}
		</button>
	{/if}
{/snippet}
<!-- class="relative inline-block w-full" -->
<div
	role="presentation"
	class="inline-block w-full"
	use:clickOutside={close}
	onkeydown={(e) => {
		if (e.key === 'Escape') close();
	}}
>
	<!-- Trigger slot -->
	{@render trigger({ open, toggle })}

	<!-- Menu panel -->
	{#if open}
		<div
			transition:slide={{ duration: 300 }}
			class="bg-surface-primary! border-border-primary absolute z-50 min-w-44 w-full
                   rounded-xl p-2 shadow-lg {align === EMenuAlign.RIGHT
				? 'right-full mr-1'
				: 'left-full ml-1'} {menuClass}"
			role="menu"
		>
			{#each menus as menu, ind (menu.id ?? ind)}
				{#if menu.divider}
					<div class="border-border-primary my-1 border-t"></div>
				{/if}
				{@render menuItem(menu)}
			{/each}
		</div>
	{/if}
</div>

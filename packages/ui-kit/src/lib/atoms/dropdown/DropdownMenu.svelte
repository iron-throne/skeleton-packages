<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { clickOutside } from '@aryagg/utils';
	import { type IMenu, EMenuAlign } from '@aryagg/types';
	import { CaretRightFill } from 'svelte-bootstrap-icons';

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
	let containerEl = $state<HTMLElement>();
	let panelPos = $state({ top: 0, left: 0, right: 0, maxHeight: 320, useRight: false });

	// Menu panel is rendered with `position: fixed` (in the CSS, not the DOM) so it can
	// escape any `overflow-hidden`/`overflow-auto` ancestor (e.g. a collapsing sidebar).
	function updatePosition() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const gap = 6;
		const maxHeight = Math.max(160, window.innerHeight - rect.top - 12);
		if (align === EMenuAlign.RIGHT) {
			panelPos = {
				top: rect.top,
				left: 0,
				right: window.innerWidth - rect.left + gap,
				maxHeight,
				useRight: true
			};
		} else {
			panelPos = {
				top: rect.top,
				left: rect.right + gap,
				right: 0,
				maxHeight,
				useRight: false
			};
		}
	}

	function show() {
		updatePosition();
		open = true;
	}

	function close() {
		open = false;
	}

	function toggle() {
		if (open) close();
		else show();
	}

	$effect(() => {
		if (!open) return;
		const onReposition = () => updatePosition();
		window.addEventListener('scroll', onReposition, true);
		window.addEventListener('resize', onReposition);
		return () => {
			window.removeEventListener('scroll', onReposition, true);
			window.removeEventListener('resize', onReposition);
		};
	});

	function itemClass(menu: IMenu) {
		if (menu.disabled) return 'cursor-not-allowed text-tertiary opacity-50';
		if (menu.danger) return 'text-error hover:bg-error/10';
		if (menu.selected) return 'bg-accent/10 text-accent';
		return 'hover:text-primary hover:bg-surface-secondary text-secondary';
	}
</script>

{#snippet menuIcon(menu: IMenu)}
	{@const Icon = menu.selected && menu.selectedIcon ? menu.selectedIcon : menu.icon}
	{#if Icon}
		<Icon width={15} height={15} class="shrink-0 opacity-70" />
	{/if}
{/snippet}

{#snippet menuItem(menu: IMenu)}
	{#if menu.children?.length}
		<div class="group/item relative">
			<button
				type="button"
				role="menuitem"
				disabled={menu.disabled}
				aria-haspopup="true"
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
			<div
				class="bg-surface-primary! border-border-primary invisible absolute top-0 z-50 min-w-44
					origin-top scale-95 rounded-xl border p-2 opacity-0 shadow-lg transition-[opacity,transform,visibility]
					duration-150 ease-out group-hover/item:visible group-hover/item:scale-100 group-hover/item:opacity-100
					{align === EMenuAlign.RIGHT ? 'right-full mr-1 origin-right' : 'left-full ml-1 origin-left'}"
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
				close();
			}}
			class="group flex w-full items-center gap-2 rounded-2xl border-0 p-2 transition-colors duration-150 {itemClass(
				menu
			)} {menu.class ?? ''}"
		>
			{@render menuIcon(menu)}
			{menu.label}
		</button>
	{/if}
{/snippet}

<div
	role="presentation"
	class="relative inline-block w-full"
	bind:this={containerEl}
	use:clickOutside={close}
	onkeydown={(e) => {
		if (e.key === 'Escape') close();
	}}
>
	<!-- Trigger slot -->
	{@render trigger({ open, toggle })}

	<!-- Menu panel: fixed-positioned so it can escape clipping/scrolling ancestors -->
	{#if open}
		<div
			transition:scale={{ duration: 160, start: 0.94, opacity: 0, easing: cubicOut }}
			style="position: fixed; top: {panelPos.top}px; {panelPos.useRight
				? `right: ${panelPos.right}px;`
				: `left: ${panelPos.left}px;`} max-height: {panelPos.maxHeight}px;"
			class="bg-surface-primary! border-border-primary z-50 min-w-48 overflow-y-auto
				rounded-xl border p-2 shadow-xl {panelPos.useRight ? 'origin-top-right' : 'origin-top-left'} {menuClass}"
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

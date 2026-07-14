<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
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
		const onReposition = () => {
			updatePosition();
			// Nested flyouts are positioned relative to their trigger's on-screen rect, so
			// rather than recomputing every open level, just close them on scroll/resize.
			submenuOpen.clear();
		};
		window.addEventListener('scroll', onReposition, true);
		window.addEventListener('resize', onReposition);
		return () => {
			window.removeEventListener('scroll', onReposition, true);
			window.removeEventListener('resize', onReposition);
		};
	});

	// Nested (grandchild+) flyouts: keyed by menu id, each with its own open state and
	// `position: fixed` coordinates so they escape the parent panel's `overflow-y-auto`
	// (a plain `absolute` submenu gets clipped by that scroll container).
	type SubmenuPos = { top: number; left: number; right: number; maxHeight: number; useRight: boolean };
	let submenuOpen = new SvelteSet<string>();
	let submenuPos = new SvelteMap<string, SubmenuPos>();
	const submenuCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();

	function computeSubmenuPos(el: HTMLElement): SubmenuPos {
		const rect = el.getBoundingClientRect();
		const gap = 4;
		const maxHeight = Math.max(160, window.innerHeight - rect.top - 12);
		return align === EMenuAlign.RIGHT
			? { top: rect.top, left: 0, right: window.innerWidth - rect.left + gap, maxHeight, useRight: true }
			: { top: rect.top, left: rect.right + gap, right: 0, maxHeight, useRight: false };
	}

	function openSubmenu(key: string, el: HTMLElement) {
		clearTimeout(submenuCloseTimers.get(key));
		submenuPos.set(key, computeSubmenuPos(el));
		submenuOpen.add(key);
	}

	function cancelCloseSubmenu(key: string) {
		clearTimeout(submenuCloseTimers.get(key));
	}

	function scheduleCloseSubmenu(key: string) {
		clearTimeout(submenuCloseTimers.get(key));
		submenuCloseTimers.set(
			key,
			setTimeout(() => submenuOpen.delete(key), 150)
		);
	}

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
		{@const key = String(menu.id ?? menu.label)}
		{@const isOpen = submenuOpen.has(key)}
		{@const pos = submenuPos.get(key)}
		<div
			class="relative"
			role="none"
			onmouseenter={(e) => openSubmenu(key, e.currentTarget as HTMLElement)}
			onmouseleave={() => scheduleCloseSubmenu(key)}
		>
			<button
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
			{#if isOpen && pos}
				<div
					transition:scale={{ duration: 140, start: 0.94, opacity: 0, easing: cubicOut }}
					style="position: fixed; top: {pos.top}px; {pos.useRight
						? `right: ${pos.right}px;`
						: `left: ${pos.left}px;`} max-height: {pos.maxHeight}px;"
					class="bg-surface-primary! border-border-primary z-50 min-w-44 overflow-y-auto
						rounded-xl border p-2 shadow-xl"
					role="menu"
					tabindex="-1"
					onmouseenter={() => cancelCloseSubmenu(key)}
					onmouseleave={() => scheduleCloseSubmenu(key)}
				>
					{#each menu.children as child, childIndex (child.id ?? childIndex)}
						{@render menuItem(child)}
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

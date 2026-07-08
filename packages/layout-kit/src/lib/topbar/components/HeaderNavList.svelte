<script lang="ts">
	import { DropdownMenu } from '@aryagg/ui-kit';
	import { EMenuAlign, type IMenu } from '@aryagg/types';
	import { CaretDownFill } from 'svelte-bootstrap-icons';

	let {
		items,
		activeHref = '',
		menuClass = '',
		layout = 'stacked'
	}: {
		items: IMenu[];
		activeHref?: string;
		menuClass?: string;
		layout?: 'stacked' | 'horizontal';
	} = $props();
</script>

<nav class="flex items-center gap-0.5 {menuClass}">
	{#each items as item, i (i)}
		{@const isActive = activeHref === item.href}
		<div class="relative">
			{#if item.children?.length}
				<DropdownMenu menus={item.children} align={EMenuAlign.LEFT}>
					{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
						<button
							class="btn-ghost btn-sm flex items-center gap-1.5"
							onclick={toggle}
							aria-expanded={open}
							aria-haspopup="true"
						>
							{#if isActive && item.selectedIcon}
								{@const I = item.selectedIcon}
								<I class="size-4 shrink-0" />
							{:else if item.icon}
								{@const I = item.icon}
								<I class="size-4 shrink-0" />
							{/if}
							<span>{item.label}</span>
							<CaretDownFill
								class="size-3 transition-transform duration-150 {open ? 'rotate-180' : ''}"
							/>
						</button>
					{/snippet}
				</DropdownMenu>
			{:else if layout === 'horizontal'}
				<a
					href={item.href ?? '#'}
					class="group hover:text-accent! relative flex flex-row items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors {item.class} {isActive
						? 'text-accent'
						: 'text-secondary'}"
				>
					{#if isActive && item.selectedIcon}
						{@const I = item.selectedIcon}
						<I class="size-4 shrink-0 group-hover:text-accent" />
					{:else if item.icon}
						{@const I = item.icon}
						<I class="size-4 shrink-0 group-hover:text-accent" />
					{/if}
					<span>{item.label}</span>
					<span
						class="absolute inset-x-2 -bottom-1 h-0.5 rounded-full transition-opacity {isActive
							? 'bg-accent opacity-100'
							: 'bg-transparent opacity-0 group-hover:bg-accent/40 group-hover:opacity-100'}"
					></span>
				</a>
			{:else}
				<a
					href={item.href ?? '#'}
					class="group hover:text-accent! relative flex flex-col items-center justify-between pb-1 text-[11px]! font-medium transition-colors {item.class} {isActive
						? 'text-accent'
						: 'text-secondary'}"
				>
					{#if isActive && item.selectedIcon}
						{@const I = item.selectedIcon}
						<I class="size-5 group-hover:text-accent" />
					{:else if item.icon}
						{@const I = item.icon}
						<I class="size-5 group-hover:text-accent" />
					{/if}
					<span class="hidden px-4 pt-1 sm:block">{item.label}</span>
					<span
						class="absolute -bottom-1 h-0.5 w-full rounded-full transition-opacity {isActive
							? 'bg-accent opacity-100'
							: 'bg-transparent opacity-0 group-hover:bg-accent/40 group-hover:opacity-100'}"
					></span>
				</a>
			{/if}
		</div>
	{/each}
</nav>

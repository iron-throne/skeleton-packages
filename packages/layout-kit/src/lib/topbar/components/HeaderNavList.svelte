<script lang="ts">
	import { DropdownMenu, Icon } from '@aryagg/ui-kit';
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
						{#if layout === 'horizontal'}
							<a
								href="/"
								class="btn-ghost btn-sm flex items-center gap-1.5"
								onclick={(e) => {
									e.preventDefault();
									toggle();
								}}
								aria-expanded={open}
								aria-haspopup="true"
							>
								{#if isActive && item.selectedIcon}
									<Icon Icon={item.selectedIcon} class="size-4 shrink-0" />
								{:else if item.icon}
									<Icon Icon={item.icon} class="size-4 shrink-0" />
								{/if}
								<span>{item.label}</span>
								<CaretDownFill
									class="size-3 transition-transform duration-150 {open ? 'rotate-180' : ''}"
								/>
							</a>
						{:else}
							<a
								href="/"
								class="group border-0 hover:text-accent! relative flex flex-col items-center justify-between pb-1 text-[11px]! font-medium transition-colors {isActive
									? 'text-accent'
									: 'text-secondary'}"
								onclick={(e) => {
									e.preventDefault();
									toggle();
								}}
								aria-expanded={open}
								aria-haspopup="true"
							>
								{#if isActive && item.selectedIcon}
									<Icon Icon={item.selectedIcon} class="size-5 group-hover:text-accent" />
								{:else if item.icon}
									<Icon Icon={item.icon} class="size-5 group-hover:text-accent" />
								{/if}
								<span class="hidden items-center gap-1 px-4 pt-1 sm:flex">
									{item.label}
									<CaretDownFill
										class="size-3 transition-transform duration-150 {open ? 'rotate-180' : ''}"
									/>
								</span>
							</a>
						{/if}
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
						<Icon Icon={item.selectedIcon} class="group-hover:text-accent" />
					{:else if item.icon}
						<Icon Icon={item.icon} class="group-hover:text-accent" />
					{/if}
					<span>{item.label}</span>
					<span
						class="absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-opacity {isActive
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
						<Icon Icon={item.selectedIcon} class="size-5 group-hover:text-accent" />
					{:else if item.icon}
						<Icon Icon={item.icon} class="size-5 group-hover:text-accent" />
					{/if}
					<span class="hidden px-4 pt-1 sm:block">{item.label}</span>
					<span
						class="absolute bottom-0 h-0.5 w-full rounded-full transition-opacity {isActive
							? 'bg-accent opacity-100'
							: 'bg-transparent opacity-0 group-hover:bg-accent/40 group-hover:opacity-100'}"
					></span>
				</a>
			{/if}
		</div>
	{/each}
</nav>

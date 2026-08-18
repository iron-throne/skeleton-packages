<script lang="ts">
	import { DropdownMenu, Icon } from '@aryagg/ui-kit';
	import { EPosition, ESwitchLayout, type IMenu } from '@aryagg/types';
	import { CaretDownFill } from 'svelte-bootstrap-icons';

	let {
		items,
		activeHref = '',
		menuClass = '',
		layout = ESwitchLayout.STACKED
	}: {
		items: IMenu[];
		activeHref?: string;
		menuClass?: string;
		layout?: ESwitchLayout;
	} = $props();

	function iconKlass(item: IMenu, isActive: boolean) {
		return (isActive ? item.selectedIconKlass || item.iconClass : item.iconClass) ?? '';
	}
</script>

<nav class="flex items-center gap-0.5 {menuClass}">
	{#each items as item, i (i)}
		{@const isActive = activeHref === item.href}
		<div class="relative">
			{#if item.children?.length}
				<DropdownMenu menus={item.children} align={EPosition.LEFT}>
					{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
						{#if layout === ESwitchLayout.HORIZONTAL}
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
								<Icon
									icon={isActive ? item.selectedIcon || item.icon : item.icon}
									klass="size-4 shrink-0 {iconKlass(item, isActive)}"
								/>
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
								<Icon
									icon={isActive ? item.selectedIcon || item.icon : item.icon}
									klass="size-5 group-hover:text-accent {iconKlass(item, isActive)}"
								/>
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
			{:else if layout === ESwitchLayout.HORIZONTAL}
				<a
					href={item.href ?? '#'}
					class="group hover:text-accent! relative flex flex-row items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors {item.klass} {isActive
						? 'text-accent'
						: 'text-secondary'}"
				>
					<Icon
						icon={isActive ? item.selectedIcon || item.icon : item.icon}
						klass="group-hover:text-accent {iconKlass(item, isActive)}"
					/>
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
					class="group hover:text-accent! relative flex flex-col items-center justify-between pb-1 text-[11px]! font-medium transition-colors {item.klass} {isActive
						? 'text-accent'
						: 'text-secondary'}"
				>
					<Icon
						icon={isActive ? item.selectedIcon || item.icon : item.icon}
						klass="size-5 group-hover:text-accent {iconKlass(item, isActive)}"
					/>

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

<script lang="ts">
	import { DropdownMenu } from '@aryagg/ui-kit';
	import { EMenuAlign, type IMenu } from '@aryagg/types';
	import { CaretDownFill } from 'svelte-bootstrap-icons';

	let {
		items,
		activeHref = ''
	}: {
		items: IMenu[];
		activeHref?: string;
	} = $props();
</script>

<nav class="flex items-center gap-0.5">
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
			{:else}
				<a
					href={item.href ?? '#'}
					class="btn-ghost btn-sm flex items-center gap-1.5 no-underline {isActive
						? 'text-accent'
						: 'text-secondary'}"
				>
					{#if isActive && item.selectedIcon}
						{@const I = item.selectedIcon}
						<I class="size-4 shrink-0" />
					{:else if item.icon}
						{@const I = item.icon}
						<I class="size-4 shrink-0" />
					{/if}
					<span>{item.label}</span>
				</a>
			{/if}
		</div>
	{/each}
</nav>

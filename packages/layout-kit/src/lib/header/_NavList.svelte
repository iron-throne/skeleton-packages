<script lang="ts">
	import { resolve } from '$app/paths';
	import type { NavItem } from './types';

	let {
		items,
		openL1,
		openL2,
		onToggleL1,
		onToggleL2,
	}: {
		items: NavItem[];
		openL1: number | null;
		openL2: number | null;
		onToggleL1: (i: number) => void;
		onToggleL2: (i: number) => void;
	} = $props();
</script>

<nav class="flex items-center gap-0.5">
	{#each items as item, i (i)}
		<div class="relative">
			{#if item.children?.length}
				<button
					class="btn-ghost btn-sm flex items-center gap-1.5"
					onclick={() => onToggleL1(i)}
					aria-expanded={openL1 === i}
					aria-haspopup="true"
				>
					{#if item.icon}{@const I = item.icon}<I class="size-4 shrink-0" />{/if}
					<span>{item.label}</span>
					{#if item.badge}<span data-badge>{item.badge}</span>{/if}
					<svg class="size-3 transition-transform duration-150 {openL1 === i ? 'rotate-180' : ''}"
						viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 6l4 4 4-4" />
					</svg>
				</button>

				{#if openL1 === i}
					<div class="absolute left-0 top-full z-50 mt-1.5 min-w-52 rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-lg">
						{#each item.children as child, ci (ci)}
							{#if child.children?.length}
								<div class="relative">
									<button
										class="flex w-full items-center gap-2 rounded-xl border-transparent bg-transparent px-3 py-2 text-sm text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
										onclick={() => onToggleL2(ci)}
										aria-expanded={openL2 === ci}
										aria-haspopup="true"
									>
										{#if child.icon}{@const I = child.icon}<I class="size-4 shrink-0 text-tertiary" />{/if}
										<span class="flex-1 text-left">{child.label}</span>
										{#if child.badge}<span data-badge class="ml-auto">{child.badge}</span>{/if}
										<svg class="size-3 shrink-0 transition-transform duration-150 {openL2 === ci ? 'rotate-90' : ''}"
											viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"
											stroke-linecap="round" stroke-linejoin="round">
											<path d="M6 4l4 4-4 4" />
										</svg>
									</button>

									{#if openL2 === ci}
										<div class="absolute left-full top-0 z-50 ml-1 min-w-48 rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-lg">
											{#each child.children as grandchild,i (i)}
												<a href={grandchild.href ?? '#'}
													class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-secondary no-underline transition-colors hover:bg-surface-secondary hover:text-primary">
													{#if grandchild.icon}{@const I = grandchild.icon}<I class="size-4 shrink-0 text-tertiary" />{/if}
													<span>{grandchild.label}</span>
													{#if grandchild.badge}<span data-badge class="ml-auto">{grandchild.badge}</span>{/if}
												</a>
											{/each}
										</div>
									{/if}
								</div>
							{:else}
								<a href={child.href ?? '#'}
									class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-secondary no-underline transition-colors hover:bg-surface-secondary hover:text-primary">
									{#if child.icon}{@const I = child.icon}<I class="size-4 shrink-0 text-tertiary" />{/if}
									<span>{child.label}</span>
									{#if child.badge}<span data-badge class="ml-auto">{child.badge}</span>{/if}
								</a>
							{/if}
						{/each}
					</div>
				{/if}
			{:else}
				<a href={item.href ?? '#'} class="btn-ghost btn-sm flex items-center gap-1.5 no-underline">
					{#if item.icon}{@const I = item.icon}<I class="size-4 shrink-0" />{/if}
					<span>{item.label}</span>
					{#if item.badge}<span data-badge>{item.badge}</span>{/if}
				</a>
			{/if}
		</div>
	{/each}
</nav>

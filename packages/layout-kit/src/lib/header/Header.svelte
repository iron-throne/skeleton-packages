<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NavItem } from './types.js';

	let {
		brand,
		brandHref = '/',
		brandIcon,
		items = [],
		actions,
		variant = 'default',
		class: klass = '',
	}: {
		brand: string;
		brandHref?: string;
		brandIcon?: any;
		items?: NavItem[];
		actions?: Snippet;
		/** default  — brand left · nav left · actions right
		 *  centered  — brand left · nav grid-centered · actions right
		 *  stacked   — row 1: brand + actions  |  row 2: nav centered
		 *  minimal   — brand left · actions right · no nav
		 */
		variant?: 'default' | 'centered' | 'stacked' | 'minimal';
		class?: string;
	} = $props();

	let headerEl: HTMLElement;
	let openL1 = $state<number | null>(null);
	let openL2 = $state<number | null>(null);

	function toggleL1(i: number) {
		openL1 = openL1 === i ? null : i;
		if (openL1 !== i) openL2 = null;
		else openL2 = null;
	}

	function toggleL2(i: number) {
		openL2 = openL2 === i ? null : i;
	}

	function handleWindowClick(e: MouseEvent) {
		if (!headerEl?.contains(e.target as Node)) {
			openL1 = null;
			openL2 = null;
		}
	}
</script>

<!-- ─── reusable snippets ────────────────────────────────────── -->

{#snippet brandMark()}
	<a href={brandHref} class="flex shrink-0 items-center gap-2 no-underline opacity-100 hover:opacity-80">
		{#if brandIcon}
			{@const BrandIcon = brandIcon}
			<BrandIcon class="size-5 text-accent" />
		{/if}
		<span class="text-sm font-semibold text-primary">{brand}</span>
	</a>
{/snippet}

{#snippet navList()}
	<nav class="flex items-center gap-0.5">
		{#each items as item, i (i)}
			<div class="relative">
				{#if item.children?.length}
					<!-- L1 trigger -->
					<button
						class="btn-ghost btn-sm flex items-center gap-1.5"
						onclick={() => toggleL1(i)}
						aria-expanded={openL1 === i}
						aria-haspopup="true"
					>
						{#if item.icon}
							{@const L1Icon = item.icon}
							<L1Icon class="size-4 shrink-0" />
						{/if}
						<span>{item.label}</span>
						{#if item.badge}
							<span data-badge>{item.badge}</span>
						{/if}
						<svg
							class="size-3 transition-transform duration-150 {openL1 === i ? 'rotate-180' : ''}"
							viewBox="0 0 16 16" fill="none" stroke="currentColor"
							stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
						>
							<path d="M4 6l4 4 4-4" />
						</svg>
					</button>

					<!-- L2 dropdown -->
					{#if openL1 === i}
						<div class="absolute left-0 top-full z-50 mt-1.5 min-w-52 rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-lg">
							{#each item.children as child, ci (ci)}
								{#if child.children?.length}
									<!-- L2 trigger + L3 flyout -->
									<div class="relative">
										<button
											class="flex w-full items-center gap-2 rounded-xl border-transparent bg-transparent px-3 py-2 text-sm text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
											onclick={() => toggleL2(ci)}
											aria-expanded={openL2 === ci}
											aria-haspopup="true"
										>
											{#if child.icon}
												{@const L2Icon = child.icon}
												<L2Icon class="size-4 shrink-0 text-tertiary" />
											{/if}
											<span class="flex-1 text-left">{child.label}</span>
											{#if child.badge}
												<span data-badge class="ml-auto">{child.badge}</span>
											{/if}
											<svg
												class="size-3 shrink-0 transition-transform duration-150 {openL2 === ci ? 'rotate-90' : ''}"
												viewBox="0 0 16 16" fill="none" stroke="currentColor"
												stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
											>
												<path d="M6 4l4 4-4 4" />
											</svg>
										</button>

										<!-- L3 flyout -->
										{#if openL2 === ci}
											<div class="absolute left-full top-0 z-50 ml-1 min-w-48 rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-lg">
												{#each child.children as grandchild (grandchild.href)}
												<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- grandchild.href is an arbitrary consumer-supplied prop, not a route known to this package -->
													<a
													
														href={grandchild.href ?? '#'}
														class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-secondary no-underline transition-colors hover:bg-surface-secondary hover:text-primary"
													>
														{#if grandchild.icon}
															{@const L3Icon = grandchild.icon}
															<L3Icon class="size-4 shrink-0 text-tertiary" />
														{/if}
														<span>{grandchild.label}</span>
														{#if grandchild.badge}
															<span data-badge class="ml-auto">{grandchild.badge}</span>
														{/if}
													</a>
												{/each}
											</div>
										{/if}
									</div>
								{:else}
									<!-- L2 leaf -->
									<a
										href={child.href ?? '#'}
										class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-secondary no-underline transition-colors hover:bg-surface-secondary hover:text-primary"
									>
										{#if child.icon}
											{@const L2LeafIcon = child.icon}
											<L2LeafIcon class="size-4 shrink-0 text-tertiary" />
										{/if}
										<span>{child.label}</span>
										{#if child.badge}
											<span data-badge class="ml-auto">{child.badge}</span>
										{/if}
									</a>
								{/if}
							{/each}
						</div>
					{/if}
				{:else}
					<!-- L1 leaf link -->
					<a
						href={item.href ?? '#'}
						class="btn-ghost btn-sm flex items-center gap-1.5 no-underline"
					>
						{#if item.icon}
							{@const L1LeafIcon = item.icon}
							<L1LeafIcon class="size-4 shrink-0" />
						{/if}
						<span>{item.label}</span>
						{#if item.badge}
							<span data-badge>{item.badge}</span>
						{/if}
					</a>
				{/if}
			</div>
		{/each}
	</nav>
{/snippet}

{#snippet actionBar()}
	{#if actions}
		<div class="flex items-center gap-2">
			{@render actions()}
		</div>
	{/if}
{/snippet}

<!-- ─── variants ─────────────────────────────────────────────── -->

<svelte:window onclick={handleWindowClick} />

<header
	bind:this={headerEl}
	class="sticky top-0 z-50 w-full border-b border-border-primary bg-surface-primary {klass}"
>

	{#if variant === 'default'}
		<!-- brand · nav · ··· · actions -->
		<div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
			{@render brandMark()}
			{@render navList()}
			<div class="ml-auto">{@render actionBar()}</div>
		</div>

	{:else if variant === 'centered'}
		<!-- brand · ··· · [nav centered] · ··· · actions -->
		<div class="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4">
			{@render brandMark()}
			<div class="flex justify-center">{@render navList()}</div>
			{@render actionBar()}
		</div>

	{:else if variant === 'stacked'}
		<!-- row 1: brand ··· actions -->
		<div class="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
			{@render brandMark()}
			{@render actionBar()}
		</div>
		<!-- row 2: nav centered -->
		<div class="border-t border-border-primary">
			<div class="mx-auto flex h-10 max-w-7xl items-center justify-center px-4">
				{@render navList()}
			</div>
		</div>

	{:else if variant === 'minimal'}
		<!-- brand ··· actions — no nav -->
		<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
			{@render brandMark()}
			{@render actionBar()}
		</div>
	{/if}

</header>

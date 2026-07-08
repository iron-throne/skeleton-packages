<script lang="ts">
	import type { Snippet } from 'svelte';
	import HeaderNavList from './components/HeaderNavList.svelte';
	import type { IMenu } from '@aryagg/types';

	let {
		brand,
		brandHref = '/',
		brandIcon,
		tagline = '',
		items = [],
		actions,
		variant = 'default',
		class: klass = ''
	}: {
		brand: string;
		brandHref?: string;
		brandIcon?: any;
		tagline?: string;
		items?: IMenu[];
		actions?: Snippet;
		/** default  — brand left · nav left · actions right
		 *  centered  — brand left · nav grid-centered · actions right
		 *  stacked   — row 1: brand + actions  |  row 2: nav centered
		 *  minimal   — brand left · tagline center · actions right · no nav
		 */
		variant?: 'default' | 'centered' | 'stacked' | 'minimal';
		class?: string;
	} = $props();
</script>

<!-- ─── reusable snippets ────────────────────────────────────── -->

{#snippet brandMark()}
	<a
		href={brandHref}
		class="flex shrink-0 items-center gap-2 no-underline opacity-100 hover:opacity-80"
	>
		{#if brandIcon}
			{@const BrandIcon = brandIcon}
			<BrandIcon class="size-5 text-accent" />
		{/if}
		<span class="text-sm font-semibold text-primary">{brand}</span>
	</a>
{/snippet}

{#snippet actionBar()}
	{#if actions}
		<div class="flex items-center gap-2">
			{@render actions()}
		</div>
	{/if}
{/snippet}

{#snippet navList()}
	<HeaderNavList {items} />
{/snippet}

<!-- ─── variants ─────────────────────────────────────────────── -->

<header class="sticky top-0 z-50 w-full border-b border-border-primary bg-surface-primary {klass}">
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
			<div class="flex justify-center">
				{@render navList()}
			</div>
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
		<!-- brand · tagline center · actions — no nav -->
		<div class="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4">
			{@render brandMark()}
			{#if tagline}
				<p class="text-center text-sm text-tertiary">{tagline}</p>
			{:else}
				<span></span>
			{/if}
			{@render actionBar()}
		</div>
	{/if}
</header>

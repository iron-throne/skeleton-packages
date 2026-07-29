<script lang="ts">
	import { CardImage } from 'svelte-bootstrap-icons';
	import {
		IMAGE_ASPECT_CLASS,
		IMAGE_FIT_CLASS,
		IMAGE_OVERLAY_CLASS,
		IMAGE_RADIUS_CLASS
	} from './constants';
	import type { ImageAspect, ImageFit, ImageOverlay, ImageRadius } from './types';

	let {
		src,
		alt,
		caption = '',
		fit = 'cover',
		aspect = 'video',
		radius = 'lg',
		overlay = 'none',
		loading = 'lazy',
		class: klass = '',
		actions
	}: {
		src: string;
		alt: string;
		caption?: string;
		fit?: ImageFit;
		aspect?: ImageAspect;
		radius?: ImageRadius;
		overlay?: ImageOverlay;
		loading?: 'lazy' | 'eager';
		class?: string;
		actions?: import('svelte').Snippet;
	} = $props();

	let loaded = $state(false);
	let failed = $state(false);

	const rootClass = $derived(
		[
			'relative overflow-hidden border border-border-primary bg-surface-secondary',
			IMAGE_ASPECT_CLASS[aspect],
			IMAGE_RADIUS_CLASS[radius],
			klass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<figure class="space-y-2">
	<div class={rootClass}>
		{#if !loaded && !failed}
			<div class="absolute inset-0 animate-pulse bg-surface-tertiary"></div>
		{/if}

		{#if failed}
			<div class="grid h-full min-h-40 place-items-center text-tertiary">
				<div class="grid justify-items-center gap-2 text-xs">
					<CardImage width={26} height={26} />
					<span>Image unavailable</span>
				</div>
			</div>
		{:else}
			<img
				{src}
				{alt}
				{loading}
				class="h-full w-full {IMAGE_FIT_CLASS[fit]} transition-opacity duration-300 {loaded
					? 'opacity-100'
					: 'opacity-0'}"
				onload={() => (loaded = true)}
				onerror={() => (failed = true)}
			/>
		{/if}

		{#if overlay !== 'none' && (caption || actions)}
			<div class="absolute inset-0 flex p-3 text-white {IMAGE_OVERLAY_CLASS[overlay]}">
				<div class="flex w-full items-end justify-between gap-3">
					{#if caption}
						<figcaption class="min-w-0 truncate text-sm font-semibold">{caption}</figcaption>
					{/if}
					{#if actions}
						<div class="shrink-0">
							{@render actions()}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if caption && overlay === 'none'}
		<figcaption class="text-xs text-secondary">{caption}</figcaption>
	{/if}
</figure>

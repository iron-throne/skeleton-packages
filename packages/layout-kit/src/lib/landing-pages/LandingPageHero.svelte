<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		logo,
		heading = 'Build something great',
		highlight,
		description,
		ctaText = 'Get Started',
		image,
		imageAlt = '',
		onCta,
		lSnippet,
		hideDivider = false,
		leftCls,
		titleCls,
		logoCls,
		headingCls,
		highlightCls,
		dividerCls,
		descCls,
		ctaCls,
		imgCls
	}: {
		title?: string;
		logo?: string;
		heading?: string;
		highlight?: string;
		description?: string;
		ctaText?: string;
		image?: string;
		imageAlt?: string;
		onCta?: () => void;
		lSnippet?: Snippet;
		hideDivider?: boolean;
		leftCls?: string;
		titleCls?: string;
		logoCls?: string;
		headingCls?: string;
		highlightCls?: string;
		dividerCls?: string;
		descCls?: string;
		ctaCls?: string;
		imgCls?: string;
	} = $props();

	const parts = $derived(
		highlight && heading.includes(highlight) ? heading.split(highlight) : [heading, '']
	);
</script>

<div class="flex flex-wrap">
	<!-- LEFT SIDE -->
	<div class="w-full sm:w-8/12 mb-10 {leftCls}">
		<div class="container mx-auto h-full sm:p-10">
			<!-- NAV -->
			<nav class="flex px-4 justify-between items-center">
				{#if title}
					<div class="text-4xl font-bold {titleCls}">
						{title}<span class="text-accent/70">.</span>
					</div>
				{/if}
				{#if logo}
					<div>
						<img src={logo} alt="{title} logo" class="w-8 {logoCls}" />
					</div>
				{/if}
			</nav>

			<!-- HERO -->
			<header class="container px-4 lg:flex mt-10 items-center h-full lg:mt-0">
				<div class="w-full">
					<h1 class="text-4xl lg:text-6xl font-bold {headingCls}">
						{#if parts[1] !== ''}
							{parts[0]}<span class="text-accent/85 {highlightCls}">{highlight} </span>{parts
								.slice(1)
								.join(highlight)}
						{:else}
							{heading}
						{/if}
					</h1>
					{#if !hideDivider}
						<div class="w-20 h-2 bg-accent/70 my-4 {dividerCls}"></div>
					{/if}
					{#if description}
						<p class="text-xl mb-10 {descCls}">{description}</p>
					{/if}

					{#if lSnippet}
						{@render lSnippet()}
					{/if}
					{#if onCta}
						<button type="button" class="btn btn-primary {ctaCls}" onclick={() => onCta?.()}>
							{ctaText}
						</button>
					{/if}
				</div>
			</header>
		</div>
	</div>

	<!-- RIGHT SIDE IMAGE -->
	{#if image}
		<img
			src={image}
			alt={imageAlt}
			class="w-full h-48 object-cover sm:h-screen sm:w-4/12 {imgCls}"
		/>
	{/if}
</div>

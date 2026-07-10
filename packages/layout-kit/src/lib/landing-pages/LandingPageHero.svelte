<script lang="ts">
	import type { Snippet } from 'svelte';

let {
    // Text content
    title = 'Welcome',
    heading = 'Build something great',
    highlight = 'great',
    description = 'Create beautiful, responsive layouts with flexible components.',
    ctaText = 'Get Started',

    // Media
    logo = '/logo.svg',
    image = 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=800&q=80',
    imageAlt = 'Hero section image',

    // Actions
    onCta = () => {},

    // Slots
    leftContentSlot,

    // UI toggles
    hideDivider = false,

    // CSS class overrides (no defaults)
    leftSectionClass,
    titleClass,
    logoClass,
    headingClass,
    highlightClass,
    dividerClass,
    descriptionClass,
    buttonClass,
    imageClass
}: {
    title?: string;
    heading?: string;
    highlight?: string;
    description?: string;
    ctaText?: string;

    logo?: string;
    image?: string;
    imageAlt?: string;

    onCta?: () => void;

    leftContentSlot?: Snippet;

    hideDivider?: boolean;

    leftSectionClass?: string;
    titleClass?: string;
    logoClass?: string;
    headingClass?: string;
    highlightClass?: string;
    dividerClass?: string;
    descriptionClass?: string;
    buttonClass?: string;
    imageClass?: string;
} = $props();


	// Highlight splitting logic
	const parts = $derived(
		highlight && heading.includes(highlight) ? heading.split(highlight) : [heading, '']
	);
</script>

<div class="flex flex-wrap">
	<!-- LEFT SIDE -->
	<div class="w-full sm:w-7/12 mb-10 {leftSectionClass}">
		<div class="container mx-auto h-full sm:p-10">
			<!-- NAV -->
			<nav class="flex px-4 justify-between items-center">
				{#if title}
					<div class="text-4xl font-bold {titleClass}">
						{title}<span class="text-accent/70">.</span>
					</div>
				{/if}

				{#if logo}
					<div>
						<img src={logo} alt="{title} logo" class="w-8 {logoClass}" />
					</div>
				{/if}
			</nav>

			<!-- HERO -->
			<header class="container px-4 lg:flex mt-10 items-center h-full lg:mt-0">
				<div class="w-full">
					<h1 class="text-4xl lg:text-6xl font-bold {headingClass}">
						{#if parts[1] !== ''}
							{parts[0]}
							<span class="text-accent/85 {highlightClass}">
								{highlight}
							</span>
							{parts.slice(1).join(highlight)}
						{:else}
							{heading}
						{/if}
					</h1>

					{#if !hideDivider}
						<div class="w-20 h-2 bg-accent/70 my-4 {dividerClass}"></div>
					{/if}

					{#if description}
						<p class="text-xl mb-10 {descriptionClass}">
							{description}
						</p>
					{/if}

					{@render leftContentSlot?.()}

					{#if onCta}
						<button type="button" class="btn btn-primary {buttonClass}" onclick={() => onCta?.()}>
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
			class="w-full h-48 object-cover sm:h-screen sm:w-5/12 {imageClass}"
		/>
	{/if}
</div>

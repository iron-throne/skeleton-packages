<script lang="ts">
	import { CardImage } from 'svelte-bootstrap-icons';
	import {
		IMAGE_ASPECT_CLASS,
		IMAGE_FIT_CLASS,
		IMAGE_OVERLAY_CLASS,
		IMAGE_RADIUS_CLASS
	} from './constants';
	import type { ImageProps } from './types';

	let {
		src = '',
		alt = '',
		caption = '',
		fit = 'cover',
		aspect = 'video',
		radius = 'lg',
		overlay = 'none',
		loading = 'lazy',
		class: klass = '',
		imageClass = '',
		style = '',
		width = '',
		height = '',
		backgroundColor = '',
		gradientFrom = '',
		gradientTo = '',
		borderColor = '',
		borderWidth = '',
		borderRadius = '',
		objectPosition = '',
		overlayColor = '',
		fallbackText = 'Image unavailable',
		showBlueprint = false,
		blueprintColor = '',
		actions,
		topLeft,
		topRight,
		children,
		...imageProps
	}: ImageProps = $props();

	let loaded = $state(false);
	let failed = $state(false);

	$effect(() => {
		src;
		loaded = false;
		failed = false;
	});

	const showFallback = $derived(!src || failed);

	const rootClass = $derived(
		['ui-image', IMAGE_ASPECT_CLASS[aspect], IMAGE_RADIUS_CLASS[radius], klass]
			.filter(Boolean)
			.join(' ')
	);

	const rootStyle = $derived(
		[
			width && `--image-width:${width}`,
			height && `--image-height:${height}`,
			backgroundColor && `--image-bg:${backgroundColor}`,
			gradientFrom &&
				gradientTo &&
				`--image-bg:linear-gradient(135deg,${gradientFrom},${gradientTo})`,
			gradientFrom && `--image-gradient-from:${gradientFrom}`,
			gradientTo && `--image-gradient-to:${gradientTo}`,
			borderColor && `--image-border-color:${borderColor}`,
			borderWidth && `--image-border-width:${borderWidth}`,
			borderRadius && `--image-radius:${borderRadius}`,
			overlayColor && `--image-overlay-color:${overlayColor}`,
			blueprintColor && `--image-blueprint-color:${blueprintColor}`,
			style
		]
			.filter(Boolean)
			.join(';')
	);
</script>

<figure class="ui-image-figure">
	<div class={rootClass} style={rootStyle || undefined}>
		{#if src && !loaded && !failed}
			<div class="ui-image-loading" aria-hidden="true"></div>
		{/if}

		{#if showFallback}
			<div class="ui-image-fallback">
				<CardImage width={26} height={26} aria-hidden="true" />
				<span>{fallbackText}</span>
			</div>
		{:else if src}
			<img
				{...imageProps}
				{src}
				{alt}
				{loading}
				class="ui-image-element {IMAGE_FIT_CLASS[fit]} {imageClass}"
				style:object-position={objectPosition || undefined}
				class:is-loaded={loaded}
				onload={() => (loaded = true)}
				onerror={() => (failed = true)}
			/>
		{/if}

		{#if showBlueprint}
			<div class="ui-image-blueprint" aria-hidden="true">
				<span class="ui-image-blueprint-line blueprint-outer"></span>
				<span class="ui-image-blueprint-line blueprint-middle"></span>
				<span class="ui-image-blueprint-line blueprint-inner"></span>
			</div>
		{/if}

		{#if overlay !== 'none'}
			<div class="ui-image-overlay {IMAGE_OVERLAY_CLASS[overlay]}" aria-hidden="true"></div>
		{/if}

		{#if topLeft}
			<div class="ui-image-top-left">
				{@render topLeft()}
			</div>
		{/if}

		{#if topRight}
			<div class="ui-image-top-right">
				{@render topRight()}
			</div>
		{/if}

		{#if children}
			<div class="ui-image-content">
				{@render children()}
			</div>
		{/if}

		{#if caption && overlay !== 'none'}
			<div class="ui-image-caption">{caption}</div>
		{/if}

		{#if actions}
			<div class="ui-image-actions">
				{@render actions()}
			</div>
		{/if}
	</div>

	{#if caption && overlay === 'none'}
		<figcaption class="ui-image-figcaption">{caption}</figcaption>
	{/if}
</figure>

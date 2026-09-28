<script lang="ts">
	import type { BaseViewerProps, MediaFileType, ViewerSource } from '../types';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		type: MediaFileType;
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
	}

	let {
		source,
		type,
		autoplay = false,
		loop = false,
		muted = false,
		title,
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let objectUrl = $state<string>();
	let mediaUrl = $derived(typeof source === 'string' ? source : objectUrl || '');
	let label = $derived(title || (type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'Audio'));

	$effect(() => {
		if (typeof source === 'string') {
			objectUrl = undefined;
			return;
		}
		const url = URL.createObjectURL(source);
		objectUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	function failed(event: Event) {
		onerror?.({ code: 'LOAD_FAILED', message: `The ${type} could not be loaded.`, cause: event });
	}
</script>

<div
	class={`flex min-h-48 w-full items-center justify-center overflow-hidden bg-zinc-950/95 ${heightClass} ${className}`}
>
	{#if !mediaUrl}
		<!-- waiting for the object URL -->
	{:else if type === 'image'}
		<img
			src={mediaUrl}
			alt={label}
			class="max-h-full max-w-full object-contain"
			onload={() => onload?.()}
			onerror={failed}
		/>
	{:else if type === 'video'}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			src={mediaUrl}
			title={label}
			class="max-h-full max-w-full"
			controls
			playsinline
			{autoplay}
			{loop}
			{muted}
			onloadeddata={() => onload?.()}
			onerror={failed}
		></video>
	{:else}
		<div class="grid w-full max-w-xl gap-4 px-6 text-center text-zinc-100">
			<svg
				class="mx-auto size-14 text-zinc-400"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
			<strong class="truncate text-sm font-semibold">{label}</strong>
			<audio
				src={mediaUrl}
				title={label}
				class="w-full"
				controls
				{autoplay}
				{loop}
				{muted}
				onloadedmetadata={() => onload?.()}
				onerror={failed}
			></audio>
		</div>
	{/if}
</div>

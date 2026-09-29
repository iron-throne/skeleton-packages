<script lang="ts">
	import type { BaseViewerProps } from '../types';
	import { microsoftPowerPointEmbedUrl } from '../utils/file-type';

	interface Props extends BaseViewerProps {
		source: string;
		embedUrl?: (source: string) => string;
		showOpenInNewWindow?: boolean;
		openInNewWindowLabel?: string;
	}

	let {
		source,
		embedUrl = microsoftPowerPointEmbedUrl,
		title = 'PowerPoint presentation',
		heightClass = 'h-[70vh]',
		class: className = '',
		showOpenInNewWindow = true,
		openInNewWindowLabel = 'Open in new window',
		onload,
		onerror
	}: Props = $props();

	let viewerUrl = $derived(embedUrl(source));

	function failed(event: Event) {
		onerror?.({
			code: 'LOAD_FAILED',
			message: 'The PowerPoint presentation could not be loaded.',
			cause: event
		});
	}
</script>

<div class={`relative min-h-80 w-full bg-zinc-100 ${heightClass} ${className}`}>
	{#if showOpenInNewWindow}
		<a
			href={viewerUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="absolute right-3 top-3 z-10 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 text-xs font-medium text-slate-700 no-underline shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			aria-label={openInNewWindowLabel}
			title={openInNewWindowLabel}
		>
			<svg
				class="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M14 5h5v5" />
				<path d="M19 5l-8 8" />
				<path d="M18 13v5H6V6h5" />
			</svg>
			<span>{openInNewWindowLabel}</span>
		</a>
	{/if}

	<iframe
		src={viewerUrl}
		{title}
		class="block h-full min-h-80 w-full border-0 bg-zinc-100"
		allowfullscreen
		onload={() => onload?.()}
		onerror={failed}
	></iframe>
</div>

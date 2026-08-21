<script lang="ts">
	import type { BaseViewerProps } from '../types';
	import { microsoftOfficeEmbedUrl } from '../utils/file-type';

	interface Props extends BaseViewerProps {
		source: string;
		embedUrl?: (source: string) => string;
	}

	let {
		source,
		embedUrl = microsoftOfficeEmbedUrl,
		title = 'Excel workbook',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let viewerUrl = $derived(embedUrl(source));

	function failed(event: Event) {
		onerror?.({
			code: 'LOAD_FAILED',
			message: 'The Excel workbook could not be loaded.',
			cause: event
		});
	}
</script>

<iframe
	src={viewerUrl}
	{title}
	class={`block min-h-80 w-full border-0 bg-zinc-100 ${heightClass} ${className}`}
	allowfullscreen
	onload={() => onload?.()}
	onerror={failed}
></iframe>

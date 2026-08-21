<script lang="ts">
	import type { BaseViewerProps, ViewerSource } from '../types';
	interface Props extends BaseViewerProps { source: ViewerSource; showToolbar?: boolean; }
	let { source, showToolbar = true, title = 'PDF document', heightClass = 'h-[70vh]', class: className = '', onload, onerror }: Props = $props();
	let objectUrl = $state<string>();
	let viewerUrl = $derived(typeof source === 'string' ? source : objectUrl || '');
	let framedUrl = $derived(showToolbar ? viewerUrl : `${viewerUrl}#toolbar=0`);
	$effect(() => {
		if (typeof source === 'string') { objectUrl = undefined; return; }
		const url = URL.createObjectURL(source); objectUrl = url;
		return () => URL.revokeObjectURL(url);
	});
	function failed(event: Event) { onerror?.({ code: 'LOAD_FAILED', message: 'The PDF could not be loaded.', cause: event }); }
</script>

<iframe src={framedUrl} {title} class={`block min-h-80 w-full border-0 bg-zinc-100 ${heightClass} ${className}`} onload={() => onload?.()} onerror={failed}></iframe>

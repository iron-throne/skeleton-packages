<script lang="ts">
	import FileViewer from './FileViewer.svelte';
	 import ViewerHeader from './ViewerHeader.svelte';
	import type { ViewerModalProps } from '../types'; 
	import { detectFileType } from '../utils/file-type';
	let { open = $bindable(false), onclose, ...props }: ViewerModalProps = $props();
	let resolvedType = $derived(props.type || detectFileType(props.source, props.fileName, props.mimeType));
	function close() { open = false; onclose?.(); }
	function backdrop(event: MouseEvent) { if (event.target === event.currentTarget) close(); }
	function keydown(event: KeyboardEvent) { if (event.key === 'Escape') close(); }
</script>
<svelte:window onkeydown={keydown}/>
{#if open}
	<div class="fixed inset-0 z-9999 grid place-items-center bg-zinc-950/65 p-0 backdrop-blur-sm sm:p-8" role="presentation" onclick={backdrop}>
		<div class={`grid h-dvh w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-zinc-100 shadow-2xl sm:h-[90dvh] sm:max-h-232 sm:max-w-7xl sm:rounded-2xl ${props.class || ''}`} role="dialog" aria-modal="true" aria-label={props.title || props.fileName || 'Document preview'}>
			<ViewerHeader source={props.source} fileName={props.fileName} type={resolvedType} downloadName={props.downloadName} appTitle={props.appTitle} appSubtitle={props.appSubtitle} headerClass={props.headerClass} titleClass={props.titleClass} subtitleClass={props.subtitleClass} accentClass={props.accentClass} primaryActionClass={props.primaryActionClass} showOpenAction={props.showOpenAction} showDownloadAction={props.showDownloadAction} onclose={close}/>
			<div class="min-h-0 p-1.5 sm:p-3"><FileViewer {...props} class="h-full overflow-hidden rounded-lg bg-white" heightClass="h-full" /></div>
		</div>
	</div>
{/if}


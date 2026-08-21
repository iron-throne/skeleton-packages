<script lang="ts">
	import FileViewer from './FileViewer.svelte'; import ViewerHeader from './ViewerHeader.svelte';
	import type { ViewerContainerProps } from '../types'; import { detectFileType } from '../utils/file-type';
	let props: ViewerContainerProps = $props();
	let resolvedType = $derived(props.type || detectFileType(props.source, props.fileName, props.mimeType));
</script>
<section class={`grid h-dvh min-h-128 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-zinc-100 ${props.class || ''}`}>
	<ViewerHeader source={props.source} fileName={props.fileName} type={resolvedType} downloadName={props.downloadName} appTitle={props.appTitle} appSubtitle={props.appSubtitle} headerClass={props.headerClass} titleClass={props.titleClass} subtitleClass={props.subtitleClass} accentClass={props.accentClass} primaryActionClass={props.primaryActionClass} showOpenAction={props.showOpenAction} showDownloadAction={props.showDownloadAction}/>
	<div class="min-h-0 p-2 sm:p-4"><FileViewer {...props} class="h-full overflow-hidden rounded-lg bg-white shadow-xl sm:rounded-xl" heightClass="h-full" /></div>
</section>

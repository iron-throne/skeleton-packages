<script lang="ts">
	import { untrack } from 'svelte';
	import FileViewer from './FileViewer.svelte';
	import ViewerHeader from './ViewerHeader.svelte';
	import type { ViewerModalProps, ViewerOpenRequest } from '../types';
	import { detectFileType } from '../utils/file-type';
	let {
		open = $bindable(false),
		onclose,
		onrequestopen: notifyRequest,
		...props
	}: ViewerModalProps = $props();
	let replacement = $state<ViewerOpenRequest>();
	let activeSource = $derived(replacement?.source ?? props.source);
	let activeType = $derived(replacement?.type ?? props.type);
	let activeFileName = $derived(replacement?.fileName ?? props.fileName);
	let activeMimeType = $derived(replacement?.mimeType ?? props.mimeType);
	let resolvedType = $derived(
		activeType || detectFileType(activeSource, activeFileName, activeMimeType)
	);
	$effect(() => {
		const externalSource = props.source;
		if (untrack(() => replacement?.source) === externalSource) return;
		replacement = undefined;
	});
	$effect(() => {
		if (!open) replacement = undefined;
	});
	function switchFile(request: ViewerOpenRequest) {
		replacement = request;
		notifyRequest?.(request);
	}
	function close() {
		replacement = undefined;
		open = false;
		onclose?.();
	}
	function backdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) close();
	}
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={keydown} />
{#if open}
	<div
		class="fixed inset-0 z-9999 grid place-items-center bg-zinc-950/65 p-0 backdrop-blur-sm sm:p-8"
		role="presentation"
		onclick={backdrop}
	>
		<div
			class={`grid h-dvh w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-zinc-100 shadow-2xl sm:h-[90dvh] sm:max-h-232 sm:max-w-7xl sm:rounded-2xl ${props.class || ''}`}
			role="dialog"
			aria-modal="true"
			aria-label={props.title || activeFileName || 'Document preview'}
		>
			<ViewerHeader
				source={activeSource}
				fileName={activeFileName}
				type={resolvedType}
				downloadName={replacement ? activeFileName : props.downloadName}
				appTitle={replacement ? activeFileName : props.appTitle}
				appSubtitle={replacement ? 'Exported drawing preview' : props.appSubtitle}
				headerClass={props.headerClass}
				titleClass={props.titleClass}
				subtitleClass={props.subtitleClass}
				accentClass={props.accentClass}
				primaryActionClass={props.primaryActionClass}
				showOpenAction={props.showOpenAction ?? resolvedType !== 'dwg'}
				showDownloadAction={props.showDownloadAction}
				onclose={close}
			/>

			<div class="min-h-0 p-1.5 sm:p-3">
				<FileViewer
					{...props}
					source={activeSource}
					type={activeType}
					fileName={activeFileName}
					mimeType={activeMimeType}
					onrequestopen={switchFile}
					class="h-full overflow-hidden rounded-lg bg-white"
					heightClass="h-full"
				/>
			</div>
		</div>
	</div>
{/if}

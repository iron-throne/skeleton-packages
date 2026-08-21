<script lang="ts">
	import type { SupportedFileType, ViewerSource } from '../types';
	interface Props {
		source: ViewerSource; fileName?: string; type?: SupportedFileType; downloadName?: string;
		appTitle?: string; appSubtitle?: string; headerClass?: string; titleClass?: string;
		subtitleClass?: string; accentClass?: string; primaryActionClass?: string;
		showOpenAction?: boolean; showDownloadAction?: boolean; closeLabel?: string; onclose?: () => void;
	}
	let { source, fileName, type, downloadName, appTitle, appSubtitle,
		headerClass = 'border-zinc-200 bg-white/95 text-zinc-900', titleClass = '', subtitleClass = 'text-zinc-500',
		accentClass = 'bg-rose-50 text-rose-600 ring-rose-200', primaryActionClass = 'border-zinc-900 bg-zinc-900 text-white',
		showOpenAction = true, showDownloadAction = true, closeLabel = 'Close viewer', onclose }: Props = $props();
	let objectUrl = $state<string>();
	let actionUrl = $derived(typeof source === 'string' ? source : objectUrl);
	let label = $derived(appTitle || fileName || downloadName || 'Document preview');
	let format = $derived(type?.toUpperCase() || 'FILE');
	$effect(() => {
		if (typeof source === 'string') { objectUrl = undefined; return; }
		const url = URL.createObjectURL(source); objectUrl = url;
		return () => URL.revokeObjectURL(url);
	});
</script>

<header class={`flex min-h-16 items-center justify-between gap-4 border-b px-3 py-2 font-sans backdrop-blur-lg sm:min-h-18 sm:px-4 ${headerClass}`}>
	<div class="flex min-w-0 items-center gap-3">
		<div class={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 sm:size-11 ${accentClass}`} aria-hidden="true">
			<svg class="size-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.75h6.2L18 8.55v11.7H7z"/><path d="M13 3.75v5h5M9.5 13h6M9.5 16h4.5"/></svg>
		</div>
		<div class="min-w-0">
			<strong class={`block max-w-[44vw] truncate text-sm font-semibold sm:max-w-lg ${titleClass}`} title={label}>{label}</strong>
			<div class={`mt-1 flex items-center gap-2 text-xs ${subtitleClass}`}><span class="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">{format}</span><span>{appSubtitle || 'Document preview'}</span></div>
		</div>
	</div>
	<div class="flex items-center gap-2">
		{#if showOpenAction && actionUrl}<a class="flex size-10 items-center justify-center gap-2 rounded-xl border border-current/15 bg-current/5 text-current no-underline transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:px-3" href={actionUrl} target="_blank" rel="noreferrer" aria-label="Open in new tab"><svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 5h5v5M19 5l-8 8M18 13v5H6V6h5"/></svg><span class="hidden text-xs font-semibold sm:inline">Open</span></a>{/if}
		{#if showDownloadAction && actionUrl}<a class={`flex size-10 items-center justify-center gap-2 rounded-xl border no-underline transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:px-3 ${primaryActionClass}`} href={actionUrl} download={downloadName || fileName || ''}><svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg><span class="hidden text-xs font-semibold sm:inline">Download</span></a>{/if}
		{#if onclose}<button class="ml-1 grid size-10 cursor-pointer place-items-center rounded-xl border border-current/15 bg-current/5 transition hover:-translate-y-0.5 hover:shadow-md" type="button" aria-label={closeLabel} title={closeLabel} onclick={onclose}><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg></button>{/if}
	</div>
</header>

<script lang="ts">
	import type { BaseViewerProps, ViewerSource } from '../types';
	import { microsoftOfficeEmbedUrl } from '../utils/file-type';
	import { columnLabel, loadSourceBlob, parseXlsx, type ParsedSheet } from '../utils/office-local';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		/**
		 * `xlsx` renders in the browser, so private and blob sources work. Legacy `xls` (or an
		 * unknown type with a URL) uses Microsoft's online viewer, which needs a public URL.
		 */
		type?: 'xls' | 'xlsx';
		embedUrl?: (source: string) => string;
		/** Rows beyond this are dropped to keep large sheets responsive. */
		maxRows?: number;
	}

	let {
		source,
		type,
		embedUrl = microsoftOfficeEmbedUrl,
		maxRows = 2000,
		title = 'Excel workbook',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let sheets = $state<ParsedSheet[]>([]);
	let active = $state(0);
	let loading = $state(true);
	let failed = $state(false);
	// A URL the browser couldn't fetch (CORS, auth) may still be reachable by Microsoft's viewer.
	let useEmbed = $state(false);

	let renderLocally = $derived(source instanceof Blob || type !== 'xls');
	let embedSource = $derived(typeof source === 'string' ? source : undefined);
	let current = $derived(sheets[active]);
	let columnCount = $derived(
		Math.max(0, ...(current?.rows.map((row) => row.reduce((n, c) => n + c.colSpan, 0)) ?? [0]))
	);

	$effect(() => {
		const currentSource = source;
		if (!renderLocally) return;
		const controller = new AbortController();
		loading = true;
		failed = false;
		useEmbed = false;
		active = 0;

		loadSourceBlob(currentSource, controller.signal)
			.then((blob) => blob.arrayBuffer())
			.then((buffer) => parseXlsx(buffer, maxRows))
			.then((parsed) => {
				if (controller.signal.aborted) return;
				sheets = parsed;
				loading = false;
				onload?.();
			})
			.catch((cause) => {
				if (controller.signal.aborted) return;
				loading = false;
				if (typeof currentSource === 'string') {
					useEmbed = true;
					return;
				}
				failed = true;
				onerror?.({
					code: 'LOAD_FAILED',
					message: 'The Excel workbook could not be rendered.',
					cause
				});
			});

		return () => controller.abort();
	});

	function embedFailed(event: Event) {
		onerror?.({
			code: 'LOAD_FAILED',
			message: 'The Excel workbook could not be loaded.',
			cause: event
		});
	}
</script>

{#if (useEmbed || !renderLocally) && embedSource}
	<iframe
		src={embedUrl(embedSource)}
		{title}
		class={`block min-h-80 w-full border-0 bg-zinc-100 ${heightClass} ${className}`}
		allowfullscreen
		onload={() => onload?.()}
		onerror={embedFailed}
	></iframe>
{:else}
	<div
		class={`flex min-h-48 w-full flex-col overflow-hidden bg-white ${heightClass} ${className}`}
		role="document"
		aria-label={title}
	>
		{#if failed || (!loading && !current)}
			<div class="grid flex-1 place-content-center text-sm text-zinc-500">
				The Excel workbook could not be rendered.
			</div>
		{:else if loading}
			<div class="grid flex-1 place-content-center text-sm text-zinc-500">Loading…</div>
		{:else}
			{#if current.truncated}
				<div class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
					Sheet is large — showing the first {maxRows.toLocaleString()} rows.
				</div>
			{/if}
			<div class="min-h-0 flex-1 overflow-auto">
				<table class="min-w-full border-separate border-spacing-0 text-xs text-zinc-900">
					<thead class="sticky top-0 z-10">
						<tr>
							<th class="sticky left-0 z-20 w-10 border-r border-b border-zinc-200 bg-zinc-50"></th>
							{#each { length: columnCount } as _, index (index)}
								<th
									class="min-w-24 border-r border-b border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-500"
								>
									{columnLabel(index)}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each current.rows as row, r (r)}
							<tr>
								<td
									class="sticky left-0 border-r border-b border-zinc-200 bg-zinc-50 px-2 text-center text-zinc-500"
								>
									{r + 1}
								</td>
								{#each row as cell, c (c)}
									<td
										colspan={cell.colSpan}
										rowspan={cell.rowSpan}
										class="border-r border-b border-zinc-200 px-2 py-1 whitespace-pre-wrap"
										>{cell.text}</td
									>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if sheets.length > 1}
				<div
					class="flex shrink-0 gap-1 overflow-x-auto border-t border-zinc-200 bg-zinc-50 px-2 py-1"
					role="tablist"
				>
					{#each sheets as sheet, index (index)}
						<button
							type="button"
							role="tab"
							aria-selected={index === active}
							class={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition ${index === active ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'}`}
							onclick={() => (active = index)}
						>
							{sheet.name}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}

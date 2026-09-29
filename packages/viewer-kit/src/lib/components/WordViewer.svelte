<script lang="ts">
	import type { BaseViewerProps, ViewerSource } from '../types';
	import { microsoftOfficeEmbedUrl } from '../utils/file-type';
	import { loadSourceBlob } from '../utils/office-local';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		/**
		 * `docx` renders in the browser, so private and blob sources work. Legacy `doc` (or an
		 * unknown type with a URL) uses Microsoft's online viewer, which needs a public URL.
		 */
		type?: 'doc' | 'docx';
		embedUrl?: (source: string) => string;
	}

	let {
		source,
		type,
		embedUrl = microsoftOfficeEmbedUrl,
		title = 'Word document',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let container = $state<HTMLDivElement>();
	let loading = $state(true);
	let failed = $state(false);
	// A URL the browser couldn't fetch (CORS, auth) may still be reachable by Microsoft's viewer.
	let useEmbed = $state(false);

	let renderLocally = $derived(source instanceof Blob || type !== 'doc');
	let embedSource = $derived(typeof source === 'string' ? source : undefined);

	$effect(() => {
		const current = source;
		const target = container;
		if (!renderLocally || !target) return;
		const controller = new AbortController();
		loading = true;
		failed = false;
		useEmbed = false;
		target.replaceChildren();

		(async () => {
			const blob = await loadSourceBlob(current, controller.signal);
			// Loaded on demand: docx-preview is only needed when a .docx is opened.
			const { renderAsync } = await import('docx-preview');
			if (controller.signal.aborted) return;
			await renderAsync(blob, target, undefined, {
				inWrapper: false,
				ignoreLastRenderedPageBreak: true
			});
			if (controller.signal.aborted) return;
			loading = false;
			onload?.();
		})().catch((cause) => {
			if (controller.signal.aborted) return;
			loading = false;
			if (typeof current === 'string') {
				useEmbed = true;
				return;
			}
			failed = true;
			onerror?.({ code: 'LOAD_FAILED', message: 'The Word document could not be rendered.', cause });
		});

		return () => controller.abort();
	});

	function embedFailed(event: Event) {
		onerror?.({
			code: 'LOAD_FAILED',
			message: 'The Word document could not be loaded.',
			cause: event
		});
	}
</script>

{#if !renderLocally && embedSource}
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
		class={`relative min-h-48 w-full overflow-hidden bg-white ${heightClass} ${className}`}
		role="document"
		aria-label={title}
	>
		{#if useEmbed && embedSource}
			<iframe
				src={embedUrl(embedSource)}
				{title}
				class="absolute inset-0 size-full border-0 bg-zinc-100"
				allowfullscreen
				onload={() => onload?.()}
				onerror={embedFailed}
			></iframe>
		{:else if failed}
			<div class="grid size-full place-content-center text-sm text-zinc-500">
				The Word document could not be rendered.
			</div>
		{:else if loading}
			<div class="absolute inset-0 grid place-content-center text-sm text-zinc-500">Loading…</div>
		{/if}
		<!-- Stays mounted so the render effect keeps its target when falling back to the embed. -->
		<div
			bind:this={container}
			class={`size-full overflow-auto p-6 text-zinc-900 ${useEmbed || failed ? 'hidden' : ''}`}
		></div>
	</div>
{/if}

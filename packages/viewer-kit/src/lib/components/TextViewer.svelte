<script lang="ts">
	import type { BaseViewerProps, ViewerSource } from '../types';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		fileName?: string;
		/** Content beyond this many characters is truncated to keep the page responsive. */
		maxLength?: number;
		wrap?: boolean;
	}

	let {
		source,
		fileName,
		maxLength = 2_000_000,
		wrap = false,
		title = 'Text document',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let content = $state<string>();
	let truncated = $state(false);
	let failed = $state(false);

	function format(text: string): string {
		const name = (fileName || (typeof source === 'string' ? source : '')).split(/[?#]/, 1)[0];
		const isJson =
			/\.json$/i.test(name) || (source instanceof Blob && source.type === 'application/json');
		if (!isJson) return text;
		try {
			return JSON.stringify(JSON.parse(text), null, 2);
		} catch {
			return text;
		}
	}

	$effect(() => {
		const current = source;
		const controller = new AbortController();
		content = undefined;
		truncated = false;
		failed = false;

		const load =
			typeof current === 'string'
				? fetch(current, { signal: controller.signal }).then((response) => {
						if (!response.ok) throw new Error(`HTTP ${response.status}`);
						return response.text();
					})
				: current.text();

		load
			.then((text) => {
				if (controller.signal.aborted) return;
				truncated = text.length > maxLength;
				content = format(truncated ? text.slice(0, maxLength) : text);
				onload?.();
			})
			.catch((cause) => {
				if (controller.signal.aborted) return;
				failed = true;
				onerror?.({ code: 'LOAD_FAILED', message: 'The text file could not be loaded.', cause });
			});

		return () => controller.abort();
	});
</script>

<div
	class={`flex min-h-48 w-full flex-col overflow-hidden bg-white ${heightClass} ${className}`}
	role="document"
	aria-label={title}
>
	{#if failed}
		<div class="grid flex-1 place-content-center text-sm text-zinc-500">
			The text file could not be loaded.
		</div>
	{:else if content === undefined}
		<div class="grid flex-1 place-content-center text-sm text-zinc-500">Loading…</div>
	{:else}
		{#if truncated}
			<div class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
				File is large — showing the first {maxLength.toLocaleString()} characters.
			</div>
		{/if}
		<pre
			class={`m-0 flex-1 overflow-auto p-4 font-mono text-[13px] leading-5 text-zinc-800 ${wrap ? 'wrap-break-word whitespace-pre-wrap' : 'whitespace-pre'}`}>{content}</pre>
	{/if}
</div>

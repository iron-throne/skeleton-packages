<script lang="ts">
	import type { BaseViewerProps, ViewerDownloadRequest, ViewerSource } from '../types';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		fileName?: string;
		mimeType?: string;
		message?: string;
		ondownload?: (request: ViewerDownloadRequest) => void;
	}

	let {
		source,
		fileName,
		mimeType,
		message = 'Preview is not available for this file type.',
		title,
		heightClass = 'h-[70vh]',
		class: className = '',
		ondownload
	}: Props = $props();

	let name = $derived(
		fileName ||
			(typeof source === 'string'
				? decodeURIComponent(source.split(/[?#]/, 1)[0].split('/').pop() || '')
				: source instanceof File
					? source.name
					: '') ||
			title ||
			'Untitled file'
	);
	let extension = $derived(name.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toUpperCase());
	let resolvedMimeType = $derived(mimeType || (source instanceof Blob ? source.type : undefined));
	let size = $derived(source instanceof Blob ? formatSize(source.size) : undefined);

	function formatSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let value = bytes;
		let unit = 0;
		while (value >= 1024 && unit < units.length - 1) {
			value /= 1024;
			unit++;
		}
		return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
	}

	function download() {
		ondownload?.({ source, fileName: name, mimeType: resolvedMimeType });
	}
</script>

<div
	class={`grid min-h-48 w-full place-items-center bg-zinc-50 p-6 ${heightClass} ${className}`}
	role="status"
>
	<div
		class="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
	>
		<div class="relative grid size-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-500">
			<svg
				class="size-8"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M7 3.75h6.2L18 8.55v11.7H7z" />
				<path d="M13 3.75v5h5" />
			</svg>
			{#if extension}
				<span
					class="absolute -right-2 -bottom-1.5 rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
				>
					{extension}
				</span>
			{/if}
		</div>

		<div class="grid min-w-0 gap-1">
			<strong class="truncate text-sm font-semibold text-zinc-900" title={name}>{name}</strong>
			{#if size || resolvedMimeType}
				<span class="truncate text-xs text-zinc-500">
					{[size, resolvedMimeType].filter(Boolean).join(' · ')}
				</span>
			{/if}
		</div>

		<p class="text-sm text-zinc-500">{message}</p>

		{#if ondownload}
			<button
				type="button"
				onclick={download}
				class="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
			>
				<svg
					class="size-4.5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"
				>
					<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
				</svg>
				Download
			</button>
		{/if}
	</div>
</div>

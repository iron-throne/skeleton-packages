<script lang="ts">
	import PdfViewer from './PdfViewer.svelte';
	import PowerPointViewer from './PowerPointViewer.svelte';
	import ExcelViewer from './ExcelViewer.svelte';
	import BimViewer from './BimViewer.svelte';
	import type { FileViewerProps, ViewerError } from '../types';
	import type { BimFileType, SupportedFileType } from '../types';
	import { detectFileType } from '../utils/file-type';

	let {
		source,
		type,
		fileName,
		mimeType,
		showToolbar = true,
		powerPointEmbedUrl,
		excelEmbedUrl,
		bimConverter,
		title,
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: FileViewerProps = $props();

	let resolvedType = $derived(type || detectFileType(source, fileName, mimeType));
	const bimTypes: SupportedFileType[] = [
		'dwg',
		'dxf',
		'ifc',
		'rvt',
		'nwd',
		'nwc',
		'gltf',
		'glb',
		'svg'
	];
	function isBimType(value: SupportedFileType | undefined): value is BimFileType {
		return value !== undefined && bimTypes.includes(value);
	}
	let validationError = $derived.by((): ViewerError | undefined => {
		if (!resolvedType) {
			return { code: 'UNSUPPORTED_TYPE', message: 'This file type is not supported yet.' };
		}
		if (resolvedType !== 'pdf' && !isBimType(resolvedType) && typeof source !== 'string') {
			return {
				code: 'INVALID_SOURCE',
				message: 'Office files require a publicly reachable URL or a custom embed adapter.'
			};
		}
		return undefined;
	});

	let reportedError: ViewerError | undefined;
	$effect(() => {
		if (validationError && validationError !== reportedError) {
			reportedError = validationError;
			onerror?.(validationError);
		} else if (!validationError) {
			reportedError = undefined;
		}
	});
</script>

{#if validationError}
	<div
		class={`grid min-h-48 place-content-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-700 ${heightClass} ${className}`}
		role="alert"
	>
		<strong>Preview unavailable</strong>
		<span class="text-zinc-500">{validationError.message}</span>
	</div>
{:else if resolvedType === 'pdf'}
	<PdfViewer {source} {showToolbar} {title} {heightClass} class={className} {onload} {onerror} />
{:else if (resolvedType === 'ppt' || resolvedType === 'pptx') && typeof source === 'string'}
	<PowerPointViewer
		{source}
		embedUrl={powerPointEmbedUrl}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if isBimType(resolvedType)}
	<BimViewer
		{source}
		type={resolvedType}
		{bimConverter}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if typeof source === 'string'}
	<ExcelViewer
		{source}
		embedUrl={excelEmbedUrl}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{/if}

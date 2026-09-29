<script lang="ts">
	import PdfViewer from './PdfViewer.svelte';
	import PowerPointViewer from './PowerPointViewer.svelte';
	import ExcelViewer from './ExcelViewer.svelte';
	import WordViewer from './WordViewer.svelte';
	import BimViewer from './BimViewer.svelte';
	import DwgViewer from './DwgViewer.svelte';
	import MediaViewer from './MediaViewer.svelte';
	import TextViewer from './TextViewer.svelte';
	import FallbackViewer from './FallbackViewer.svelte';
	import type { FileViewerProps, ViewerError } from '../types';
	import type { BimFileType, SupportedFileType } from '../types';
	import { detectFileType, isMediaType, isOfficeType } from '../utils/file-type';

	let {
		source,
		type,
		fileName,
		mimeType,
		showToolbar = true,
		powerPointEmbedUrl,
		excelEmbedUrl,
		wordEmbedUrl,
		title,
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror,
		onrequestopen,
		ondownload
	}: FileViewerProps = $props();

	let resolvedType = $derived(type || detectFileType(source, fileName, mimeType));
	const bimTypes: SupportedFileType[] = ['ifc', 'gltf', 'glb', 'svg'];
	// docx/xlsx render in the browser from bytes; the other Office formats need Microsoft's viewer.
	function isLocalOfficeType(value: SupportedFileType): boolean {
		return value === 'docx' || value === 'xlsx';
	}
	function isBimType(value: SupportedFileType | undefined): value is BimFileType {
		return value !== undefined && bimTypes.includes(value);
	}
	let validationError = $derived.by((): ViewerError | undefined => {
		if (!resolvedType) {
			return { code: 'UNSUPPORTED_TYPE', message: 'Preview is not available for this file type.' };
		}
		if (isOfficeType(resolvedType) && typeof source !== 'string' && !isLocalOfficeType(resolvedType)) {
			return {
				code: 'INVALID_SOURCE',
				message: 'This Office format requires a publicly reachable URL or a custom embed adapter.'
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
	<FallbackViewer
		{source}
		{fileName}
		{mimeType}
		{title}
		message={validationError.message}
		{heightClass}
		class={className}
		ondownload={ondownload &&
			((request) => ondownload({ ...request, type: resolvedType }))}
	/>
{:else if resolvedType === 'pdf'}
	<PdfViewer {source} {showToolbar} {title} {heightClass} class={className} {onload} {onerror} />
{:else if resolvedType === 'dwg'}
	{#key source}
		<DwgViewer
			{source}
			{title}
			{heightClass}
			class={className}
			{onload}
			{onerror}
			{onrequestopen}
		/>
	{/key}
{:else if isMediaType(resolvedType)}
	<MediaViewer
		{source}
		type={resolvedType}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if resolvedType === 'text'}
	<TextViewer {source} {fileName} {title} {heightClass} class={className} {onload} {onerror} />
{:else if isBimType(resolvedType)}
	<BimViewer
		{source}
		type={resolvedType}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if resolvedType === 'doc' || resolvedType === 'docx'}
	<WordViewer
		{source}
		type={resolvedType}
		embedUrl={wordEmbedUrl}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if resolvedType === 'xls' || resolvedType === 'xlsx'}
	<ExcelViewer
		{source}
		type={resolvedType}
		embedUrl={excelEmbedUrl}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{:else if typeof source === 'string'}
	<PowerPointViewer
		{source}
		embedUrl={powerPointEmbedUrl}
		{title}
		{heightClass}
		class={className}
		{onload}
		{onerror}
	/>
{/if}

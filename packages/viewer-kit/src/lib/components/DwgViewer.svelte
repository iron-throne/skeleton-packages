<script lang="ts">
	import { onMount } from 'svelte';
	import {
		CadViewer,
		type DxfEntity,
		type DxfLayer,
		type MeasureEvent,
		type SelectEvent,
		type Tool
	} from '@cadview/core';
	import type { BaseViewerProps, ViewerOpenRequest, ViewerSource } from '../types';
	import {
		DwgConversionError,
		LARGE_DWG_INPUT_BYTES,
		STANDARD_DWG_INPUT_BYTES,
		convertDwgLocally,
		type DwgConversionResult,
		type DwgPresentation,
		type DwgPresentationRequest
	} from '../utils/dwg-converter';
	import {
		DwgLayoutViewer,
		type DwgLayoutMeasureEvent,
		type DwgLayoutSelection
	} from '../utils/dwg-layout-viewer';

	type LoadStage = 'source' | 'validation' | 'conversion' | 'rendering';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		onrequestopen?: (request: ViewerOpenRequest) => void;
	}

	const DWG_RELEASES: Record<string, string> = {
		AC1009: 'R11/R12',
		AC1012: 'R13',
		AC1014: 'R14',
		AC1015: 'R2000',
		AC1018: 'R2004',
		AC1021: 'R2007',
		AC1024: 'R2010',
		AC1027: 'R2013',
		AC1032: 'R2018'
	};

	let {
		source,
		title = 'DWG drawing',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror,
		onrequestopen
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let fileInput: HTMLInputElement;
	let pdfInput: HTMLInputElement;
	let viewer: CadViewer | undefined;
	let layoutViewer: DwgLayoutViewer | undefined;
	let loading = $state(true);
	let errorMessage = $state('');
	let errorDetails = $state('');
	let status = $state('Reading drawing...');
	let warningMessage = $state('');
	let warningDismissed = $state(false);
	let embeddedPreviewUrl = $state('');
	let replacementError = $state('');
	let tool = $state<Tool>('pan');
	let layers = $state<DxfLayer[]>([]);
	let layerVisibility = $state<Record<string, boolean>>({});
	let layersOpen = $state(false);
	let viewsOpen = $state(false);
	let propertiesOpen = $state(false);
	let selectedTitle = $state('Nothing selected');
	let selectedDetails = $state('Choose Select, then click an entity in the drawing.');
	let selectedProperties = $state<Array<{ label: string; value: string }>>([]);
	let largeFilePrompt = $state(false);
	let largeFileSize = $state(0);
	let largeFileName = $state('large drawing.dwg');
	let pendingLargeSource: ViewerSource | undefined;
	let activeDrawingSource: Blob | undefined;
	let activeAllowLargeFile = false;
	let presentation = $state<DwgPresentation>();
	let disposed = false;
	let loadGeneration = 0;
	let loadController: AbortController | undefined;

	function isLocalPath(value: string) {
		return /^(?:[a-zA-Z]:[\\/]|file:\/\/|\\\\)/.test(value.trim());
	}

	async function readSource(candidate: ViewerSource, signal: AbortSignal) {
		if (typeof candidate !== 'string') return candidate;
		if (isLocalPath(candidate)) {
			throw new Error(
				'Browsers cannot read a C:\\ or file:// path directly. Click Choose DWG file and select the drawing.'
			);
		}
		const response = await fetch(candidate, { signal });
		if (!response.ok) throw new Error(`DWG request failed with ${response.status}.`);
		return response.blob();
	}

	function identifyUnexpectedFile(buffer: ArrayBuffer) {
		const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 8));
		if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
			return 'This file contains JPEG image data even though its name ends in .dwg.';
		}
		if (String.fromCharCode(...bytes.slice(0, 4)) === '%PDF') {
			return 'This file contains PDF data even though its name ends in .dwg.';
		}
		if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
			return 'This file contains ZIP data even though its name ends in .dwg.';
		}
		return 'The selected file does not contain a valid DWG header.';
	}

	function getDwgVersion(buffer: ArrayBuffer) {
		if (buffer.byteLength < 6) return null;
		const version = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, 6));
		return /^AC10\d{2}$/.test(version) ? version : null;
	}

	function getDwgReleaseName(version: string) {
		return DWG_RELEASES[version] ?? null;
	}

	function formatByteLength(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function getSourceName(candidate: ViewerSource) {
		if (typeof candidate !== 'string') {
			return candidate instanceof File && candidate.name ? candidate.name : title;
		}
		const clean = candidate.split(/[?#]/, 1)[0];
		return decodeURIComponent(clean.split('/').pop() || title);
	}

	function suggestedPreviewName() {
		return largeFileName.replace(/\.dwg$/i, '.pdf');
	}

	function clearEmbeddedPreview() {
		if (embeddedPreviewUrl) URL.revokeObjectURL(embeddedPreviewUrl);
		embeddedPreviewUrl = '';
	}

	function showEmbeddedPreview(preview: Blob) {
		clearEmbeddedPreview();
		embeddedPreviewUrl = URL.createObjectURL(preview);
	}

	function requestLargeFileConfirmation(
		candidate: ViewerSource,
		fileSize: number,
		nameSource: ViewerSource = candidate
	) {
		pendingLargeSource = candidate;
		largeFileSize = fileSize;
		largeFileName = getSourceName(nameSource);
		largeFilePrompt = true;
		loading = false;
	}

	function describeError(cause: unknown) {
		const messages: string[] = [];
		const seen: unknown[] = [];
		function visit(current: unknown) {
			if (current === undefined || current === null || seen.includes(current)) return;
			seen.push(current);
			if (current instanceof AggregateError) {
				if (current.message && !messages.includes(current.message)) messages.push(current.message);
				for (const nested of current.errors) visit(nested);
				visit(current.cause);
				return;
			}
			if (!(current instanceof Error)) {
				const message = String(current);
				if (message && !messages.includes(message)) messages.push(message);
				return;
			}
			let message = current.message;
			const embeddedAsset = message.indexOf('data:');
			if (embeddedAsset >= 0)
				message = `${message.slice(0, embeddedAsset)}the bundled decoder asset.`;
			if (message && !messages.includes(message)) messages.push(message);
			visit(current.cause);
		}
		visit(cause);
		return messages.join(' ');
	}

	function messageForStage(stage: LoadStage) {
		switch (stage) {
			case 'source':
				return 'The drawing could not be read.';
			case 'validation':
				return 'The selected file is not a valid DWG drawing.';
			case 'conversion':
				return 'The DWG drawing could not be converted in this browser.';
			case 'rendering':
				return 'The drawing was converted but could not be rendered.';
		}
	}

	function destroyViewer() {
		viewer?.off('select', entitySelected);
		viewer?.off('measure', measured);
		viewer?.destroy();
		viewer = undefined;
		layoutViewer?.off('select', layoutEntitySelected);
		layoutViewer?.off('measure', layoutMeasured);
		layoutViewer?.destroy();
		layoutViewer = undefined;
	}

	function fitDrawing() {
		viewer?.fitToView();
		layoutViewer?.fitToView();
	}

	function zoomDrawing(factor: number) {
		if (viewer) {
			viewer.zoomTo(viewer.getViewTransform().scale * factor);
		}
		layoutViewer?.zoomBy(factor);
	}

	function setDrawingLayerVisible(name: string, visible: boolean) {
		viewer?.setLayerVisible(name, visible);
		layoutViewer?.setLayerVisible(name, visible);
	}

	function pointValue(point: { x: number; y: number; z?: number }) {
		return `${point.x.toFixed(3)}, ${point.y.toFixed(3)}${point.z ? `, ${point.z.toFixed(3)}` : ''}`;
	}

	function entityPropertyRows(entity: DxfEntity): Array<{ label: string; value: string }> {
		const common = [
			{ label: 'Linetype', value: entity.lineType || 'BYLAYER' },
			{ label: 'Lineweight', value: String(entity.lineWeight) },
			{
				label: 'Color',
				value:
					entity.trueColor === undefined
						? `ACI ${entity.color}`
						: `#${entity.trueColor.toString(16).padStart(6, '0').toUpperCase()}`
			}
		];
		switch (entity.type) {
			case 'LINE':
				return [
					...common,
					{ label: 'Start', value: pointValue(entity.start) },
					{ label: 'End', value: pointValue(entity.end) },
					{
						label: 'Length',
						value: Math.hypot(entity.end.x - entity.start.x, entity.end.y - entity.start.y).toFixed(
							3
						)
					}
				];
			case 'CIRCLE':
				return [
					...common,
					{ label: 'Center', value: pointValue(entity.center) },
					{ label: 'Radius', value: entity.radius.toFixed(3) }
				];
			case 'ARC':
				return [
					...common,
					{ label: 'Center', value: pointValue(entity.center) },
					{ label: 'Radius', value: entity.radius.toFixed(3) },
					{ label: 'Start angle', value: `${entity.startAngle.toFixed(2)}°` },
					{ label: 'End angle', value: `${entity.endAngle.toFixed(2)}°` }
				];
			case 'LWPOLYLINE':
			case 'POLYLINE':
				return [
					...common,
					{ label: 'Vertices', value: entity.vertices.length.toLocaleString('en-US') },
					{ label: 'Closed', value: entity.closed ? 'Yes' : 'No' }
				];
			case 'ELLIPSE':
				return [
					...common,
					{ label: 'Center', value: pointValue(entity.center) },
					{ label: 'Minor ratio', value: entity.minorRatio.toFixed(5) }
				];
			case 'SPLINE':
				return [
					...common,
					{ label: 'Degree', value: String(entity.degree) },
					{ label: 'Control points', value: entity.controlPoints.length.toLocaleString('en-US') }
				];
			case 'TEXT':
			case 'MTEXT':
				return [
					...common,
					{ label: 'Text', value: entity.text || '—' },
					{ label: 'Insertion', value: pointValue(entity.insertionPoint) },
					{ label: 'Height', value: entity.height.toFixed(3) },
					{ label: 'Style', value: entity.style || 'Standard' }
				];
			case 'INSERT':
				return [
					...common,
					{ label: 'Block', value: entity.blockName },
					{ label: 'Insertion', value: pointValue(entity.insertionPoint) },
					{
						label: 'Scale',
						value: `${entity.scaleX.toFixed(4)}, ${entity.scaleY.toFixed(4)}, ${entity.scaleZ.toFixed(4)}`
					},
					{ label: 'Rotation', value: `${entity.rotation.toFixed(2)}°` },
					...(entity.attribs.length
						? [
								{
									label: 'Attributes',
									value: entity.attribs
										.slice(0, 12)
										.map((attribute) => `${attribute.tag}=${attribute.text}`)
										.join(' · ')
								}
							]
						: [])
				];
			case 'DIMENSION':
				return [
					...common,
					{ label: 'Style', value: entity.dimStyle || 'Standard' },
					{ label: 'Definition', value: pointValue(entity.defPoint) },
					{ label: 'Text', value: entity.textOverride || '<>' }
				];
			case 'HATCH':
				return [
					...common,
					{ label: 'Pattern', value: entity.patternName },
					{ label: 'Solid fill', value: entity.solidFill ? 'Yes' : 'No' },
					{ label: 'Boundaries', value: entity.boundaryPaths.length.toLocaleString('en-US') }
				];
			case 'POINT':
				return [...common, { label: 'Position', value: pointValue(entity.position) }];
		}
	}

	function entitySelected(event: SelectEvent) {
		selectedTitle = event.entity.type;
		selectedProperties = [
			{ label: 'Space', value: 'Model' },
			{ label: 'Type', value: event.entity.type },
			{ label: 'Layer', value: event.entity.layer || '0' },
			...(event.entity.handle ? [{ label: 'Handle', value: event.entity.handle }] : []),
			...entityPropertyRows(event.entity),
			{ label: 'X', value: event.worldPoint.x.toFixed(3) },
			{ label: 'Y', value: event.worldPoint.y.toFixed(3) }
		];
		selectedDetails = [
			`Layer: ${event.entity.layer || '0'}`,
			event.entity.handle ? `Handle: ${event.entity.handle}` : '',
			`Position: ${event.worldPoint.x.toFixed(2)}, ${event.worldPoint.y.toFixed(2)}`
		]
			.filter(Boolean)
			.join(' · ');
	}

	function measured(event: MeasureEvent) {
		selectedTitle = 'Measurement';
		selectedProperties = [
			{ label: 'Distance', value: event.distance.toFixed(3) },
			{ label: 'Angle', value: `${event.angle.toFixed(2)}°` },
			{ label: 'ΔX', value: event.deltaX.toFixed(3) },
			{ label: 'ΔY', value: event.deltaY.toFixed(3) }
		];
		selectedDetails = `Distance: ${event.distance.toFixed(3)} · Angle: ${event.angle.toFixed(2)}° · ΔX: ${event.deltaX.toFixed(3)} · ΔY: ${event.deltaY.toFixed(3)}`;
	}

	function layoutEntitySelected(selection: DwgLayoutSelection | null) {
		if (!selection) {
			selectedTitle = 'Nothing selected';
			selectedDetails = 'Choose Select, then click an entity or viewport in the sheet.';
			selectedProperties = [];
			return;
		}
		if (selection.kind === 'viewport') {
			selectedTitle = 'VIEWPORT';
			selectedDetails = `Paper viewport ${selection.viewportId} · Scale 1:${(1 / selection.viewportScale).toFixed(2)}`;
			selectedProperties = [
				{ label: 'Space', value: 'Paper' },
				{ label: 'Type', value: 'VIEWPORT' },
				{ label: 'Viewport', value: selection.viewportId },
				{ label: 'Scale', value: `1:${(1 / selection.viewportScale).toFixed(2)}` },
				{ label: 'Paper X', value: selection.paperPoint.x.toFixed(3) },
				{ label: 'Paper Y', value: selection.paperPoint.y.toFixed(3) }
			];
			return;
		}

		const entity = selection.entity;
		selectedTitle = entity.type;
		selectedProperties = [
			{ label: 'Space', value: selection.space === 'model' ? 'Model through viewport' : 'Paper' },
			{ label: 'Type', value: entity.type },
			{ label: 'Layer', value: entity.layer || '0' },
			...(entity.handle ? [{ label: 'Handle', value: entity.handle }] : []),
			...entityPropertyRows(entity),
			...(selection.viewportId ? [{ label: 'Viewport', value: selection.viewportId }] : []),
			...(selection.viewportScale
				? [{ label: 'Viewport scale', value: `1:${(1 / selection.viewportScale).toFixed(2)}` }]
				: []),
			{ label: 'Paper X', value: selection.paperPoint.x.toFixed(3) },
			{ label: 'Paper Y', value: selection.paperPoint.y.toFixed(3) },
			...(selection.modelPoint
				? [
						{ label: 'Model X', value: selection.modelPoint.x.toFixed(3) },
						{ label: 'Model Y', value: selection.modelPoint.y.toFixed(3) }
					]
				: [])
		];
		selectedDetails = [
			`Space: ${selection.space === 'model' ? 'Model' : 'Paper'}`,
			`Layer: ${entity.layer || '0'}`,
			entity.handle ? `Handle: ${entity.handle}` : '',
			selection.viewportId ? `Viewport: ${selection.viewportId}` : ''
		]
			.filter(Boolean)
			.join(' · ');
	}

	function layoutMeasured(event: DwgLayoutMeasureEvent) {
		measured(event);
		selectedProperties = [
			{ label: 'Space', value: event.space === 'model' ? 'Model' : 'Paper' },
			...(event.viewportId ? [{ label: 'Viewport', value: event.viewportId }] : []),
			...selectedProperties
		];
		selectedDetails = `${event.space === 'model' ? 'Model' : 'Paper'}${event.viewportId ? ` · Viewport ${event.viewportId}` : ''} · ${selectedDetails}`;
	}

	function togglePanel(panel: 'views' | 'layers' | 'properties') {
		viewsOpen = panel === 'views' ? !viewsOpen : false;
		layersOpen = panel === 'layers' ? !layersOpen : false;
		propertiesOpen = panel === 'properties' ? !propertiesOpen : false;
	}

	async function prepare(
		candidate: ViewerSource = source,
		allowLargeFile = false,
		presentationRequest: DwgPresentationRequest = 'auto'
	) {
		pendingLargeSource = undefined;
		if (!allowLargeFile || candidate instanceof File || typeof candidate === 'string') {
			largeFileName = getSourceName(candidate);
		}
		loadController?.abort();
		const controller = new AbortController();
		loadController = controller;
		const generation = ++loadGeneration;
		let stage: LoadStage = 'source';
		destroyViewer();
		loading = true;
		errorMessage = '';
		errorDetails = '';
		status = 'Reading drawing...';
		warningMessage = '';
		warningDismissed = false;
		presentation = undefined;
		replacementError = '';
		clearEmbeddedPreview();
		largeFilePrompt = false;
		layers = [];
		layerVisibility = {};
		selectedProperties = [];
		try {
			if (!allowLargeFile && typeof candidate !== 'string') {
				if (candidate.size > LARGE_DWG_INPUT_BYTES) {
					stage = 'conversion';
					throw new Error(
						`This DWG exceeds the absolute browser-local limit of ${LARGE_DWG_INPUT_BYTES / 1024 / 1024} MB.`
					);
				}
				if (candidate.size > STANDARD_DWG_INPUT_BYTES) {
					requestLargeFileConfirmation(candidate, candidate.size);
					return;
				}
			}
			const drawingSource = await readSource(candidate, controller.signal);
			if (disposed || generation !== loadGeneration) return;
			activeDrawingSource = drawingSource;
			activeAllowLargeFile = allowLargeFile;
			const fileSize = drawingSource.size;
			if (fileSize > LARGE_DWG_INPUT_BYTES) {
				stage = 'conversion';
				throw new Error(
					`This DWG exceeds the absolute browser-local limit of ${LARGE_DWG_INPUT_BYTES / 1024 / 1024} MB.`
				);
			}
			if (!allowLargeFile && fileSize > STANDARD_DWG_INPUT_BYTES) {
				requestLargeFileConfirmation(drawingSource, fileSize, candidate);
				return;
			}

			stage = 'validation';
			const header = await drawingSource.slice(0, 8).arrayBuffer();
			const version = getDwgVersion(header);
			if (!version) throw new Error(identifyUnexpectedFile(header));
			const release = getDwgReleaseName(version);

			stage = 'conversion';
			status = `${allowLargeFile ? 'Converting large' : 'Converting'} ${release ? `AutoCAD ${release}` : version} drawing locally...`;
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			let conversion: DwgConversionResult;
			try {
				conversion = await convertDwgLocally(drawingSource, {
					signal: controller.signal,
					allowLargeFile,
					transferInput: true,
					presentation: presentationRequest
				});
			} catch (conversionCause) {
				if (conversionCause instanceof DwgConversionError && conversionCause.preview?.blob) {
					showEmbeddedPreview(conversionCause.preview.blob);
				}
				throw new Error(
					`Local conversion failed for ${version}${release ? ` / AutoCAD ${release}` : ''} (${formatByteLength(fileSize)}).`,
					{ cause: conversionCause }
				);
			}
			if (disposed || generation !== loadGeneration) return;
			warningMessage = conversion.warnings.join(' ');
			presentation = conversion.presentation;

			stage = 'rendering';
			status =
				conversion.presentation.mode === 'layout'
					? 'Composing paper-space viewports...'
					: 'Drawing CAD entities...';
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			if (conversion.presentation.mode === 'layout') {
				if (!conversion.paperDocument) {
					throw new Error('The converted paper layout is missing its paper-space document.');
				}
				tool = 'pan';
				layoutViewer = new DwgLayoutViewer(
					canvas,
					conversion.document,
					conversion.paperDocument,
					conversion.presentation
				);
				layoutViewer.on('select', layoutEntitySelected);
				layoutViewer.on('measure', layoutMeasured);
				if (layoutViewer.omittedPaperEntityCount > 0) {
					warningMessage = [
						warningMessage,
						`${layoutViewer.omittedPaperEntityCount} outlying paper-block primitives were excluded because their exported bounds exceeded the saved sheet. Use PDF for the exact title block.`
					]
						.filter(Boolean)
						.join(' ');
				}
				layers = layoutViewer.getLayers();
				selectedTitle = `Sheet: ${conversion.presentation.layoutName || 'Paper layout'}`;
				selectedDetails =
					'Use Select to inspect paper or viewport entities, or Measure within one viewport.';
			} else {
				viewer = new CadViewer(canvas, {
					theme: 'dark',
					initialTool: tool,
					worker: true
				});
				viewer.on('select', entitySelected);
				viewer.on('measure', measured);
				viewer.loadDocument(conversion.document);
				layers = viewer.getLayers();
				selectedTitle = 'Nothing selected';
				selectedDetails = 'Choose Select, then click an entity in the drawing.';
			}
			if (disposed || generation !== loadGeneration) return;

			layerVisibility = Object.fromEntries(
				layers.map((layer) => [layer.name, !layer.isOff && !layer.isFrozen])
			);
			if (
				conversion.entityCount > 0 &&
				layers.length > 0 &&
				layers.every((layer) => layer.isOff || layer.isFrozen)
			) {
				for (const layer of layers) setDrawingLayerVisible(layer.name, true);
				layerVisibility = Object.fromEntries(layers.map((layer) => [layer.name, true]));
				warningMessage = [
					warningMessage,
					'Every saved layer was hidden, so the viewer temporarily revealed all layers. The source drawing was not changed.'
				]
					.filter(Boolean)
					.join(' ');
			}
			fitDrawing();
			loading = false;
			status = `${layers.length} layers · ${conversion.entityCount} entities loaded`;
			onload?.();
		} catch (cause) {
			if (controller.signal.aborted || disposed || generation !== loadGeneration) return;
			destroyViewer();
			loading = false;
			errorMessage = messageForStage(stage);
			errorDetails = describeError(cause);
			console.error(`[DwgViewer] ${stage} failed: ${errorDetails}`);
			onerror?.({
				code: 'LOAD_FAILED',
				message: errorDetails ? `${errorMessage} ${errorDetails}` : errorMessage,
				cause
			});
		} finally {
			if (loadController === controller) loadController = undefined;
		}
	}

	function tryLargeFile() {
		const candidate = pendingLargeSource;
		if (candidate) prepare(candidate, true);
	}

	function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) prepare(file);
	}

	function openPdfPicker() {
		replacementError = '';
		pdfInput?.click();
	}

	async function choosePdf(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		const generation = loadGeneration;
		input.value = '';
		if (!file) return;
		try {
			const signature = new TextDecoder('ascii').decode(await file.slice(0, 5).arrayBuffer());
			if (disposed || generation !== loadGeneration) return;
			if (signature !== '%PDF-') {
				replacementError = 'The selected replacement is not a valid PDF file.';
				return;
			}
		} catch {
			if (!disposed && generation === loadGeneration) {
				replacementError = 'The selected PDF could not be read.';
			}
			return;
		}
		if (disposed || generation !== loadGeneration) return;
		replacementError = '';
		try {
			onrequestopen?.({
				source: file,
				type: 'pdf',
				fileName: file.name,
				mimeType: file.type || 'application/pdf'
			});
		} catch (cause) {
			replacementError = 'The selected PDF could not be opened in the viewer.';
			console.error('[DwgViewer] PDF handoff failed:', cause);
		}
	}

	function setTool(nextTool: Tool) {
		tool = nextTool;
		viewer?.setTool(nextTool);
		layoutViewer?.setTool(nextTool);
	}

	function switchPresentation(next: 'model' | 'layout') {
		if (!activeDrawingSource || presentation?.mode === next || loading) return;
		prepare(activeDrawingSource, activeAllowLargeFile, next);
	}

	function toggleLayer(layer: DxfLayer, event: Event) {
		const visible = (event.currentTarget as HTMLInputElement).checked;
		layerVisibility[layer.name] = visible;
		setDrawingLayerVisible(layer.name, visible);
	}

	onMount(() => {
		prepare();
		return () => {
			disposed = true;
			loadGeneration++;
			loadController?.abort();
			destroyViewer();
			clearEmbeddedPreview();
		};
	});
</script>

<div
	class={`relative min-h-80 overflow-hidden bg-[#111827] font-sans ${heightClass} ${className}`}
	aria-label={title}
>
	<input
		bind:this={fileInput}
		type="file"
		accept=".dwg,application/acad,application/x-acad,application/dwg,application/x-dwg,image/vnd.dwg,image/x-dwg"
		class="sr-only"
		onchange={chooseFile}
		aria-label="Choose a DWG file"
	/>
	<input
		bind:this={pdfInput}
		type="file"
		accept=".pdf,application/pdf"
		class="sr-only"
		onchange={choosePdf}
		aria-label="Choose an exported PDF"
	/>
	<canvas bind:this={canvas} class="block size-full"></canvas>

	{#if !loading && !errorMessage}
		<div
			class="absolute left-3 top-3 flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-slate-950/85 p-1.5 shadow-xl backdrop-blur"
		>
			<button
				type="button"
				onclick={() => togglePanel('views')}
				class={`rounded-lg px-3 py-2 text-xs font-semibold ${viewsOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
				>Views</button
			>
			{#if presentation?.layoutAvailable}
				<button
					type="button"
					onclick={() => switchPresentation('layout')}
					aria-pressed={presentation.mode === 'layout'}
					class={`rounded-lg px-3 py-2 text-xs font-semibold ${presentation.mode === 'layout' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
					>Sheet</button
				>
				<button
					type="button"
					onclick={() => switchPresentation('model')}
					aria-pressed={presentation.mode === 'model'}
					class={`rounded-lg px-3 py-2 text-xs font-semibold ${presentation.mode === 'model' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
					>Model</button
				>
			{/if}
			<button
				type="button"
				onclick={fitDrawing}
				class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
				>Fit</button
			>
			<button
				type="button"
				onclick={() => zoomDrawing(0.8)}
				aria-label="Zoom out"
				class="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
				>−</button
			>
			<button
				type="button"
				onclick={() => zoomDrawing(1.25)}
				aria-label="Zoom in"
				class="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
				>+</button
			>
			{#each ['pan', 'select', 'measure'] as mode (mode)}
				<button
					type="button"
					onclick={() => setTool(mode as Tool)}
					class={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${tool === mode ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
					>{mode}</button
				>
			{/each}
			<button
				type="button"
				onclick={() => togglePanel('layers')}
				class={`rounded-lg px-3 py-2 text-xs font-semibold ${layersOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
				>Layers</button
			>
			<button
				type="button"
				onclick={() => togglePanel('properties')}
				class={`rounded-lg px-3 py-2 text-xs font-semibold ${propertiesOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
				>Properties</button
			>
		</div>

		{#if viewsOpen}
			<aside
				class="absolute bottom-16 left-3 top-16 flex w-72 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/92 text-slate-200 shadow-2xl backdrop-blur"
			>
				<div class="border-b border-white/10 px-4 py-3">
					<p class="text-xs font-semibold">Views</p>
					<p class="mt-0.5 text-[11px] text-slate-400">Model and drawing sheets</p>
				</div>
				<div class="space-y-1 p-2">
					<button
						type="button"
						onclick={() => switchPresentation('model')}
						class={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${presentation?.mode === 'model' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
					>
						<span>2D Model</span><span class="text-[10px] opacity-70">Model</span>
					</button>
					{#if presentation?.layoutAvailable}
						<button
							type="button"
							onclick={() => switchPresentation('layout')}
							class={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${presentation?.mode === 'layout' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
						>
							<span>{presentation.layoutName || 'Paper layout'}</span>
							<span class="text-[10px] opacity-70">Sheet</span>
						</button>
					{/if}
				</div>
			</aside>
		{/if}

		{#if layersOpen}
			<aside
				class="absolute bottom-16 left-3 top-16 flex w-72 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/92 text-slate-200 shadow-2xl backdrop-blur"
			>
				<div class="border-b border-white/10 px-4 py-3">
					<p class="text-xs font-semibold">Drawing layers</p>
					<p class="mt-0.5 text-[11px] text-slate-400">{layers.length} layers</p>
				</div>
				<div class="min-h-0 flex-1 overflow-y-auto p-2">
					{#each layers as layer (layer.name)}
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/5"
						>
							<input
								type="checkbox"
								checked={layerVisibility[layer.name]}
								onchange={(event) => toggleLayer(layer, event)}
								class="size-3.5 accent-blue-500"
							/>
							<span class="min-w-0 truncate">{layer.name}</span>
						</label>
					{/each}
				</div>
			</aside>
		{/if}

		{#if propertiesOpen}
			<aside
				class="absolute bottom-16 left-3 top-16 flex w-80 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/92 text-slate-200 shadow-2xl backdrop-blur"
			>
				<div class="border-b border-white/10 px-4 py-3">
					<p class="text-xs font-semibold">Properties</p>
					<p class="mt-0.5 truncate text-[11px] text-slate-400">{selectedTitle}</p>
				</div>
				<div class="min-h-0 flex-1 overflow-y-auto p-3">
					{#if selectedProperties.length}
						<dl class="space-y-1.5">
							{#each selectedProperties as property (`${property.label}:${property.value}`)}
								<div
									class="grid grid-cols-[7rem_1fr] gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs"
								>
									<dt class="text-slate-400">{property.label}</dt>
									<dd class="min-w-0 break-words text-slate-100">{property.value}</dd>
								</div>
							{/each}
						</dl>
					{:else}
						<p class="text-xs leading-5 text-slate-400">
							Choose Select, then click a rendered entity or viewport to inspect it.
						</p>
					{/if}
				</div>
			</aside>
		{/if}

		<div
			class="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-slate-950/85 px-4 py-3 text-slate-200 shadow-xl backdrop-blur sm:right-auto sm:max-w-xl"
		>
			<p class="text-xs font-semibold">{selectedTitle}</p>
			<p class="mt-1 text-xs leading-5 text-slate-400">{selectedDetails}</p>
		</div>
	{/if}

	{#if !loading && !errorMessage && warningMessage && !warningDismissed}
		<div
			class="absolute right-3 top-3 max-h-36 max-w-sm overflow-y-auto rounded-xl border border-amber-300/30 bg-amber-950/90 px-4 py-3 pr-10 text-left text-amber-100 shadow-xl backdrop-blur"
			role="status"
		>
			<button
				type="button"
				onclick={() => (warningDismissed = true)}
				class="absolute right-2 top-2 grid size-6 place-items-center rounded-md text-amber-200/70 hover:bg-white/10 hover:text-white"
				aria-label="Dismiss DWG warning">×</button
			>
			<p class="text-xs font-semibold">DWG opened with a warning</p>
			<p class="mt-1 text-xs leading-5 text-amber-200/80">{warningMessage}</p>
		</div>
	{/if}

	{#if largeFilePrompt}
		<div class="absolute inset-0 grid place-content-center bg-slate-950/95 p-8 text-center">
			<div
				class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300"
			>
				<svg
					class="size-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"><path d="M12 8v5m0 3.5v.1M4.5 19.5h15L12 4z" /></svg
				>
			</div>
			<h3 class="mt-4 font-semibold text-white">Large DWG requires confirmation</h3>
			<p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
				{largeFileName} is {formatByteLength(largeFileSize)}. Browser-local decoding may use more
				than 1 GB of memory and can briefly make this tab unresponsive.
			</p>
			<p class="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500">
				Try it only on a well-equipped desktop. If the folder contains {suggestedPreviewName()},
				open that file in the main viewer for a much lighter preview.
			</p>
			<div class="mt-5 flex flex-wrap justify-center gap-2">
				{#if onrequestopen}
					<button
						type="button"
						onclick={openPdfPicker}
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
					>
						Choose {suggestedPreviewName()}
					</button>
				{/if}
				<button
					type="button"
					onclick={tryLargeFile}
					class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
				>
					Try locally
				</button>
				<button
					type="button"
					onclick={() => fileInput?.click()}
					class="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
				>
					Choose another file
				</button>
			</div>
			{#if replacementError}
				<p class="mt-3 text-xs font-medium text-rose-300" role="alert">{replacementError}</p>
			{/if}
		</div>
	{:else if loading}
		<div class="absolute inset-0 grid place-content-center bg-slate-950/95 text-center">
			<div
				class="mx-auto size-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
			></div>
			<p class="mt-3 text-sm font-medium text-slate-300">{status}</p>
			<p class="mt-1 text-xs text-slate-500">Your file stays on this device.</p>
		</div>
	{:else if errorMessage}
		<div class="absolute inset-0 overflow-y-auto bg-slate-950/95 p-5 text-center sm:p-8">
			<div class="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-5">
				<div
					class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400"
				>
					<svg
						class="size-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						aria-hidden="true"><path d="M12 8v5m0 3.5v.1M4.5 19.5h15L12 4z" /></svg
					>
				</div>
				<h3 class="mt-4 font-semibold text-white">Unable to open DWG</h3>
				<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
					{errorMessage}
				</p>
				{#if errorDetails}
					<p class="mx-auto mt-2 max-w-xl break-words text-xs leading-5 text-slate-500">
						{errorDetails}
					</p>
				{/if}
				{#if embeddedPreviewUrl}
					<figure
						class="mt-5 w-full overflow-hidden rounded-xl border border-white/10 bg-black/25 p-3 text-left shadow-2xl"
					>
						<figcaption class="mb-2 flex items-center justify-between gap-3 px-1">
							<span class="text-xs font-semibold text-slate-200">Embedded DWG preview</span>
							<span class="text-[10px] font-semibold uppercase tracking-wide text-amber-300"
								>Thumbnail only</span
							>
						</figcaption>
						<img
							src={embeddedPreviewUrl}
							alt={`Embedded preview of ${largeFileName}`}
							class="max-h-64 w-full rounded-lg bg-white/5 object-contain"
							onerror={clearEmbeddedPreview}
						/>
						<p class="mt-2 px-1 text-[11px] leading-5 text-slate-500">
							This static thumbnail comes from the DWG. Layers, selection, and measurements are not
							available in it.
						</p>
					</figure>
				{/if}
				<div class="mt-5 flex flex-wrap justify-center gap-2">
					{#if onrequestopen}
						<button
							type="button"
							onclick={openPdfPicker}
							class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
						>
							Choose {suggestedPreviewName()}
						</button>
					{/if}
					<button
						type="button"
						onclick={() => fileInput?.click()}
						class="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
					>
						Choose another DWG
					</button>
				</div>
				{#if onrequestopen}
					<p class="mt-3 text-xs leading-5 text-slate-500">
						Choose {suggestedPreviewName()} from the same folder. Browser security requires you to select
						the PDF explicitly.
					</p>
				{/if}
				{#if replacementError}
					<p class="mt-2 text-xs font-medium text-rose-300" role="alert">{replacementError}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

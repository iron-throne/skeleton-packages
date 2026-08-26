import * as acad from '@node-projects/acad-ts';
import { computeEntitiesBounds } from '@cadview/core';
import { describeError, validateDxf } from './dwg-validation.js';

const STANDARD_OUTPUT_CHARACTERS = 64 * 1024 * 1024;
const ABSOLUTE_OUTPUT_CHARACTERS = 128 * 1024 * 1024;
const MAX_MODEL_ENTITIES = 500_000;
const MAX_LAYOUT_VIEWPORTS = 64;
const MAX_LAYOUT_ENTITY_REFERENCES = 500_000;
const OUTPUT_SEGMENT_CHARACTERS = 256 * 1024;
const MAX_EMBEDDED_PREVIEW_BYTES = 8 * 1024 * 1024;
const EPSILON = 1e-9;
const RENDERABLE_ENTITY_NAMES = new Set([
	'LINE',
	'CIRCLE',
	'ARC',
	'LWPOLYLINE',
	'POLYLINE',
	'ELLIPSE',
	'SPLINE',
	'TEXT',
	'MTEXT',
	'INSERT',
	'DIMENSION',
	'HATCH',
	'POINT'
]);

// acad-ts currently looks up DXF metadata through constructor.name. Bundlers may rename
// those constructors while preserving public ESM export names, so restore the stable names
// inside this isolated worker until the upstream metadata lookup no longer depends on them.
for (const [exportName, value] of Object.entries(acad)) {
	if (typeof value === 'function' && value.name !== exportName) {
		Object.defineProperty(value, 'name', { value: exportName, configurable: true });
	}
}

const { DwgReader, DxfWriter } = acad;

/** @param {ArrayBuffer} buffer */
function extractEmbeddedPreview(buffer) {
	let reader;
	try {
		reader = new DwgReader(buffer);
		const preview = reader.readPreview();
		if (!preview) return undefined;
		const sourceBytes = preview.toBytes();
		if (!sourceBytes?.byteLength || sourceBytes.byteLength > MAX_EMBEDDED_PREVIEW_BYTES) {
			return undefined;
		}
		const bytes = Uint8Array.from(sourceBytes);
		const isPng =
			preview.code === acad.DwgPreview.PreviewType.Png &&
			bytes.length >= 8 &&
			bytes[0] === 0x89 &&
			bytes[1] === 0x50 &&
			bytes[2] === 0x4e &&
			bytes[3] === 0x47 &&
			bytes[4] === 0x0d &&
			bytes[5] === 0x0a &&
			bytes[6] === 0x1a &&
			bytes[7] === 0x0a;
		const isBmp =
			preview.code === acad.DwgPreview.PreviewType.Bmp &&
			bytes.length >= 2 &&
			bytes[0] === 0x42 &&
			bytes[1] === 0x4d;
		if (!isPng && !isBmp) return undefined;
		return {
			buffer: bytes.buffer,
			mimeType: isPng ? 'image/png' : 'image/bmp'
		};
	} catch {
		return undefined;
	} finally {
		try {
			reader?.dispose();
		} catch {
			// A failed thumbnail cleanup must not prevent the full DWG conversion attempt.
		}
	}
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

/** @param {unknown} entity */
function isRenderableEntity(entity) {
	return (
		entity !== null &&
		typeof entity === 'object' &&
		'objectName' in entity &&
		RENDERABLE_ENTITY_NAMES.has(String(entity.objectName))
	);
}

/** @param {unknown} entity */
function sourceHandle(entity) {
	if (entity === null || typeof entity !== 'object' || !('handle' in entity)) return '';
	const handle = entity.handle;
	return typeof handle === 'number' && handle > 0 ? handle.toString(16).toUpperCase() : '';
}

/** @param {import('@cadview/core').DxfEntity} entity */
function parsedHandle(entity) {
	return entity.handle?.toUpperCase() ?? '';
}

/**
 * @param {unknown} min
 * @param {unknown} max
 */
function finiteBounds(min, max) {
	if (min === null || typeof min !== 'object' || max === null || typeof max !== 'object') {
		return undefined;
	}
	if (!('x' in min) || !('y' in min) || !('x' in max) || !('y' in max)) return undefined;
	const minX = min.x;
	const minY = min.y;
	const maxX = max.x;
	const maxY = max.y;
	if (
		isFiniteNumber(minX) &&
		isFiniteNumber(minY) &&
		isFiniteNumber(maxX) &&
		isFiniteNumber(maxY) &&
		maxX - minX > EPSILON &&
		maxY - minY > EPSILON
	) {
		return { minX, minY, maxX, maxY };
	}
	return undefined;
}

/**
 * @param {import('@node-projects/acad-ts').Layout} layout
 * @param {import('@node-projects/acad-ts').CadDocument} document
 */
function layoutBounds(layout, document) {
	const savedBounds = finiteBounds(layout.minExtents, layout.maxExtents);
	if (savedBounds) return savedBounds;
	const activePaperSpace = document.paperSpace;
	if (
		layout === activePaperSpace?.layout ||
		(layout.associatedBlock && layout.associatedBlock === activePaperSpace)
	) {
		return finiteBounds(document.header?.paperSpaceExtMin, document.header?.paperSpaceExtMax);
	}
	return undefined;
}

/** @param {import('@node-projects/acad-ts').Layout | null | undefined} layout */
function isMeaningfulPaperLayout(layout) {
	if (!layout?.isPaperSpace || !layout.associatedBlock) {
		return false;
	}
	let supportedPaperEntities = 0;
	for (const entity of layout.associatedBlock.entities) {
		if (isRenderableEntity(entity)) supportedPaperEntities += 1;
	}
	return supportedPaperEntities > 0;
}

/**
 * @param {import('@node-projects/acad-ts').CadDocument} document
 * @returns {import('@node-projects/acad-ts').Layout | undefined}
 */
function preferredPaperLayout(document) {
	const active = document.paperSpace?.layout;
	if (active && isMeaningfulPaperLayout(active)) return active;
	return [...(document.layouts ?? [])]
		.filter((layout) => isMeaningfulPaperLayout(layout))
		.sort((a, b) => a.tabOrder - b.tabOrder)[0];
}

/**
 * @param {import('@node-projects/acad-ts').CadDocument} document
 * @param {{ characters: number }} outputBudget
 * @param {number} maxOutputCharacters
 */
function writeDxf(document, outputBudget, maxOutputCharacters) {
	let recoverableReadErrors = 0;
	/** @type {string[]} */
	const outputSegments = [];
	/** @type {string[]} */
	let pendingChunks = [];
	let pendingCharacters = 0;
	/** @type {{ write(value: string): void }} */
	const output = {
		write(value) {
			outputBudget.characters += value.length;
			if (outputBudget.characters > maxOutputCharacters) {
				throw new Error('The generated DXF exceeds the browser output safety limit.');
			}
			pendingChunks.push(value);
			pendingCharacters += value.length;
			if (pendingCharacters >= OUTPUT_SEGMENT_CHARACTERS) {
				outputSegments.push(pendingChunks.join(''));
				pendingChunks = [];
				pendingCharacters = 0;
			}
		}
	};
	const writer = new DxfWriter(output, document);
	// The canvas renderer needs HEADER/TABLES/BLOCKS/ENTITIES, not the DXF OBJECTS
	// dictionary. Some otherwise valid DWGs contain dangling non-graphical owners that
	// acad-ts cannot currently serialize. Skipping OBJECTS preserves supported entity and
	// block geometry, although images, underlays, and custom objects may be omitted.
	if (typeof Reflect.get(writer, '_writeObjects') !== 'function') {
		throw new Error('The pinned DWG writer no longer exposes the expected preview hook.');
	}
	Reflect.set(writer, '_writeObjects', () => {});
	let didWriteFail = false;
	let writeError;
	try {
		writer.write();
	} catch (cause) {
		didWriteFail = true;
		writeError = cause;
	}
	try {
		writer.dispose();
	} catch (cause) {
		if (!didWriteFail) throw cause;
	}
	if (didWriteFail) throw writeError;
	if (pendingChunks.length > 0) outputSegments.push(pendingChunks.join(''));
	return { dxf: outputSegments.join(''), writerIssueCount: recoverableReadErrors };
}

/**
 * @param {import('@node-projects/acad-ts').CadDocument} document
 * @param {unknown} collection
 * @param {{ characters: number }} outputBudget
 * @param {number} maxOutputCharacters
 */
function writeDxfWithHiddenCollection(document, collection, outputBudget, maxOutputCharacters) {
	if (!collection || typeof collection !== 'object') {
		return writeDxf(document, outputBudget, maxOutputCharacters);
	}
	const entries = Reflect.get(collection, '_entries');
	if (!(entries instanceof Set)) {
		throw new Error('The pinned DWG decoder no longer exposes the expected space collection.');
	}
	Reflect.set(collection, '_entries', new Set());
	try {
		return writeDxf(document, outputBudget, maxOutputCharacters);
	} finally {
		Reflect.set(collection, '_entries', entries);
	}
}

/** @param {Iterable<unknown>} entities */
function collectSourceHandles(entities) {
	const handles = new Set();
	let renderableCount = 0;
	let missingHandleCount = 0;
	let duplicateHandleCount = 0;
	for (const entity of entities) {
		if (!isRenderableEntity(entity)) continue;
		renderableCount += 1;
		const handle = sourceHandle(entity);
		if (!handle) {
			missingHandleCount += 1;
			continue;
		}
		if (handles.has(handle)) {
			duplicateHandleCount += 1;
			continue;
		}
		handles.add(handle);
	}
	return { handles, renderableCount, missingHandleCount, duplicateHandleCount };
}

/**
 * @param {import('@cadview/core').DxfDocument} combinedDocument
 * @param {Iterable<unknown>} modelSourceEntities
 * @param {Iterable<unknown>} paperSourceEntities
 */
function partitionCombinedDocument(combinedDocument, modelSourceEntities, paperSourceEntities) {
	const modelSource = collectSourceHandles(modelSourceEntities);
	const paperSource = collectSourceHandles(paperSourceEntities);
	let intersectingSourceHandleCount = 0;
	for (const handle of modelSource.handles) {
		if (paperSource.handles.has(handle)) intersectingSourceHandleCount += 1;
	}

	const modelEntities = [];
	const paperEntities = [];
	const seenParsedHandles = new Set();
	let missingParsedHandleCount = 0;
	let duplicateParsedHandleCount = 0;
	let unassignedParsedEntityCount = 0;
	let ambiguousParsedEntityCount = 0;
	for (const entity of combinedDocument.entities) {
		const handle = parsedHandle(entity);
		if (!handle) {
			missingParsedHandleCount += 1;
			continue;
		}
		if (seenParsedHandles.has(handle)) {
			duplicateParsedHandleCount += 1;
			continue;
		}
		seenParsedHandles.add(handle);
		const inModel = modelSource.handles.has(handle);
		const inPaper = paperSource.handles.has(handle);
		if (inModel && inPaper) {
			ambiguousParsedEntityCount += 1;
		} else if (inModel) {
			modelEntities.push(entity);
		} else if (inPaper) {
			paperEntities.push(entity);
		} else {
			unassignedParsedEntityCount += 1;
		}
	}

	return {
		modelEntities,
		paperEntities,
		modelSource,
		paperSource,
		missingParsedHandleCount,
		duplicateParsedHandleCount,
		unassignedParsedEntityCount,
		ambiguousParsedEntityCount,
		intersectingSourceHandleCount,
		ambiguous:
			modelSource.duplicateHandleCount > 0 ||
			paperSource.duplicateHandleCount > 0 ||
			intersectingSourceHandleCount > 0 ||
			duplicateParsedHandleCount > 0 ||
			ambiguousParsedEntityCount > 0
	};
}

/**
 * @param {import('@cadview/core').DxfDocument} combinedDocument
 * @param {import('@cadview/core').DxfEntity[]} entities
 * @param {string} decoder
 * @param {boolean} requireEntities
 */
function documentPartition(combinedDocument, entities, decoder, requireEntities) {
	if (requireEntities && entities.length === 0) {
		throw new Error(`${decoder} found no renderable model-space entities.`);
	}
	const partition = {
		...combinedDocument,
		header: { ...combinedDocument.header },
		entities
	};
	const bounds = computeEntitiesBounds(entities, partition);
	if (bounds && ![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)) {
		throw new Error(`${decoder} produced drawing geometry with invalid coordinates.`);
	}
	if (bounds) {
		partition.header.extMin = { x: bounds.minX, y: bounds.minY, z: 0 };
		partition.header.extMax = { x: bounds.maxX, y: bounds.maxY, z: 0 };
	}
	return partition;
}

/**
 * @param {import('@node-projects/acad-ts').Layout} layout
 * @param {import('@cadview/core').DxfDocument} modelDocument
 * @param {{ minX: number, minY: number, maxX: number, maxY: number }} bounds
 */
function buildLayoutPresentation(layout, modelDocument, bounds) {
	if (!layout.associatedBlock) {
		throw new Error('The saved paper layout has invalid drawing extents.');
	}
	const modelIndexByHandle = new Map(
		modelDocument.entities.flatMap((entity, index) => {
			const handle = parsedHandle(entity);
			return handle ? [[handle, index]] : [];
		})
	);
	const viewports = [];
	let referenceCount = 0;
	let skippedViewportCount = 0;
	let viewportOrdinal = 0;
	for (const viewport of layout.associatedBlock.viewports ?? []) {
		viewportOrdinal += 1;
		const status = viewport.status ?? 0;
		const incompatibleStatus =
			acad.ViewportStatusFlags.PerspectiveMode |
			acad.ViewportStatusFlags.FrontClipping |
			acad.ViewportStatusFlags.BackClipping |
			acad.ViewportStatusFlags.NonRectangularClipping |
			acad.ViewportStatusFlags.ViewportOff;
		const validGeometry =
			isFiniteNumber(viewport.width) &&
			viewport.width > 0 &&
			isFiniteNumber(viewport.height) &&
			viewport.height > 0 &&
			isFiniteNumber(viewport.viewHeight) &&
			viewport.viewHeight > 0 &&
			isFiniteNumber(viewport.scaleFactor) &&
			viewport.scaleFactor > 0 &&
			isFiniteNumber(viewport.center?.x) &&
			isFiniteNumber(viewport.center?.y) &&
			isFiniteNumber(viewport.viewCenter?.x) &&
			isFiniteNumber(viewport.viewCenter?.y);
		const topPlan =
			Math.abs(viewport.viewDirection?.x ?? 0) <= EPSILON &&
			Math.abs(viewport.viewDirection?.y ?? 0) <= EPSILON &&
			Math.abs((viewport.viewDirection?.z ?? 0) - 1) <= EPSILON;
		const rectangular = !viewport.boundary;
		const untwisted = Math.abs(viewport.twistAngle ?? 0) <= EPSILON;
		if (!validGeometry || !topPlan || !rectangular || !untwisted || status & incompatibleStatus) {
			skippedViewportCount += 1;
			continue;
		}
		const rawRectangle = {
			minX: viewport.center.x - viewport.width / 2,
			minY: viewport.center.y - viewport.height / 2,
			maxX: viewport.center.x + viewport.width / 2,
			maxY: viewport.center.y + viewport.height / 2
		};
		const sheetWidth = bounds.maxX - bounds.minX;
		const sheetHeight = bounds.maxY - bounds.minY;
		const coversSheet = viewport.width >= sheetWidth * 0.9 && viewport.height >= sheetHeight * 0.9;
		const usesPaperCamera =
			Math.abs(viewport.center.x - viewport.viewCenter.x) <= sheetWidth * 0.02 &&
			Math.abs(viewport.center.y - viewport.viewCenter.y) <= sheetHeight * 0.02;
		// acad-ts recomputes viewport ids and can mark a real floating viewport as the
		// Paper viewport. The actual sheet camera covers the sheet and uses paper coords.
		if (coversSheet && usesPaperCamera) continue;
		const clipRectangle = {
			minX: Math.max(rawRectangle.minX, bounds.minX),
			minY: Math.max(rawRectangle.minY, bounds.minY),
			maxX: Math.min(rawRectangle.maxX, bounds.maxX),
			maxY: Math.min(rawRectangle.maxY, bounds.maxY)
		};
		if (
			clipRectangle.maxX - clipRectangle.minX <= EPSILON ||
			clipRectangle.maxY - clipRectangle.minY <= EPSILON
		) {
			continue;
		}
		let selected;
		try {
			selected = viewport.selectEntities();
		} catch {
			skippedViewportCount += 1;
			continue;
		}
		const frozenLayers = new Set(
			(viewport.frozenLayers ?? []).map((layer) => layer.name.toLowerCase())
		);
		const entityIndices = [];
		const seenIndices = new Set();
		for (const entity of selected) {
			if (frozenLayers.has(entity.layer.name.toLowerCase())) continue;
			const handle = sourceHandle(entity);
			const index = handle ? modelIndexByHandle.get(handle) : undefined;
			if (index === undefined || seenIndices.has(index)) continue;
			seenIndices.add(index);
			entityIndices.push(index);
		}
		// The paper viewport contains no model entities. Ignoring empty viewports also avoids
		// relying on acad-ts's computed viewport id, which is wrong in some DWGs.
		if (entityIndices.length === 0) continue;
		if (viewports.length >= MAX_LAYOUT_VIEWPORTS) {
			throw new Error(
				`This layout contains more than ${MAX_LAYOUT_VIEWPORTS} renderable viewports.`
			);
		}
		referenceCount += entityIndices.length;
		if (referenceCount > MAX_LAYOUT_ENTITY_REFERENCES) {
			throw new Error(
				`This layout expands to more than ${MAX_LAYOUT_ENTITY_REFERENCES.toLocaleString('en-US')} browser drawing references.`
			);
		}
		viewports.push({
			id: sourceHandle(viewport) || `viewport-${viewportOrdinal}`,
			minX: clipRectangle.minX,
			minY: clipRectangle.minY,
			maxX: clipRectangle.maxX,
			maxY: clipRectangle.maxY,
			centerX: viewport.center.x,
			centerY: viewport.center.y,
			viewCenterX: viewport.viewCenter.x,
			viewCenterY: viewport.viewCenter.y,
			scaleFactor: viewport.scaleFactor,
			entityIndices
		});
	}
	return { bounds, viewports, referenceCount, skippedViewportCount };
}

/**
 * @param {ArrayBuffer} buffer
 * @param {number} maxOutputCharacters
 * @param {'auto' | 'model' | 'layout'} presentationRequest
 */
function convertWithTypescript(buffer, maxOutputCharacters, presentationRequest) {
	let recoverableReadErrors = 0;
	let aecObjectNotices = 0;
	let unsupportedObjectNotices = 0;
	const document = DwgReader.readFromStream(buffer, (_sender, notification) => {
		if (notification.notificationType === acad.NotificationType.Error) {
			recoverableReadErrors += 1;
		}
		if (/\bAECC?_/.test(notification.message)) aecObjectNotices += 1;
		if (notification.message.startsWith('Object type not implemented:')) {
			unsupportedObjectNotices += 1;
		}
	});
	const modelSpace = document.modelSpace;
	if (!modelSpace) throw new Error('The TypeScript DWG decoder found no model space.');
	const modelEntities = modelSpace.entities;
	if (modelEntities.count === 0) {
		if (aecObjectNotices > 0 || unsupportedObjectNotices > 0) {
			throw new Error(
				`This drawing contains no browser-renderable model-space entities. It relies on AutoCAD Architecture or Civil 3D AEC/custom objects (${aecObjectNotices} AEC and ${unsupportedObjectNotices} unsupported-object notices). Use its PDF/DXF export or flatten those objects to standard AutoCAD entities first.`
			);
		}
		throw new Error('The TypeScript DWG decoder found no renderable model-space entities.');
	}
	if (modelEntities.count > MAX_MODEL_ENTITIES) {
		throw new Error(
			`This drawing contains ${modelEntities.count.toLocaleString('en-US')} model-space entities, exceeding the browser rendering safety limit of ${MAX_MODEL_ENTITIES.toLocaleString('en-US')}.`
		);
	}

	const layout = preferredPaperLayout(document);
	const layoutAvailable = Boolean(layout);
	const useLayout =
		layoutAvailable &&
		(presentationRequest === 'layout' ||
			(presentationRequest === 'auto' && document.header?.showModelSpace === false));
	const baseWarnings = [];
	if (recoverableReadErrors > 0) {
		baseWarnings.push(
			`The decoder recovered from ${recoverableReadErrors} ${recoverableReadErrors === 1 ? 'issue' : 'issues'}; verify this preview before relying on it.`
		);
	}

	/**
	 * @param {import('@cadview/core').DxfDocument} modelDocument
	 * @param {string[]} warnings
	 * @param {boolean} [verifiedLayoutAvailable]
	 */
	function modelResult(modelDocument, warnings, verifiedLayoutAvailable = layoutAvailable) {
		const resultWarnings = [...warnings];
		if (modelEntities.count > modelDocument.entities.length) {
			const omitted = modelEntities.count - modelDocument.entities.length;
			resultWarnings.push(
				`${omitted} model-space ${omitted === 1 ? 'entity was' : 'entities were'} omitted during conversion.`
			);
		}
		return {
			document: modelDocument,
			entityCount: modelDocument.entities.length,
			decoder: 'typescript',
			warningCode: 0,
			warnings: resultWarnings,
			presentation: {
				mode: 'model',
				layoutAvailable: verifiedLayoutAvailable,
				layoutName: layout?.name
			}
		};
	}

	/**
	 * @param {string[]} warnings
	 * @param {boolean} [verifiedLayoutAvailable]
	 */
	function convertModelOnly(warnings, verifiedLayoutAvailable = layoutAvailable) {
		const output = writeDxfWithHiddenCollection(
			document,
			document.paperSpace?.entities,
			{ characters: 0 },
			maxOutputCharacters
		);
		const modelDocument = validateDxf(output.dxf, 'The TypeScript DWG decoder', true);
		output.dxf = '';
		return modelResult(modelDocument, warnings, verifiedLayoutAvailable);
	}

	if (!useLayout || !layout) {
		const warnings = [...baseWarnings];
		if (presentationRequest === 'layout' && !layoutAvailable) {
			warnings.push('This drawing does not contain a populated browser-renderable paper layout.');
		}
		return convertModelOnly(warnings);
	}

	const activePaperSpace = document.paperSpace;
	if (!activePaperSpace || layout.associatedBlock !== activePaperSpace) {
		const message = `Paper layout “${layout.name}” is not the active serializable paper space.`;
		if (presentationRequest === 'layout') throw new Error(message);
		return convertModelOnly([...baseWarnings, `${message} Showing Model space instead.`], false);
	}
	const bounds = layoutBounds(layout, document);
	if (!bounds) {
		const message = `Paper layout “${layout.name}” has invalid saved sheet bounds.`;
		if (presentationRequest === 'layout') throw new Error(message);
		return convertModelOnly([...baseWarnings, `${message} Showing Model space instead.`], false);
	}

	let combinedDocument;
	try {
		const combinedOutput = writeDxf(document, { characters: 0 }, maxOutputCharacters);
		combinedDocument = validateDxf(combinedOutput.dxf, 'The TypeScript DWG decoder', true);
		combinedOutput.dxf = '';
	} catch (cause) {
		if (presentationRequest === 'layout') throw cause;
		return convertModelOnly(
			[
				...baseWarnings,
				`Paper layout “${layout.name}” could not be serialized locally; showing Model space instead. ${describeError(cause)}`
			],
			false
		);
	}

	const partition = partitionCombinedDocument(
		combinedDocument,
		modelEntities,
		layout.associatedBlock.entities
	);
	if (partition.ambiguous) {
		const message = `Paper layout “${layout.name}” has ambiguous entity handles and cannot be separated safely.`;
		if (presentationRequest === 'layout') throw new Error(message);
		return convertModelOnly([...baseWarnings, `${message} Showing Model space instead.`], false);
	}

	let modelDocument;
	let paperDocument;
	let layoutPresentation;
	try {
		modelDocument = documentPartition(
			combinedDocument,
			partition.modelEntities,
			'The TypeScript DWG decoder',
			true
		);
		paperDocument = documentPartition(
			combinedDocument,
			partition.paperEntities,
			'The paper-space DWG decoder',
			false
		);
		layoutPresentation = buildLayoutPresentation(layout, modelDocument, bounds);
	} catch (cause) {
		if (presentationRequest === 'layout') throw cause;
		if (partition.modelEntities.length === 0) throw cause;
		const fallbackDocument = documentPartition(
			combinedDocument,
			partition.modelEntities,
			'The TypeScript DWG decoder',
			true
		);
		return modelResult(
			fallbackDocument,
			[
				...baseWarnings,
				`Paper layout “${layout.name}” could not be composed locally; showing Model space instead. ${describeError(cause)}`
			],
			false
		);
	}

	const warnings = [...baseWarnings];
	if (modelEntities.count > modelDocument.entities.length) {
		const omitted = modelEntities.count - modelDocument.entities.length;
		warnings.push(
			`${omitted} model-space ${omitted === 1 ? 'entity was' : 'entities were'} omitted during conversion.`
		);
	}
	const omittedRenderablePaperEntities = Math.max(
		0,
		partition.paperSource.renderableCount - paperDocument.entities.length
	);
	if (omittedRenderablePaperEntities > 0) {
		warnings.push(
			`${omittedRenderablePaperEntities} renderable paper-space ${omittedRenderablePaperEntities === 1 ? 'entity was' : 'entities were'} omitted during conversion.`
		);
	}
	const unassignedConvertedEntities =
		partition.missingParsedHandleCount + partition.unassignedParsedEntityCount;
	if (unassignedConvertedEntities > 0) {
		warnings.push(
			`${unassignedConvertedEntities} converted ${unassignedConvertedEntities === 1 ? 'entity could' : 'entities could'} not be assigned to Model or Paper space.`
		);
	}
	const missingSourceHandles =
		partition.modelSource.missingHandleCount + partition.paperSource.missingHandleCount;
	if (missingSourceHandles > 0) {
		warnings.push(
			`${missingSourceHandles} source ${missingSourceHandles === 1 ? 'entity had' : 'entities had'} no stable handle and could not be placed reliably.`
		);
	}

	paperDocument.header.extMin = {
		x: bounds.minX,
		y: bounds.minY,
		z: 0
	};
	paperDocument.header.extMax = {
		x: bounds.maxX,
		y: bounds.maxY,
		z: 0
	};
	const unsupportedPaperEntities = [...(layout.associatedBlock?.entities ?? [])].filter(
		(entity) => !(entity instanceof acad.Viewport) && !isRenderableEntity(entity)
	).length;
	if (unsupportedPaperEntities > 0) {
		warnings.push(
			`${unsupportedPaperEntities} unsupported paper-space ${unsupportedPaperEntities === 1 ? 'object was' : 'objects were'} omitted.`
		);
	}
	if (layoutPresentation.skippedViewportCount > 0) {
		warnings.push(
			`${layoutPresentation.skippedViewportCount} unsupported or invalid paper ${layoutPresentation.skippedViewportCount === 1 ? 'viewport was' : 'viewports were'} omitted.`
		);
	}
	warnings.push(
		`Showing paper layout “${layout.name}”. Use its exported PDF for plot-accurate fonts, OLE content, and advanced viewport effects.`
	);
	return {
		document: modelDocument,
		paperDocument,
		entityCount: paperDocument.entities.length + layoutPresentation.referenceCount,
		decoder: 'typescript',
		warningCode: 0,
		warnings,
		presentation: {
			mode: 'layout',
			layoutAvailable: true,
			layoutName: layout.name,
			bounds: layoutPresentation.bounds,
			viewports: layoutPresentation.viewports
		}
	};
}

self.onmessage = async (event) => {
	const message =
		/** @type {{ buffer?: Blob | ArrayBuffer, maxOutputCharacters?: number, presentation?: 'auto' | 'model' | 'layout' } | ArrayBuffer} */ (
			event.data
		);
	const source = message instanceof ArrayBuffer ? message : message.buffer;
	const requestedOutputLimit =
		message instanceof ArrayBuffer ? STANDARD_OUTPUT_CHARACTERS : message.maxOutputCharacters;
	const presentationRequest =
		message instanceof ArrayBuffer ? 'auto' : (message.presentation ?? 'auto');
	try {
		if (!(source instanceof Blob) && !(source instanceof ArrayBuffer)) {
			throw new Error('The DWG worker received no drawing data.');
		}
		const buffer = source instanceof Blob ? await source.arrayBuffer() : source;
		const preview = extractEmbeddedPreview(buffer);
		if (preview) {
			self.postMessage({ type: 'preview', preview }, { transfer: [preview.buffer] });
		}
		const maxOutputCharacters = Math.min(
			Math.max(requestedOutputLimit ?? STANDARD_OUTPUT_CHARACTERS, STANDARD_OUTPUT_CHARACTERS),
			ABSOLUTE_OUTPUT_CHARACTERS
		);
		const result = convertWithTypescript(buffer, maxOutputCharacters, presentationRequest);
		self.postMessage({ ok: true, result });
	} catch (cause) {
		self.postMessage({ ok: false, error: describeError(cause) });
	}
};

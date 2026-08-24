import * as acad from '@node-projects/acad-ts';
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

/** @param {unknown} value */
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

/** @param {import('@node-projects/acad-ts').Layout} layout */
function layoutBounds(layout) {
	const min = layout.minExtents;
	const max = layout.maxExtents;
	if (
		min &&
		max &&
		isFiniteNumber(min.x) &&
		isFiniteNumber(min.y) &&
		isFiniteNumber(max.x) &&
		isFiniteNumber(max.y) &&
		max.x > min.x &&
		max.y > min.y
	) {
		return { minX: min.x, minY: min.y, maxX: max.x, maxY: max.y };
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

/**
 * @param {import('@node-projects/acad-ts').Layout} layout
 * @param {import('@cadview/core').DxfDocument} modelDocument
 */
function buildLayoutPresentation(layout, modelDocument) {
	const bounds = layoutBounds(layout);
	if (!bounds || !layout.associatedBlock) {
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
			minX: viewport.center.x - viewport.width / 2,
			minY: viewport.center.y - viewport.height / 2,
			maxX: viewport.center.x + viewport.width / 2,
			maxY: viewport.center.y + viewport.height / 2,
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
	if (modelSpace.entities.count === 0) {
		if (aecObjectNotices > 0 || unsupportedObjectNotices > 0) {
			throw new Error(
				`This drawing contains no browser-renderable model-space entities. It relies on AutoCAD Architecture or Civil 3D AEC/custom objects (${aecObjectNotices} AEC and ${unsupportedObjectNotices} unsupported-object notices). Use its PDF/DXF export or flatten those objects to standard AutoCAD entities first.`
			);
		}
		throw new Error('The TypeScript DWG decoder found no renderable model-space entities.');
	}
	if (modelSpace.entities.count > MAX_MODEL_ENTITIES) {
		throw new Error(
			`This drawing contains ${modelSpace.entities.count.toLocaleString('en-US')} model-space entities, exceeding the browser rendering safety limit of ${MAX_MODEL_ENTITIES.toLocaleString('en-US')}.`
		);
	}

	const layout = preferredPaperLayout(document);
	const layoutAvailable = Boolean(layout);
	const useLayout =
		layoutAvailable &&
		(presentationRequest === 'layout' ||
			(presentationRequest === 'auto' && document.header?.showModelSpace === false));
	const outputBudget = { characters: 0 };
	const modelOutput = writeDxfWithHiddenCollection(
		document,
		document.paperSpace?.entities,
		outputBudget,
		maxOutputCharacters
	);
	const modelDocument = validateDxf(modelOutput.dxf, 'The TypeScript DWG decoder', true);
	const warnings = [];
	if (modelSpace.entities.count > modelDocument.entities.length) {
		const omitted = modelSpace.entities.count - modelDocument.entities.length;
		warnings.push(
			`${omitted} model-space ${omitted === 1 ? 'entity was' : 'entities were'} omitted during conversion.`
		);
	}
	if (recoverableReadErrors > 0) {
		warnings.push(
			`The decoder recovered from ${recoverableReadErrors} ${recoverableReadErrors === 1 ? 'issue' : 'issues'}; verify this preview before relying on it.`
		);
	}

	if (!useLayout || !layout) {
		if (presentationRequest === 'layout' && !layoutAvailable) {
			warnings.push('This drawing does not contain a populated browser-renderable paper layout.');
		}
		return {
			document: modelDocument,
			entityCount: modelDocument.entities.length,
			decoder: 'typescript',
			warningCode: 0,
			warnings,
			presentation: {
				mode: 'model',
				layoutAvailable,
				layoutName: layout?.name
			}
		};
	}

	const paperOutput = writeDxfWithHiddenCollection(
		document,
		document.modelSpace?.entities,
		outputBudget,
		maxOutputCharacters
	);
	const paperDocument = validateDxf(paperOutput.dxf, 'The paper-space DWG decoder', false);
	const layoutPresentation = buildLayoutPresentation(layout, modelDocument);
	paperDocument.header.extMin = {
		x: layoutPresentation.bounds.minX,
		y: layoutPresentation.bounds.minY,
		z: 0
	};
	paperDocument.header.extMax = {
		x: layoutPresentation.bounds.maxX,
		y: layoutPresentation.bounds.maxY,
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

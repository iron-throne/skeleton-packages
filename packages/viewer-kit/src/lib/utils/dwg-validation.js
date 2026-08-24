import { computeEntitiesBounds, parseDxf } from '@cadview/core';

/**
 * @param {unknown} cause
 * @returns {string}
 */
export function describeError(cause) {
	if (cause instanceof Error) {
		return cause.cause ? `${cause.message} ${describeError(cause.cause)}` : cause.message;
	}
	return String(cause);
}

/**
 * Rejects partial or malformed intermediate DXF before it reaches the canvas renderer.
 * @param {string} dxf
 * @param {string} decoder
 * @param {boolean} requireEntities
 */
export function validateDxf(dxf, decoder, requireEntities) {
	const normalized = dxf.replace(/\r/g, '').trimEnd();
	const hasEntitiesSection =
		/(?:^|\n)\s*0\s*\n\s*SECTION\s*\n\s*2\s*\n\s*ENTITIES\s*(?:\n|$)[\s\S]*?(?:^|\n)\s*0\s*\n\s*ENDSEC\s*(?:\n|$)/m.test(
			normalized
		);
	const hasEndOfFile = /(?:^|\n)\s*0\s*\n\s*EOF\s*$/.test(normalized);
	if (!hasEntitiesSection || !hasEndOfFile) {
		throw new Error(`${decoder} produced incomplete DXF output.`);
	}

	const document = parseDxf(dxf);
	if (requireEntities && document.entities.length === 0) {
		throw new Error(`${decoder} found no renderable model-space entities.`);
	}
	const bounds = computeEntitiesBounds(document.entities, document);
	if (bounds && ![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)) {
		throw new Error(`${decoder} produced drawing geometry with invalid coordinates.`);
	}
	// CadViewer otherwise falls back to entity-only bounds without document context, which
	// treats INSERTs as insertion points and can make an otherwise normal drawing microscopic.
	// Persist the already validated, block-aware bounds for a deterministic initial Fit.
	if (bounds) {
		document.header.extMin = { x: bounds.minX, y: bounds.minY, z: 0 };
		document.header.extMax = { x: bounds.maxX, y: bounds.maxY, z: 0 };
	}
	return document;
}

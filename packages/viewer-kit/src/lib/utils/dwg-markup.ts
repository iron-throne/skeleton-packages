export const DWG_REVIEW_SCHEMA = 'viewer-kit.dwg-review' as const;
export const DWG_REVIEW_VERSION = 1 as const;
export const DWG_REVIEW_STORAGE_PREFIX = 'viewer-kit:dwg-review:v1:';

export const DWG_REVIEW_LIMITS = Object.freeze({
	maxJsonCharacters: 4 * 1024 * 1024,
	maxPresentations: 128,
	maxMarkups: 5_000,
	maxPointsPerFreehand: 10_000,
	maxTotalPoints: 100_000,
	maxIdCharacters: 128,
	maxFileNameCharacters: 512,
	maxLabelCharacters: 256,
	maxLayoutNameCharacters: 512,
	maxAuthorCharacters: 256,
	maxTextCharacters: 8_192,
	maxCommentCharacters: 32_768,
	maxAbsoluteWorldCoordinate: 1_000_000_000_000,
	minStrokeWidth: 0.5,
	maxStrokeWidth: 32,
	minFontSize: 8,
	maxFontSize: 96
});

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const DRAWING_ID_PATTERN = /^dwg-v1-[0-9a-f]{16}$/;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/;

export interface DwgWorldPoint {
	x: number;
	y: number;
	z?: number;
}

interface DwgReviewPresentationBase {
	id: string;
	label?: string;
}

export interface DwgModelReviewPresentation extends DwgReviewPresentationBase {
	mode: 'model';
	layoutName?: never;
}

export interface DwgLayoutReviewPresentation extends DwgReviewPresentationBase {
	mode: 'layout';
	layoutName: string;
}

export type DwgReviewPresentation = DwgModelReviewPresentation | DwgLayoutReviewPresentation;

export interface DwgMarkupStyle {
	/** CSS hexadecimal color in #RRGGBB or #RRGGBBAA form. */
	color: string;
	/** Zoom-independent stroke width in CSS pixels. */
	strokeWidth: number;
	opacity?: number;
	fillColor?: string;
	/** Zoom-independent text size in CSS pixels. */
	fontSize?: number;
}

interface DwgMarkupBase<TType extends DwgMarkupType> {
	id: string;
	type: TType;
	presentationId: string;
	createdAt: string;
	updatedAt: string;
	style: DwgMarkupStyle;
	author?: string;
}

export interface DwgFreehandMarkup extends DwgMarkupBase<'freehand'> {
	points: DwgWorldPoint[];
}

export interface DwgArrowMarkup extends DwgMarkupBase<'arrow'> {
	start: DwgWorldPoint;
	end: DwgWorldPoint;
}

export interface DwgRectangleMarkup extends DwgMarkupBase<'rectangle'> {
	start: DwgWorldPoint;
	end: DwgWorldPoint;
}

export interface DwgTextMarkup extends DwgMarkupBase<'text'> {
	position: DwgWorldPoint;
	text: string;
}

export interface DwgCommentMarkup extends DwgMarkupBase<'comment'> {
	position: DwgWorldPoint;
	comment: string;
	resolved?: boolean;
}

export type DwgMarkupType = 'freehand' | 'arrow' | 'rectangle' | 'text' | 'comment';

export type DwgMarkup =
	DwgFreehandMarkup | DwgArrowMarkup | DwgRectangleMarkup | DwgTextMarkup | DwgCommentMarkup;

export interface DwgDrawingIdentityInput {
	name?: string;
	fileName?: string;
	size?: number;
	lastModified?: number;
}

export interface DwgDrawingIdentity {
	id: string;
	fileName: string;
	size?: number;
	lastModified?: number;
}

export interface DwgReviewDocumentV1 {
	schema: typeof DWG_REVIEW_SCHEMA;
	version: typeof DWG_REVIEW_VERSION;
	drawing: DwgDrawingIdentity;
	createdAt: string;
	updatedAt: string;
	presentations: DwgReviewPresentation[];
	markups: DwgMarkup[];
}

export type DwgReviewErrorCode =
	| 'invalid-json'
	| 'too-large'
	| 'invalid-schema'
	| 'unsupported-version'
	| 'invalid-data'
	| 'limit-exceeded'
	| 'storage-unavailable'
	| 'storage-failed';

export interface DwgReviewError {
	code: DwgReviewErrorCode;
	message: string;
	path?: string;
}

export type DwgReviewResult<T> = { ok: true; value: T } | { ok: false; error: DwgReviewError };

export interface DwgReviewStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

class ValidationFailure extends Error {
	readonly code: DwgReviewErrorCode;
	readonly path?: string;

	constructor(code: DwgReviewErrorCode, message: string, path?: string) {
		super(message);
		this.name = 'ValidationFailure';
		this.code = code;
		this.path = path;
	}
}

function success<T>(value: T): DwgReviewResult<T> {
	return { ok: true, value };
}

function failure<T>(code: DwgReviewErrorCode, message: string, path?: string): DwgReviewResult<T> {
	return { ok: false, error: { code, message, ...(path ? { path } : {}) } };
}

function validationFailure(code: DwgReviewErrorCode, message: string, path?: string): never {
	throw new ValidationFailure(code, message, path);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function record(value: unknown, path: string): Record<string, unknown> {
	if (!isRecord(value)) validationFailure('invalid-data', 'Expected an object.', path);
	return value;
}

function allowedKeys(value: Record<string, unknown>, keys: readonly string[], path: string) {
	const allowed = new Set(keys);
	for (const key of Object.keys(value)) {
		if (!allowed.has(key)) {
			validationFailure('invalid-data', `Unexpected property “${key}”.`, `${path}.${key}`);
		}
	}
}

function requiredString(
	value: unknown,
	path: string,
	maxCharacters: number,
	options: { allowEmpty?: boolean; id?: boolean } = {}
) {
	if (typeof value !== 'string') validationFailure('invalid-data', 'Expected a string.', path);
	if (!options.allowEmpty && value.trim().length === 0) {
		validationFailure('invalid-data', 'The value cannot be empty.', path);
	}
	if (value.length > maxCharacters) {
		validationFailure(
			'limit-exceeded',
			`The value exceeds ${maxCharacters.toLocaleString('en-US')} characters.`,
			path
		);
	}
	if (options.id && !ID_PATTERN.test(value)) {
		validationFailure('invalid-data', 'Expected a safe identifier.', path);
	}
	return value;
}

function optionalString(value: unknown, path: string, maxCharacters: number) {
	return value === undefined ? undefined : requiredString(value, path, maxCharacters);
}

function finiteNumber(
	value: unknown,
	path: string,
	options: { min?: number; max?: number; integer?: boolean } = {}
) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		validationFailure('invalid-data', 'Expected a finite number.', path);
	}
	if (options.integer && !Number.isInteger(value)) {
		validationFailure('invalid-data', 'Expected an integer.', path);
	}
	if (options.min !== undefined && value < options.min) {
		validationFailure('invalid-data', `Expected a value of at least ${options.min}.`, path);
	}
	if (options.max !== undefined && value > options.max) {
		validationFailure('invalid-data', `Expected a value no greater than ${options.max}.`, path);
	}
	return value;
}

function optionalNonNegativeInteger(value: unknown, path: string) {
	return value === undefined
		? undefined
		: finiteNumber(value, path, { min: 0, max: Number.MAX_SAFE_INTEGER, integer: true });
}

function timestamp(value: unknown, path: string) {
	const parsed = requiredString(value, path, 64);
	if (!Number.isFinite(Date.parse(parsed))) {
		validationFailure('invalid-data', 'Expected a valid date-time string.', path);
	}
	return parsed;
}

function color(value: unknown, path: string) {
	const parsed = requiredString(value, path, 9);
	if (!HEX_COLOR_PATTERN.test(parsed)) {
		validationFailure('invalid-data', 'Expected #RRGGBB or #RRGGBBAA.', path);
	}
	return parsed;
}

function point(value: unknown, path: string): DwgWorldPoint {
	const parsed = record(value, path);
	allowedKeys(parsed, ['x', 'y', 'z'], path);
	const coordinateOptions = {
		min: -DWG_REVIEW_LIMITS.maxAbsoluteWorldCoordinate,
		max: DWG_REVIEW_LIMITS.maxAbsoluteWorldCoordinate
	};
	return {
		x: finiteNumber(parsed.x, `${path}.x`, coordinateOptions),
		y: finiteNumber(parsed.y, `${path}.y`, coordinateOptions),
		...(parsed.z === undefined ? {} : { z: finiteNumber(parsed.z, `${path}.z`, coordinateOptions) })
	};
}

function markupStyle(value: unknown, path: string): DwgMarkupStyle {
	const parsed = record(value, path);
	allowedKeys(parsed, ['color', 'strokeWidth', 'opacity', 'fillColor', 'fontSize'], path);
	return {
		color: color(parsed.color, `${path}.color`),
		strokeWidth: finiteNumber(parsed.strokeWidth, `${path}.strokeWidth`, {
			min: DWG_REVIEW_LIMITS.minStrokeWidth,
			max: DWG_REVIEW_LIMITS.maxStrokeWidth
		}),
		...(parsed.opacity === undefined
			? {}
			: { opacity: finiteNumber(parsed.opacity, `${path}.opacity`, { min: 0, max: 1 }) }),
		...(parsed.fillColor === undefined
			? {}
			: { fillColor: color(parsed.fillColor, `${path}.fillColor`) }),
		...(parsed.fontSize === undefined
			? {}
			: {
					fontSize: finiteNumber(parsed.fontSize, `${path}.fontSize`, {
						min: DWG_REVIEW_LIMITS.minFontSize,
						max: DWG_REVIEW_LIMITS.maxFontSize
					})
				})
	};
}

function drawingIdentity(value: unknown, path: string): DwgDrawingIdentity {
	const parsed = record(value, path);
	allowedKeys(parsed, ['id', 'fileName', 'size', 'lastModified'], path);
	const identity: DwgDrawingIdentity = {
		id: requiredString(parsed.id, `${path}.id`, 32),
		fileName: requiredString(
			parsed.fileName,
			`${path}.fileName`,
			DWG_REVIEW_LIMITS.maxFileNameCharacters
		),
		...(parsed.size === undefined
			? {}
			: { size: optionalNonNegativeInteger(parsed.size, `${path}.size`) }),
		...(parsed.lastModified === undefined
			? {}
			: {
					lastModified: optionalNonNegativeInteger(parsed.lastModified, `${path}.lastModified`)
				})
	};
	if (!DRAWING_ID_PATTERN.test(identity.id)) {
		validationFailure('invalid-data', 'Expected a version 1 drawing identity.', `${path}.id`);
	}
	const expected = createDwgDrawingIdentity(identity);
	if (expected.id !== identity.id) {
		validationFailure(
			'invalid-data',
			'The drawing identity does not match its file metadata.',
			`${path}.id`
		);
	}
	return identity;
}

function presentation(value: unknown, path: string): DwgReviewPresentation {
	const parsed = record(value, path);
	allowedKeys(parsed, ['id', 'mode', 'layoutName', 'label'], path);
	const id = requiredString(parsed.id, `${path}.id`, DWG_REVIEW_LIMITS.maxIdCharacters, {
		id: true
	});
	const label = optionalString(parsed.label, `${path}.label`, DWG_REVIEW_LIMITS.maxLabelCharacters);
	if (parsed.mode === 'model') {
		if (parsed.layoutName !== undefined) {
			validationFailure(
				'invalid-data',
				'Model presentations cannot have a layout name.',
				`${path}.layoutName`
			);
		}
		return { id, mode: 'model', ...(label === undefined ? {} : { label }) };
	}
	if (parsed.mode === 'layout') {
		return {
			id,
			mode: 'layout',
			layoutName: requiredString(
				parsed.layoutName,
				`${path}.layoutName`,
				DWG_REVIEW_LIMITS.maxLayoutNameCharacters
			),
			...(label === undefined ? {} : { label })
		};
	}
	validationFailure(
		'invalid-data',
		'Expected presentation mode “model” or “layout”.',
		`${path}.mode`
	);
}

const MARKUP_BASE_KEYS = [
	'id',
	'type',
	'presentationId',
	'createdAt',
	'updatedAt',
	'style',
	'author'
] as const;

function markupBase<TType extends DwgMarkupType>(
	parsed: Record<string, unknown>,
	path: string,
	type: TType
): DwgMarkupBase<TType> {
	const createdAt = timestamp(parsed.createdAt, `${path}.createdAt`);
	const updatedAt = timestamp(parsed.updatedAt, `${path}.updatedAt`);
	if (Date.parse(updatedAt) < Date.parse(createdAt)) {
		validationFailure('invalid-data', 'updatedAt cannot precede createdAt.', `${path}.updatedAt`);
	}
	return {
		id: requiredString(parsed.id, `${path}.id`, DWG_REVIEW_LIMITS.maxIdCharacters, {
			id: true
		}),
		type,
		presentationId: requiredString(
			parsed.presentationId,
			`${path}.presentationId`,
			DWG_REVIEW_LIMITS.maxIdCharacters,
			{ id: true }
		),
		createdAt,
		updatedAt,
		style: markupStyle(parsed.style, `${path}.style`),
		...(parsed.author === undefined
			? {}
			: {
					author: optionalString(
						parsed.author,
						`${path}.author`,
						DWG_REVIEW_LIMITS.maxAuthorCharacters
					)
				})
	};
}

function markup(value: unknown, path: string): { value: DwgMarkup; pointCount: number } {
	const parsed = record(value, path);
	if (parsed.type === 'freehand') {
		allowedKeys(parsed, [...MARKUP_BASE_KEYS, 'points'], path);
		if (!Array.isArray(parsed.points)) {
			validationFailure('invalid-data', 'Expected an array of points.', `${path}.points`);
		}
		if (parsed.points.length < 2) {
			validationFailure(
				'invalid-data',
				'A freehand markup needs at least two points.',
				`${path}.points`
			);
		}
		if (parsed.points.length > DWG_REVIEW_LIMITS.maxPointsPerFreehand) {
			validationFailure(
				'limit-exceeded',
				`A freehand markup cannot exceed ${DWG_REVIEW_LIMITS.maxPointsPerFreehand.toLocaleString('en-US')} points.`,
				`${path}.points`
			);
		}
		const points = parsed.points.map((entry, index) => point(entry, `${path}.points[${index}]`));
		return {
			value: { ...markupBase(parsed, path, 'freehand'), points },
			pointCount: points.length
		};
	}
	if (parsed.type === 'arrow' || parsed.type === 'rectangle') {
		allowedKeys(parsed, [...MARKUP_BASE_KEYS, 'start', 'end'], path);
		const start = point(parsed.start, `${path}.start`);
		const end = point(parsed.end, `${path}.end`);
		if (start.x === end.x && start.y === end.y && (start.z ?? 0) === (end.z ?? 0)) {
			validationFailure('invalid-data', 'The markup endpoints must be different.', `${path}.end`);
		}
		return {
			value: { ...markupBase(parsed, path, parsed.type), start, end },
			pointCount: 2
		};
	}
	if (parsed.type === 'text') {
		allowedKeys(parsed, [...MARKUP_BASE_KEYS, 'position', 'text'], path);
		return {
			value: {
				...markupBase(parsed, path, 'text'),
				position: point(parsed.position, `${path}.position`),
				text: requiredString(parsed.text, `${path}.text`, DWG_REVIEW_LIMITS.maxTextCharacters)
			},
			pointCount: 1
		};
	}
	if (parsed.type === 'comment') {
		allowedKeys(parsed, [...MARKUP_BASE_KEYS, 'position', 'comment', 'resolved'], path);
		if (parsed.resolved !== undefined && typeof parsed.resolved !== 'boolean') {
			validationFailure('invalid-data', 'Expected a boolean.', `${path}.resolved`);
		}
		return {
			value: {
				...markupBase(parsed, path, 'comment'),
				position: point(parsed.position, `${path}.position`),
				comment: requiredString(
					parsed.comment,
					`${path}.comment`,
					DWG_REVIEW_LIMITS.maxCommentCharacters
				),
				...(parsed.resolved === undefined ? {} : { resolved: parsed.resolved })
			},
			pointCount: 1
		};
	}
	validationFailure(
		'invalid-data',
		'Expected markup type “freehand”, “arrow”, “rectangle”, “text”, or “comment”.',
		`${path}.type`
	);
}

function validateDocument(value: unknown): DwgReviewDocumentV1 {
	const parsed = record(value, '$');
	allowedKeys(
		parsed,
		['schema', 'version', 'drawing', 'createdAt', 'updatedAt', 'presentations', 'markups'],
		'$'
	);
	if (parsed.schema !== DWG_REVIEW_SCHEMA) {
		validationFailure('invalid-schema', `Expected schema “${DWG_REVIEW_SCHEMA}”.`, '$.schema');
	}
	if (parsed.version !== DWG_REVIEW_VERSION) {
		validationFailure(
			'unsupported-version',
			`Only review document version ${DWG_REVIEW_VERSION} is supported.`,
			'$.version'
		);
	}
	const createdAt = timestamp(parsed.createdAt, '$.createdAt');
	const updatedAt = timestamp(parsed.updatedAt, '$.updatedAt');
	if (Date.parse(updatedAt) < Date.parse(createdAt)) {
		validationFailure('invalid-data', 'updatedAt cannot precede createdAt.', '$.updatedAt');
	}
	if (!Array.isArray(parsed.presentations)) {
		validationFailure('invalid-data', 'Expected an array.', '$.presentations');
	}
	if (parsed.presentations.length === 0) {
		validationFailure('invalid-data', 'At least one presentation is required.', '$.presentations');
	}
	if (parsed.presentations.length > DWG_REVIEW_LIMITS.maxPresentations) {
		validationFailure(
			'limit-exceeded',
			`The document cannot exceed ${DWG_REVIEW_LIMITS.maxPresentations} presentations.`,
			'$.presentations'
		);
	}
	const presentations = parsed.presentations.map((entry, index) =>
		presentation(entry, `$.presentations[${index}]`)
	);
	const presentationIds = new Set<string>();
	for (const entry of presentations) {
		if (presentationIds.has(entry.id)) {
			validationFailure(
				'invalid-data',
				`Duplicate presentation id “${entry.id}”.`,
				'$.presentations'
			);
		}
		presentationIds.add(entry.id);
	}
	if (!Array.isArray(parsed.markups)) {
		validationFailure('invalid-data', 'Expected an array.', '$.markups');
	}
	if (parsed.markups.length > DWG_REVIEW_LIMITS.maxMarkups) {
		validationFailure(
			'limit-exceeded',
			`The document cannot exceed ${DWG_REVIEW_LIMITS.maxMarkups.toLocaleString('en-US')} markups.`,
			'$.markups'
		);
	}
	const markups: DwgMarkup[] = [];
	const markupIds = new Set<string>();
	let totalPoints = 0;
	for (let index = 0; index < parsed.markups.length; index += 1) {
		const parsedMarkup = markup(parsed.markups[index], `$.markups[${index}]`);
		if (markupIds.has(parsedMarkup.value.id)) {
			validationFailure(
				'invalid-data',
				`Duplicate markup id “${parsedMarkup.value.id}”.`,
				`$.markups[${index}].id`
			);
		}
		if (!presentationIds.has(parsedMarkup.value.presentationId)) {
			validationFailure(
				'invalid-data',
				`Unknown presentation id “${parsedMarkup.value.presentationId}”.`,
				`$.markups[${index}].presentationId`
			);
		}
		markupIds.add(parsedMarkup.value.id);
		totalPoints += parsedMarkup.pointCount;
		if (totalPoints > DWG_REVIEW_LIMITS.maxTotalPoints) {
			validationFailure(
				'limit-exceeded',
				`The document cannot exceed ${DWG_REVIEW_LIMITS.maxTotalPoints.toLocaleString('en-US')} markup points.`,
				'$.markups'
			);
		}
		markups.push(parsedMarkup.value);
	}

	return {
		schema: DWG_REVIEW_SCHEMA,
		version: DWG_REVIEW_VERSION,
		drawing: drawingIdentity(parsed.drawing, '$.drawing'),
		createdAt,
		updatedAt,
		presentations,
		markups
	};
}

/** Validate an already parsed value and return a normalized schema-v1 document. */
export function validateDwgReviewDocument(value: unknown): DwgReviewResult<DwgReviewDocumentV1> {
	try {
		return success(validateDocument(value));
	} catch (cause) {
		if (cause instanceof ValidationFailure) {
			return failure(cause.code, cause.message, cause.path);
		}
		return failure('invalid-data', 'The review document could not be validated.');
	}
}

/** Parse untrusted JSON after enforcing the serialized-size and schema limits. */
export function parseDwgReviewDocumentJson(json: string): DwgReviewResult<DwgReviewDocumentV1> {
	if (typeof json !== 'string') return failure('invalid-json', 'Expected a JSON string.');
	if (json.length > DWG_REVIEW_LIMITS.maxJsonCharacters) {
		return failure(
			'too-large',
			`The review JSON exceeds ${DWG_REVIEW_LIMITS.maxJsonCharacters.toLocaleString('en-US')} characters.`
		);
	}
	let value: unknown;
	try {
		value = JSON.parse(json);
	} catch {
		return failure('invalid-json', 'The review file is not valid JSON.');
	}
	return validateDwgReviewDocument(value);
}

function normalizedOptionalInteger(value: unknown) {
	return typeof value === 'number' &&
		Number.isSafeInteger(value) &&
		value >= 0 &&
		value <= Number.MAX_SAFE_INTEGER
		? value
		: undefined;
}

function sourceFileName(source: string | DwgDrawingIdentityInput) {
	const raw =
		typeof source === 'string' ? source : (source.name ?? source.fileName ?? 'drawing.dwg');
	const withoutQuery = raw.split(/[?#]/, 1)[0] ?? raw;
	const baseName = withoutQuery.replaceAll('\\', '/').split('/').pop() ?? '';
	let decoded = baseName;
	try {
		decoded = decodeURIComponent(baseName);
	} catch {
		// Keep the original name when a URL contains malformed percent escapes.
	}
	const cleaned = stripControlCharacters(decoded.normalize('NFC')).trim();
	return (cleaned || 'drawing.dwg').slice(0, DWG_REVIEW_LIMITS.maxFileNameCharacters);
}

function stripControlCharacters(value: string) {
	return Array.from(value, (character) => {
		const code = character.codePointAt(0) ?? 0;
		return code < 32 || code === 127 ? '' : character;
	}).join('');
}

function fnv1a64(value: string) {
	let hash = 0xcbf29ce484222325n;
	const bytes = new TextEncoder().encode(value);
	for (const byte of bytes) {
		hash ^= BigInt(byte);
		hash = BigInt.asUintN(64, hash * 0x100000001b3n);
	}
	return hash.toString(16).padStart(16, '0');
}

/** Build a repeatable, non-cryptographic identity without reading the drawing contents. */
export function createDwgDrawingIdentity(
	source: string | DwgDrawingIdentityInput
): DwgDrawingIdentity {
	const fileName = sourceFileName(source);
	const size = typeof source === 'string' ? undefined : normalizedOptionalInteger(source.size);
	const lastModified =
		typeof source === 'string' ? undefined : normalizedOptionalInteger(source.lastModified);
	const fingerprint = `${fileName.toLocaleLowerCase('en-US')}\u0000${size ?? ''}\u0000${lastModified ?? ''}`;
	return {
		id: `dwg-v1-${fnv1a64(fingerprint)}`,
		fileName,
		...(size === undefined ? {} : { size }),
		...(lastModified === undefined ? {} : { lastModified })
	};
}

function isDrawingIdentity(value: unknown): value is DwgDrawingIdentity {
	return isRecord(value) && typeof value.id === 'string' && typeof value.fileName === 'string';
}

/** Create an empty review document with a Model presentation by default. */
export function createDwgReviewDocument(
	drawing: DwgDrawingIdentity | DwgDrawingIdentityInput | string,
	presentations: DwgReviewPresentation[] = [{ id: 'model', mode: 'model', label: 'Model' }],
	now = new Date()
): DwgReviewDocumentV1 {
	if (!Number.isFinite(now.getTime())) throw new TypeError('Expected a valid creation date.');
	const identity = isDrawingIdentity(drawing) ? drawing : createDwgDrawingIdentity(drawing);
	const createdAt = now.toISOString();
	const candidate: DwgReviewDocumentV1 = {
		schema: DWG_REVIEW_SCHEMA,
		version: DWG_REVIEW_VERSION,
		drawing: { ...identity },
		createdAt,
		updatedAt: createdAt,
		presentations: presentations.map((entry) => ({ ...entry })),
		markups: []
	};
	const validated = validateDwgReviewDocument(candidate);
	if (!validated.ok) {
		throw new TypeError(
			`${validated.error.message}${validated.error.path ? ` (${validated.error.path})` : ''}`
		);
	}
	return validated.value;
}

function storageOrError(storage?: DwgReviewStorage): DwgReviewResult<DwgReviewStorage> {
	if (storage) return success(storage);
	try {
		if (typeof window === 'undefined' || !window.localStorage) {
			return failure('storage-unavailable', 'Browser local storage is unavailable.');
		}
		return success(window.localStorage);
	} catch {
		return failure('storage-unavailable', 'Browser local storage is unavailable.');
	}
}

function identityId(identity: DwgDrawingIdentity | string) {
	const id = typeof identity === 'string' ? identity : identity.id;
	if (!DRAWING_ID_PATTERN.test(id)) throw new TypeError('Expected a version 1 drawing identity.');
	return id;
}

export function dwgReviewStorageKey(identity: DwgDrawingIdentity | string) {
	return `${DWG_REVIEW_STORAGE_PREFIX}${identityId(identity)}`;
}

export function loadDwgReviewDocument(
	identity: DwgDrawingIdentity | string,
	storage?: DwgReviewStorage
): DwgReviewResult<DwgReviewDocumentV1 | null> {
	let key: string;
	try {
		key = dwgReviewStorageKey(identity);
	} catch {
		return failure('invalid-data', 'Expected a version 1 drawing identity.');
	}
	const target = storageOrError(storage);
	if (!target.ok) return target;
	let json: string | null;
	try {
		json = target.value.getItem(key);
	} catch {
		return failure('storage-failed', 'The review document could not be read from local storage.');
	}
	if (json === null) return success(null);
	const parsed = parseDwgReviewDocumentJson(json);
	if (!parsed.ok) return parsed;
	const expectedId = typeof identity === 'string' ? identity : identity.id;
	if (parsed.value.drawing.id !== expectedId) {
		return failure(
			'invalid-data',
			'The stored review belongs to a different drawing.',
			'$.drawing.id'
		);
	}
	return success(parsed.value);
}

export function saveDwgReviewDocument(
	document: DwgReviewDocumentV1,
	storage?: DwgReviewStorage
): DwgReviewResult<void> {
	const validated = validateDwgReviewDocument(document);
	if (!validated.ok) return validated;
	let json: string;
	try {
		json = JSON.stringify(validated.value);
	} catch {
		return failure('invalid-data', 'The review document could not be serialized.');
	}
	if (json.length > DWG_REVIEW_LIMITS.maxJsonCharacters) {
		return failure(
			'too-large',
			`The review JSON exceeds ${DWG_REVIEW_LIMITS.maxJsonCharacters.toLocaleString('en-US')} characters.`
		);
	}
	const target = storageOrError(storage);
	if (!target.ok) return target;
	try {
		target.value.setItem(dwgReviewStorageKey(validated.value.drawing), json);
	} catch {
		return failure('storage-failed', 'The review document could not be saved to local storage.');
	}
	return success(undefined);
}

export function removeDwgReviewDocument(
	identity: DwgDrawingIdentity | string,
	storage?: DwgReviewStorage
): DwgReviewResult<void> {
	let key: string;
	try {
		key = dwgReviewStorageKey(identity);
	} catch {
		return failure('invalid-data', 'Expected a version 1 drawing identity.');
	}
	const target = storageOrError(storage);
	if (!target.ok) return target;
	try {
		target.value.removeItem(key);
	} catch {
		return failure(
			'storage-failed',
			'The review document could not be removed from local storage.'
		);
	}
	return success(undefined);
}

/** Return a filesystem-safe `<drawing>.dwg-review.json` download name. */
export function dwgReviewExportFileName(source: DwgReviewDocumentV1 | DwgDrawingIdentity | string) {
	const fileName =
		typeof source === 'string'
			? sourceFileName(source)
			: 'schema' in source
				? source.drawing.fileName
				: source.fileName;
	const stem = stripControlCharacters(fileName)
		.replace(/\.dwg-review\.json$/i, '')
		.replace(/\.dwg$/i, '')
		.replace(/[<>:"/\\|?*]/g, '_')
		.replace(/\s+/g, ' ')
		.replace(/[. ]+$/g, '')
		.trim()
		.slice(0, 160);
	return `${stem || 'drawing'}.dwg-review.json`;
}

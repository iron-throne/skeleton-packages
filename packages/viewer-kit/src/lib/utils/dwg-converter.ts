import type { DxfDocument } from '@cadview/core';

export type DwgDecoder = 'typescript';
export type DwgPresentationRequest = 'auto' | 'model' | 'layout';

export interface DwgLayoutBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface DwgLayoutViewport {
	id: string;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	centerX: number;
	centerY: number;
	viewCenterX: number;
	viewCenterY: number;
	scaleFactor: number;
	entityIndices: number[];
}

export interface DwgPresentation {
	mode: 'model' | 'layout';
	layoutAvailable: boolean;
	layoutName?: string;
	bounds?: DwgLayoutBounds;
	viewports?: DwgLayoutViewport[];
}

export interface DwgConversionResult {
	document: DxfDocument;
	paperDocument?: DxfDocument;
	entityCount: number;
	decoder: DwgDecoder;
	warningCode: number;
	warnings: string[];
	presentation: DwgPresentation;
}

export interface DwgConversionOptions {
	signal?: AbortSignal;
	timeoutMs?: number;
	allowLargeFile?: boolean;
	transferInput?: boolean;
	presentation?: DwgPresentationRequest;
}

export interface EmbeddedDwgPreview {
	blob: Blob;
	mimeType: 'image/png' | 'image/bmp';
}

export class DwgConversionError extends Error {
	readonly preview?: EmbeddedDwgPreview;

	constructor(message: string, preview?: EmbeddedDwgPreview) {
		super(message);
		this.name = 'DwgConversionError';
		this.preview = preview;
	}
}

interface WorkerSuccess {
	ok: true;
	result: DwgConversionResult;
}

interface WorkerFailure {
	ok: false;
	error: string;
}

interface WorkerPreview {
	type: 'preview';
	preview: {
		buffer: ArrayBuffer;
		mimeType: EmbeddedDwgPreview['mimeType'];
	};
}

type WorkerResponse = WorkerSuccess | WorkerFailure | WorkerPreview;

export const STANDARD_DWG_INPUT_BYTES = 64 * 1024 * 1024;
export const LARGE_DWG_INPUT_BYTES = 192 * 1024 * 1024;
const STANDARD_OUTPUT_CHARACTERS = 64 * 1024 * 1024;
const LARGE_OUTPUT_CHARACTERS = 128 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 60_000;
const LARGE_TIMEOUT_MS = 180_000;

function abortError() {
	return new DOMException('DWG conversion was cancelled.', 'AbortError');
}

/** Runs the local DWG decoder in a terminable module worker. */
export function convertDwgLocally(
	source: Blob | ArrayBuffer,
	options: DwgConversionOptions = {}
): Promise<DwgConversionResult> {
	const inputBytes = source instanceof Blob ? source.size : source.byteLength;
	if (!inputBytes) return Promise.reject(new Error('The DWG file is empty.'));
	const inputLimit = options.allowLargeFile ? LARGE_DWG_INPUT_BYTES : STANDARD_DWG_INPUT_BYTES;
	if (inputBytes > inputLimit) {
		return Promise.reject(
			new Error(
				`This DWG is larger than the ${inputLimit / 1024 / 1024} MB browser safety limit${options.allowLargeFile ? '' : ' for automatic conversion'}.`
			)
		);
	}
	if (options.signal?.aborted) return Promise.reject(abortError());
	if (typeof Worker === 'undefined') {
		return Promise.reject(new Error('This browser does not support module workers.'));
	}

	return new Promise((resolve, reject) => {
		let activeWorker: Worker | undefined;
		let embeddedPreview: EmbeddedDwgPreview | undefined;
		let settled = false;
		const timeoutMs =
			options.timeoutMs ?? (options.allowLargeFile ? LARGE_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);
		const timeout = globalThis.setTimeout(() => {
			finish(() =>
				reject(
					new DwgConversionError(
						`DWG conversion exceeded the browser safety limit of ${timeoutMs} ms.`,
						embeddedPreview
					)
				)
			);
		}, timeoutMs);

		function finish(callback: () => void) {
			if (settled) return;
			settled = true;
			globalThis.clearTimeout(timeout);
			options.signal?.removeEventListener('abort', cancelled);
			activeWorker?.terminate();
			callback();
		}

		function cancelled() {
			finish(() => reject(abortError()));
		}

		function postBuffer(worker: Worker) {
			const input =
				source instanceof Blob ? source : options.transferInput ? source : source.slice(0);
			const transfer = input instanceof ArrayBuffer ? [input] : [];
			worker.postMessage(
				{
					buffer: input,
					presentation: options.presentation ?? 'auto',
					maxOutputCharacters: options.allowLargeFile
						? LARGE_OUTPUT_CHARACTERS
						: STANDARD_OUTPUT_CHARACTERS
				},
				transfer
			);
		}

		function startPrimary() {
			let worker: Worker;
			try {
				worker = new Worker(new URL('./dwg-converter.worker.js', import.meta.url), {
					type: 'module',
					name: 'viewer-kit-dwg'
				});
			} catch (cause) {
				finish(() => reject(new Error('The DWG worker could not be started.', { cause })));
				return;
			}
			activeWorker = worker;
			worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
				const data = event.data;
				if ('type' in data) {
					embeddedPreview = {
						blob: new Blob([data.preview.buffer], { type: data.preview.mimeType }),
						mimeType: data.preview.mimeType
					};
					return;
				}
				if (data.ok) finish(() => resolve(data.result));
				else finish(() => reject(new DwgConversionError(data.error, embeddedPreview)));
			};
			worker.onerror = (event) => {
				event.preventDefault();
				finish(() =>
					reject(
						new DwgConversionError(
							event.message || 'The DWG worker stopped unexpectedly.',
							embeddedPreview
						)
					)
				);
			};
			try {
				postBuffer(worker);
			} catch (cause) {
				finish(() =>
					reject(new Error('The drawing could not be sent to the DWG worker.', { cause }))
				);
			}
		}

		options.signal?.addEventListener('abort', cancelled, { once: true });
		startPrimary();
	});
}

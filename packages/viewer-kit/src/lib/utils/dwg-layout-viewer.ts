import {
	THEMES,
	applyTransform,
	computeEntitiesBounds,
	drawEntity,
	fitToView,
	resolveEntityColor,
	zoomAtPoint,
	type DxfDocument,
	type DxfEntity,
	type DxfLayer,
	type ViewTransform
} from '@cadview/core';
import type { DwgPresentation } from './dwg-converter';

const BACKGROUND = '#111827';
const PAPER_BORDER = '#cbd5e1';

function sanitizePaperBlocks(
	document: DxfDocument,
	bounds: NonNullable<DwgPresentation['bounds']>
): { document: DxfDocument; omittedEntityCount: number } {
	const tolerance = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.01;
	const blocks = new Map(document.blocks);
	let changed = false;
	let omittedEntityCount = 0;

	for (const entity of document.entities) {
		if (entity.type !== 'INSERT') continue;
		const block = document.blocks.get(entity.blockName);
		if (!block || block.entities.length < 100) continue;
		if (
			Math.abs(entity.insertionPoint.x) > tolerance ||
			Math.abs(entity.insertionPoint.y) > tolerance ||
			Math.abs(entity.scaleX - 1) > 1e-9 ||
			Math.abs(entity.scaleY - 1) > 1e-9 ||
			Math.abs(entity.rotation) > 1e-9 ||
			Math.abs(block.basePoint.x) > tolerance ||
			Math.abs(block.basePoint.y) > tolerance
		) {
			continue;
		}
		const resolvedBounds = computeEntitiesBounds([entity], document);
		if (
			!resolvedBounds ||
			(resolvedBounds.minX >= bounds.minX - tolerance &&
				resolvedBounds.minY >= bounds.minY - tolerance &&
				resolvedBounds.maxX <= bounds.maxX + tolerance &&
				resolvedBounds.maxY <= bounds.maxY + tolerance)
		) {
			continue;
		}

		const entities = block.entities.filter((blockEntity) => {
			if (!blockEntity.visible) return false;
			const entityBounds = computeEntitiesBounds([blockEntity], document);
			if (!entityBounds) return true;
			return (
				entityBounds.minX >= bounds.minX - tolerance &&
				entityBounds.minY >= bounds.minY - tolerance &&
				entityBounds.maxX <= bounds.maxX + tolerance &&
				entityBounds.maxY <= bounds.maxY + tolerance
			);
		});
		if (entities.length === block.entities.length) continue;
		omittedEntityCount += block.entities.length - entities.length;
		blocks.set(entity.blockName, { ...block, entities });
		changed = true;
	}

	return {
		document: changed ? { ...document, blocks } : document,
		omittedEntityCount
	};
}

export class DwgLayoutViewer {
	readonly canvas: HTMLCanvasElement;
	readonly modelDocument: DxfDocument;
	readonly paperDocument: DxfDocument;
	readonly presentation: DwgPresentation;
	readonly omittedPaperEntityCount: number;

	private readonly context: CanvasRenderingContext2D;
	private readonly visibleLayers = new Set<string>();
	private readonly resizeObserver: ResizeObserver;
	private view: ViewTransform = { scale: 1, offsetX: 0, offsetY: 0 };
	private frame = 0;
	private destroyed = false;
	private dragging = false;
	private pointerId = -1;
	private lastPointerX = 0;
	private lastPointerY = 0;

	constructor(
		canvas: HTMLCanvasElement,
		modelDocument: DxfDocument,
		paperDocument: DxfDocument,
		presentation: DwgPresentation
	) {
		if (presentation.mode !== 'layout' || !presentation.bounds || !presentation.viewports) {
			throw new Error('The DWG layout compositor received incomplete paper-space data.');
		}
		const context = canvas.getContext('2d', { alpha: false });
		if (!context) throw new Error('The browser could not create the paper-layout canvas.');
		this.canvas = canvas;
		this.context = context;
		this.modelDocument = modelDocument;
		const sanitizedPaper = sanitizePaperBlocks(paperDocument, presentation.bounds);
		this.paperDocument = sanitizedPaper.document;
		this.omittedPaperEntityCount = sanitizedPaper.omittedEntityCount;
		this.presentation = presentation;
		for (const layer of modelDocument.layers.values()) {
			if (!layer.isOff && !layer.isFrozen) this.visibleLayers.add(layer.name);
		}
		canvas.style.cursor = 'grab';
		canvas.style.touchAction = 'none';
		canvas.addEventListener('pointerdown', this.pointerDown);
		canvas.addEventListener('pointermove', this.pointerMove);
		canvas.addEventListener('pointerup', this.pointerUp);
		canvas.addEventListener('pointercancel', this.pointerUp);
		canvas.addEventListener('wheel', this.wheel, { passive: false });
		canvas.addEventListener('dblclick', this.doubleClick);
		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(canvas);
		this.resize(true);
	}

	getLayers(): DxfLayer[] {
		return [...this.modelDocument.layers.values()];
	}

	setLayerVisible(name: string, visible: boolean) {
		if (visible) this.visibleLayers.add(name);
		else this.visibleLayers.delete(name);
		this.requestRender();
	}

	fitToView() {
		const bounds = this.presentation.bounds;
		if (!bounds || this.destroyed) return;
		const rect = this.canvas.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		this.view = fitToView(
			rect.width,
			rect.height,
			bounds.minX,
			bounds.minY,
			bounds.maxX,
			bounds.maxY,
			0.04
		);
		this.requestRender();
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.resizeObserver.disconnect();
		this.canvas.removeEventListener('pointerdown', this.pointerDown);
		this.canvas.removeEventListener('pointermove', this.pointerMove);
		this.canvas.removeEventListener('pointerup', this.pointerUp);
		this.canvas.removeEventListener('pointercancel', this.pointerUp);
		this.canvas.removeEventListener('wheel', this.wheel);
		this.canvas.removeEventListener('dblclick', this.doubleClick);
		if (this.frame) cancelAnimationFrame(this.frame);
		this.frame = 0;
		this.canvas.style.cursor = '';
		this.canvas.style.touchAction = '';
	}

	private resize(initial = false) {
		if (this.destroyed) return;
		const rect = this.canvas.getBoundingClientRect();
		const ratio = window.devicePixelRatio || 1;
		const width = Math.max(1, Math.round(rect.width * ratio));
		const height = Math.max(1, Math.round(rect.height * ratio));
		if (this.canvas.width === width && this.canvas.height === height && !initial) return;
		this.canvas.width = width;
		this.canvas.height = height;
		this.fitToView();
	}

	private requestRender() {
		if (this.destroyed || this.frame) return;
		this.frame = requestAnimationFrame(() => {
			this.frame = 0;
			this.render();
		});
	}

	private render() {
		if (this.destroyed || !this.presentation.bounds || !this.presentation.viewports) return;
		const context = this.context;
		const ratio = window.devicePixelRatio || 1;
		const rect = this.canvas.getBoundingClientRect();
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.fillStyle = BACKGROUND;
		context.fillRect(0, 0, rect.width, rect.height);

		const bounds = this.presentation.bounds;
		applyTransform(context, this.view);
		context.fillStyle = THEMES.light.backgroundColor;
		context.fillRect(
			bounds.minX,
			bounds.minY,
			bounds.maxX - bounds.minX,
			bounds.maxY - bounds.minY
		);

		for (const viewport of this.presentation.viewports) {
			const modelView: ViewTransform = {
				scale: this.view.scale * viewport.scaleFactor,
				offsetX:
					this.view.offsetX +
					this.view.scale * (viewport.centerX - viewport.scaleFactor * viewport.viewCenterX),
				offsetY:
					this.view.offsetY -
					this.view.scale * viewport.centerY +
					this.view.scale * viewport.scaleFactor * viewport.viewCenterY
			};
			context.save();
			applyTransform(context, this.view);
			context.beginPath();
			context.rect(
				viewport.minX,
				viewport.minY,
				viewport.maxX - viewport.minX,
				viewport.maxY - viewport.minY
			);
			context.clip();
			this.drawEntities(
				this.modelDocument,
				viewport.entityIndices.map((index) => this.modelDocument.entities[index]).filter(Boolean),
				modelView
			);
			context.restore();
		}

		context.save();
		applyTransform(context, this.view);
		context.beginPath();
		context.rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
		context.clip();
		this.drawEntities(this.paperDocument, this.paperDocument.entities, this.view);
		context.restore();

		applyTransform(context, this.view);
		context.strokeStyle = PAPER_BORDER;
		context.lineWidth = 1 / this.view.scale;
		context.strokeRect(
			bounds.minX,
			bounds.minY,
			bounds.maxX - bounds.minX,
			bounds.maxY - bounds.minY
		);
	}

	private drawEntities(document: DxfDocument, entities: DxfEntity[], view: ViewTransform) {
		const context = this.context;
		applyTransform(context, view);
		const pixelSize = 1 / view.scale;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		for (const entity of entities) {
			if (!entity.visible || !this.visibleLayers.has(entity.layer)) continue;
			const color = resolveEntityColor(entity, document.layers, 'light');
			context.strokeStyle = color;
			context.fillStyle = color;
			context.lineWidth = pixelSize;
			drawEntity(context, entity, document, view, 'light', pixelSize);
		}
	}

	private pointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || this.destroyed) return;
		this.dragging = true;
		this.pointerId = event.pointerId;
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;
		this.canvas.setPointerCapture(event.pointerId);
		this.canvas.style.cursor = 'grabbing';
	};

	private pointerMove = (event: PointerEvent) => {
		if (!this.dragging || event.pointerId !== this.pointerId || this.destroyed) return;
		this.view = {
			...this.view,
			offsetX: this.view.offsetX + event.clientX - this.lastPointerX,
			offsetY: this.view.offsetY + event.clientY - this.lastPointerY
		};
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;
		this.requestRender();
	};

	private pointerUp = (event: PointerEvent) => {
		if (event.pointerId !== this.pointerId) return;
		this.dragging = false;
		this.pointerId = -1;
		if (this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
		this.canvas.style.cursor = 'grab';
	};

	private wheel = (event: WheelEvent) => {
		if (this.destroyed) return;
		event.preventDefault();
		const rect = this.canvas.getBoundingClientRect();
		this.view = zoomAtPoint(
			this.view,
			event.clientX - rect.left,
			event.clientY - rect.top,
			Math.exp(-event.deltaY * 0.0015)
		);
		this.requestRender();
	};

	private doubleClick = (event: MouseEvent) => {
		event.preventDefault();
		this.fitToView();
	};
}

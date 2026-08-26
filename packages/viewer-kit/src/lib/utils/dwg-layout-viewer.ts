import {
	THEMES,
	EventEmitter,
	MeasureTool,
	SpatialIndex,
	applyTransform,
	computeEntitiesBounds,
	drawEntity,
	findSnaps,
	fitToView,
	resolveEntityColor,
	screenToWorld,
	worldToScreen,
	zoomAtPoint,
	type BBox,
	type DxfDocument,
	type DxfEntity,
	type DxfLayer,
	type MeasureEvent,
	type Point2D,
	type SnapResult,
	type Tool,
	type ViewTransform
} from '@cadview/core';
import type { DwgLayoutViewport, DwgPresentation } from './dwg-converter';

const BACKGROUND = '#111827';
const PAPER_BORDER = '#cbd5e1';
const HIT_TOLERANCE_PIXELS = 7;
const MAX_HIT_TEST_ENTITIES = 30_000;
const MAX_INSERT_HIT_DEPTH = 32;

export interface DwgLayoutEntitySelection {
	kind: 'entity';
	space: 'paper' | 'model';
	entity: DxfEntity;
	entityIndex: number;
	paperPoint: Point2D;
	modelPoint?: Point2D;
	screenPoint: Point2D;
	viewportId?: string;
	viewportScale?: number;
}

export interface DwgLayoutViewportSelection {
	kind: 'viewport';
	space: 'paper';
	viewportId: string;
	viewportScale: number;
	paperPoint: Point2D;
	screenPoint: Point2D;
}

export type DwgLayoutSelection = DwgLayoutEntitySelection | DwgLayoutViewportSelection;

export interface DwgLayoutMeasureEvent extends MeasureEvent {
	space: 'paper' | 'model';
	viewportId?: string;
	paperPoints: [Point2D, Point2D];
}

type DwgLayoutViewerEventMap = Record<string, unknown> & {
	select: DwgLayoutSelection | null;
	measure: DwgLayoutMeasureEvent;
	viewchange: ViewTransform;
};

interface MeasurementContext {
	space: 'paper' | 'model';
	viewport?: DwgLayoutViewport;
}

interface HitBudget {
	remaining: number;
	blocks: Set<string>;
}

function distanceToSegment(point: Point2D, start: Point2D, end: Point2D) {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const lengthSquared = dx * dx + dy * dy;
	if (lengthSquared <= 1e-20) return Math.hypot(point.x - start.x, point.y - start.y);
	const t = Math.max(
		0,
		Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
	);
	return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function normalizedAngle(value: number) {
	const fullTurn = Math.PI * 2;
	return ((value % fullTurn) + fullTurn) % fullTurn;
}

function angleWithinArc(angle: number, start: number, end: number) {
	const normalized = normalizedAngle(angle);
	const normalizedStart = normalizedAngle(start);
	const normalizedEnd = normalizedAngle(end);
	return normalizedStart <= normalizedEnd
		? normalized >= normalizedStart && normalized <= normalizedEnd
		: normalized >= normalizedStart || normalized <= normalizedEnd;
}

function arcHit(
	point: Point2D,
	center: Point2D,
	radius: number,
	startDegrees: number,
	endDegrees: number,
	tolerance: number
) {
	const angle = Math.atan2(point.y - center.y, point.x - center.x);
	const start = (startDegrees * Math.PI) / 180;
	const end = (endDegrees * Math.PI) / 180;
	if (!angleWithinArc(angle, start, end)) return false;
	return Math.abs(Math.hypot(point.x - center.x, point.y - center.y) - radius) <= tolerance;
}

function ellipseHit(
	point: Point2D,
	center: Point2D,
	majorAxis: Point2D,
	minorRatio: number,
	tolerance: number
) {
	const rotation = Math.atan2(majorAxis.y, majorAxis.x);
	const cosine = Math.cos(-rotation);
	const sine = Math.sin(-rotation);
	const localX = (point.x - center.x) * cosine - (point.y - center.y) * sine;
	const localY = (point.x - center.x) * sine + (point.y - center.y) * cosine;
	const majorRadius = Math.hypot(majorAxis.x, majorAxis.y);
	const minorRadius = majorRadius * Math.abs(minorRatio);
	if (majorRadius <= 1e-10 || minorRadius <= 1e-10) return false;
	const scaledRadius = Math.hypot(localX / majorRadius, localY / minorRadius);
	return Math.abs(scaledRadius - 1) * Math.min(majorRadius, minorRadius) <= tolerance;
}

function pointInPolygon(point: Point2D, vertices: Point2D[]) {
	let inside = false;
	for (let index = 0, previous = vertices.length - 1; index < vertices.length; previous = index++) {
		const currentPoint = vertices[index];
		const previousPoint = vertices[previous];
		if (!currentPoint || !previousPoint) continue;
		const crosses =
			currentPoint.y > point.y !== previousPoint.y > point.y &&
			point.x <
				((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
					(previousPoint.y - currentPoint.y) +
					currentPoint.x;
		if (crosses) inside = !inside;
	}
	return inside;
}

function boundsContainPoint(bounds: BBox | null, point: Point2D, tolerance: number) {
	return Boolean(
		bounds &&
		point.x >= bounds.minX - tolerance &&
		point.x <= bounds.maxX + tolerance &&
		point.y >= bounds.minY - tolerance &&
		point.y <= bounds.maxY + tolerance
	);
}

function hatchHit(
	point: Point2D,
	entity: Extract<DxfEntity, { type: 'HATCH' }>,
	tolerance: number
) {
	for (const path of entity.boundaryPaths) {
		if (path.type === 'polyline' && path.vertices && path.vertices.length > 1) {
			if (entity.solidFill && path.isClosed && pointInPolygon(point, path.vertices)) return true;
			const segmentCount = path.isClosed ? path.vertices.length : path.vertices.length - 1;
			for (let index = 0; index < segmentCount; index += 1) {
				const start = path.vertices[index];
				const end = path.vertices[(index + 1) % path.vertices.length];
				if (start && end && distanceToSegment(point, start, end) <= tolerance) return true;
			}
		}
		if (path.type === 'edges' && path.edges) {
			for (const edge of path.edges) {
				if (edge.type === 'line' && distanceToSegment(point, edge.start, edge.end) <= tolerance) {
					return true;
				}
				if (
					edge.type === 'arc' &&
					arcHit(point, edge.center, edge.radius, edge.startAngle, edge.endAngle, tolerance)
				) {
					return true;
				}
				if (
					edge.type === 'ellipse' &&
					ellipseHit(point, edge.center, edge.majorAxis, edge.minorRatio, tolerance)
				) {
					return true;
				}
				if (edge.type === 'spline') {
					for (let index = 0; index < edge.controlPoints.length - 1; index += 1) {
						const start = edge.controlPoints[index];
						const end = edge.controlPoints[index + 1];
						if (start && end && distanceToSegment(point, start, end) <= tolerance) return true;
					}
				}
			}
		}
	}
	return false;
}

function entityHit(
	point: Point2D,
	entity: DxfEntity,
	document: DxfDocument,
	tolerance: number,
	budget: HitBudget,
	depth = 0
): boolean {
	budget.remaining -= 1;
	if (budget.remaining < 0 || depth > MAX_INSERT_HIT_DEPTH) return false;
	switch (entity.type) {
		case 'LINE':
			return distanceToSegment(point, entity.start, entity.end) <= tolerance;
		case 'CIRCLE':
			return (
				Math.abs(
					Math.hypot(point.x - entity.center.x, point.y - entity.center.y) - entity.radius
				) <= tolerance
			);
		case 'ARC':
			return arcHit(
				point,
				entity.center,
				entity.radius,
				entity.startAngle,
				entity.endAngle,
				tolerance
			);
		case 'LWPOLYLINE':
		case 'POLYLINE': {
			const segmentCount = entity.closed ? entity.vertices.length : entity.vertices.length - 1;
			for (let index = 0; index < segmentCount; index += 1) {
				const start = entity.vertices[index];
				const end = entity.vertices[(index + 1) % entity.vertices.length];
				if (start && end && distanceToSegment(point, start, end) <= tolerance) return true;
			}
			return false;
		}
		case 'ELLIPSE':
			return ellipseHit(point, entity.center, entity.majorAxis, entity.minorRatio, tolerance);
		case 'SPLINE': {
			const points = entity.fitPoints.length > 1 ? entity.fitPoints : entity.controlPoints;
			for (let index = 0; index < points.length - 1; index += 1) {
				const start = points[index];
				const end = points[index + 1];
				if (start && end && distanceToSegment(point, start, end) <= tolerance) return true;
			}
			return false;
		}
		case 'TEXT':
		case 'MTEXT':
			return boundsContainPoint(computeEntitiesBounds([entity]), point, tolerance);
		case 'POINT':
			return Math.hypot(point.x - entity.position.x, point.y - entity.position.y) <= tolerance;
		case 'HATCH':
			return hatchHit(point, entity, tolerance);
		case 'DIMENSION': {
			const block = entity.blockName ? document.blocks.get(entity.blockName) : undefined;
			if (block) {
				for (let index = block.entities.length - 1; index >= 0; index -= 1) {
					const child = block.entities[index];
					if (child && entityHit(point, child, document, tolerance, budget, depth + 1)) return true;
				}
			}
			if (
				entity.defPoint2 &&
				distanceToSegment(point, entity.defPoint2, entity.defPoint) <= tolerance
			) {
				return true;
			}
			return Boolean(
				entity.defPoint3 && distanceToSegment(point, entity.defPoint3, entity.defPoint) <= tolerance
			);
		}
		case 'INSERT': {
			const block = document.blocks.get(entity.blockName);
			if (!block || budget.blocks.has(entity.blockName)) return false;
			if (Math.abs(entity.scaleX) <= 1e-12 || Math.abs(entity.scaleY) <= 1e-12) return false;
			budget.blocks.add(entity.blockName);
			try {
				const radians = (-entity.rotation * Math.PI) / 180;
				const cosine = Math.cos(radians);
				const sine = Math.sin(radians);
				const maxInstances = Math.max(1, Math.min(4_096, budget.remaining));
				const rows = Math.max(1, Math.min(entity.rowCount, maxInstances));
				const columns = Math.max(1, Math.min(entity.columnCount, Math.floor(maxInstances / rows)));
				const childTolerance =
					tolerance / Math.max(1e-12, Math.min(Math.abs(entity.scaleX), Math.abs(entity.scaleY)));
				for (let row = 0; row < rows; row += 1) {
					for (let column = 0; column < columns; column += 1) {
						budget.remaining -= 1;
						if (budget.remaining < 0) return false;
						const deltaX = point.x - (entity.insertionPoint.x + column * entity.columnSpacing);
						const deltaY = point.y - (entity.insertionPoint.y + row * entity.rowSpacing);
						const localPoint = {
							x: (deltaX * cosine - deltaY * sine) / entity.scaleX + block.basePoint.x,
							y: (deltaX * sine + deltaY * cosine) / entity.scaleY + block.basePoint.y
						};
						for (let index = block.entities.length - 1; index >= 0; index -= 1) {
							const child = block.entities[index];
							if (
								child &&
								entityHit(localPoint, child, document, childTolerance, budget, depth + 1)
							) {
								return true;
							}
						}
					}
				}
				return false;
			} finally {
				budget.blocks.delete(entity.blockName);
			}
		}
	}
}

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
	private readonly emitter = new EventEmitter<DwgLayoutViewerEventMap>();
	private readonly layers = new Map<string, DxfLayer>();
	private readonly visibleLayers = new Set<string>();
	private readonly modelSpatialIndex = new SpatialIndex();
	private readonly paperSpatialIndex = new SpatialIndex();
	private readonly modelEntityIndices: number[];
	private readonly paperEntityIndices: number[];
	private readonly resizeObserver: ResizeObserver;
	private readonly measureTool = new MeasureTool();
	private view: ViewTransform = { scale: 1, offsetX: 0, offsetY: 0 };
	private currentTool: Tool = 'pan';
	private selection: DwgLayoutSelection | null = null;
	private measureContext: MeasurementContext | undefined;
	private mouseScreenX = 0;
	private mouseScreenY = 0;
	private frame = 0;
	private destroyed = false;
	private dragging = false;
	private pointerMoved = false;
	private pointerId = -1;
	private pointerStartX = 0;
	private pointerStartY = 0;
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
		for (const [name, layer] of modelDocument.layers) this.layers.set(name, layer);
		for (const [name, layer] of this.paperDocument.layers) this.layers.set(name, layer);
		for (const layer of this.layers.values()) {
			if (!layer.isOff && !layer.isFrozen) this.visibleLayers.add(layer.name);
		}
		this.modelEntityIndices = modelDocument.entities.map((_entity, index) => index);
		this.paperEntityIndices = this.paperDocument.entities.map((_entity, index) => index);
		this.modelSpatialIndex.build(modelDocument.entities, modelDocument);
		this.paperSpatialIndex.build(this.paperDocument.entities, this.paperDocument);
		canvas.style.cursor = 'grab';
		canvas.style.touchAction = 'none';
		canvas.addEventListener('pointerdown', this.pointerDown);
		canvas.addEventListener('pointermove', this.pointerMove);
		canvas.addEventListener('pointerup', this.pointerUp);
		canvas.addEventListener('pointercancel', this.pointerCancel);
		canvas.addEventListener('wheel', this.wheel, { passive: false });
		canvas.addEventListener('dblclick', this.doubleClick);
		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(canvas);
		this.resize(true);
	}

	getLayers(): DxfLayer[] {
		return [...this.layers.values()];
	}

	getTool(): Tool {
		return this.currentTool;
	}

	setTool(tool: Tool) {
		if (this.destroyed || this.currentTool === tool) return;
		this.currentTool = tool;
		this.dragging = false;
		this.pointerId = -1;
		if (tool === 'measure') {
			this.measureTool.activate();
			this.measureContext = undefined;
		} else {
			this.measureTool.deactivate();
			this.measureContext = undefined;
		}
		this.canvas.style.cursor = tool === 'pan' ? 'grab' : 'crosshair';
		this.requestRender();
	}

	on<K extends keyof DwgLayoutViewerEventMap>(
		event: K,
		callback: (data: DwgLayoutViewerEventMap[K]) => void
	) {
		this.emitter.on(event, callback);
	}

	off<K extends keyof DwgLayoutViewerEventMap>(
		event: K,
		callback: (data: DwgLayoutViewerEventMap[K]) => void
	) {
		this.emitter.off(event, callback);
	}

	setLayerVisible(name: string, visible: boolean) {
		if (visible) this.visibleLayers.add(name);
		else this.visibleLayers.delete(name);
		this.requestRender();
	}

	getViewTransform(): ViewTransform {
		return { ...this.view };
	}

	zoomBy(factor: number) {
		if (this.destroyed || !Number.isFinite(factor) || factor <= 0) return;
		const rect = this.canvas.getBoundingClientRect();
		this.view = zoomAtPoint(this.view, rect.width / 2, rect.height / 2, factor);
		this.emitter.emit('viewchange', this.getViewTransform());
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
		this.emitter.emit('viewchange', this.getViewTransform());
		this.requestRender();
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.resizeObserver.disconnect();
		this.canvas.removeEventListener('pointerdown', this.pointerDown);
		this.canvas.removeEventListener('pointermove', this.pointerMove);
		this.canvas.removeEventListener('pointerup', this.pointerUp);
		this.canvas.removeEventListener('pointercancel', this.pointerCancel);
		this.canvas.removeEventListener('wheel', this.wheel);
		this.canvas.removeEventListener('dblclick', this.doubleClick);
		if (this.frame) cancelAnimationFrame(this.frame);
		this.frame = 0;
		this.canvas.style.cursor = '';
		this.canvas.style.touchAction = '';
		this.modelSpatialIndex.clear();
		this.paperSpatialIndex.clear();
		this.emitter.removeAllListeners();
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
		if (initial) this.fitToView();
		else this.requestRender();
	}

	private requestRender() {
		if (this.destroyed || this.frame) return;
		this.frame = requestAnimationFrame(() => {
			this.frame = 0;
			this.render();
		});
	}

	private modelView(viewport: DwgLayoutViewport): ViewTransform {
		return {
			scale: this.view.scale * viewport.scaleFactor,
			offsetX:
				this.view.offsetX +
				this.view.scale * (viewport.centerX - viewport.scaleFactor * viewport.viewCenterX),
			offsetY:
				this.view.offsetY -
				this.view.scale * viewport.centerY +
				this.view.scale * viewport.scaleFactor * viewport.viewCenterY
		};
	}

	private paperPoint(screenX: number, screenY: number): Point2D {
		const [x, y] = screenToWorld(this.view, screenX, screenY);
		return { x, y };
	}

	private modelPoint(viewport: DwgLayoutViewport, screenX: number, screenY: number): Point2D {
		const [x, y] = screenToWorld(this.modelView(viewport), screenX, screenY);
		return { x, y };
	}

	private pointInsideViewport(point: Point2D, viewport: DwgLayoutViewport) {
		return (
			point.x >= viewport.minX &&
			point.x <= viewport.maxX &&
			point.y >= viewport.minY &&
			point.y <= viewport.maxY
		);
	}

	private hitDocument(
		point: Point2D,
		document: DxfDocument,
		spatialIndex: SpatialIndex,
		indices: number[],
		scale: number
	) {
		const tolerance = HIT_TOLERANCE_PIXELS / Math.max(scale, 1e-12);
		const candidates = new Set(
			spatialIndex
				.search(point.x - tolerance, point.y - tolerance, point.x + tolerance, point.y + tolerance)
				.map((item) => item.entityIndex)
		);
		for (let cursor = indices.length - 1; cursor >= 0; cursor -= 1) {
			const index = indices[cursor];
			if (index === undefined) continue;
			const entity = document.entities[index];
			if (!entity?.visible || !this.visibleLayers.has(entity.layer)) continue;
			if (entity.type !== 'HATCH' && !candidates.has(index)) continue;
			const budget: HitBudget = {
				remaining: MAX_HIT_TEST_ENTITIES,
				blocks: new Set()
			};
			if (entityHit(point, entity, document, tolerance, budget)) return index;
		}
		return -1;
	}

	private pick(screenX: number, screenY: number): DwgLayoutSelection | null {
		const paperPoint = this.paperPoint(screenX, screenY);
		const screenPoint = { x: screenX, y: screenY };
		const paperIndex = this.hitDocument(
			paperPoint,
			this.paperDocument,
			this.paperSpatialIndex,
			this.paperEntityIndices,
			this.view.scale
		);
		if (paperIndex >= 0) {
			const entity = this.paperDocument.entities[paperIndex];
			if (entity) {
				return {
					kind: 'entity',
					space: 'paper',
					entity,
					entityIndex: paperIndex,
					paperPoint,
					screenPoint
				};
			}
		}

		const viewports = this.presentation.viewports ?? [];
		for (let cursor = viewports.length - 1; cursor >= 0; cursor -= 1) {
			const viewport = viewports[cursor];
			if (!viewport || !this.pointInsideViewport(paperPoint, viewport)) continue;
			const modelPoint = this.modelPoint(viewport, screenX, screenY);
			const entityIndex = this.hitDocument(
				modelPoint,
				this.modelDocument,
				this.modelSpatialIndex,
				viewport.entityIndices,
				this.view.scale * viewport.scaleFactor
			);
			if (entityIndex >= 0) {
				const entity = this.modelDocument.entities[entityIndex];
				if (entity) {
					return {
						kind: 'entity',
						space: 'model',
						entity,
						entityIndex,
						paperPoint,
						modelPoint,
						screenPoint,
						viewportId: viewport.id,
						viewportScale: viewport.scaleFactor
					};
				}
			}
		}

		const frameTolerance = HIT_TOLERANCE_PIXELS / Math.max(this.view.scale, 1e-12);
		for (let cursor = viewports.length - 1; cursor >= 0; cursor -= 1) {
			const viewport = viewports[cursor];
			if (!viewport) continue;
			const insideExpanded =
				paperPoint.x >= viewport.minX - frameTolerance &&
				paperPoint.x <= viewport.maxX + frameTolerance &&
				paperPoint.y >= viewport.minY - frameTolerance &&
				paperPoint.y <= viewport.maxY + frameTolerance;
			const nearestEdge = Math.min(
				Math.abs(paperPoint.x - viewport.minX),
				Math.abs(paperPoint.x - viewport.maxX),
				Math.abs(paperPoint.y - viewport.minY),
				Math.abs(paperPoint.y - viewport.maxY)
			);
			if (insideExpanded && nearestEdge <= frameTolerance) {
				return {
					kind: 'viewport',
					space: 'paper',
					viewportId: viewport.id,
					viewportScale: viewport.scaleFactor,
					paperPoint,
					screenPoint
				};
			}
		}
		return null;
	}

	private viewportById(id: string | undefined) {
		return id ? this.presentation.viewports?.find((viewport) => viewport.id === id) : undefined;
	}

	private measurementContextAt(
		screenX: number,
		screenY: number,
		inspectEntities = true
	): MeasurementContext {
		if (inspectEntities) {
			const picked = this.pick(screenX, screenY);
			if (picked?.kind === 'entity' && picked.space === 'paper') return { space: 'paper' };
			if (picked?.viewportId) {
				const viewport = this.viewportById(picked.viewportId);
				if (viewport) return { space: 'model', viewport };
			}
		}
		const paperPoint = this.paperPoint(screenX, screenY);
		const viewports = this.presentation.viewports ?? [];
		for (let cursor = viewports.length - 1; cursor >= 0; cursor -= 1) {
			const viewport = viewports[cursor];
			if (viewport && this.pointInsideViewport(paperPoint, viewport)) {
				return { space: 'model', viewport };
			}
		}
		return { space: 'paper' };
	}

	private contextTransform(context: MeasurementContext) {
		return context.space === 'model' && context.viewport
			? this.modelView(context.viewport)
			: this.view;
	}

	private snapAt(context: MeasurementContext, point: Point2D): SnapResult | null {
		const modelContext = context.space === 'model' && context.viewport;
		const document = modelContext ? this.modelDocument : this.paperDocument;
		const spatialIndex = modelContext ? this.modelSpatialIndex : this.paperSpatialIndex;
		const scale = modelContext ? this.view.scale * context.viewport!.scaleFactor : this.view.scale;
		const allowed = modelContext ? new Set(context.viewport!.entityIndices) : undefined;
		return (
			findSnaps(point.x, point.y, document.entities, spatialIndex, scale).find((snap) => {
				const entity = document.entities[snap.entityIndex];
				return Boolean(
					entity?.visible &&
					this.visibleLayers.has(entity.layer) &&
					(!allowed || allowed.has(snap.entityIndex))
				);
			}) ?? null
		);
	}

	private pointForContext(context: MeasurementContext, screenX: number, screenY: number): Point2D {
		return context.space === 'model' && context.viewport
			? this.modelPoint(context.viewport, screenX, screenY)
			: this.paperPoint(screenX, screenY);
	}

	private modelToPaper(point: Point2D, viewport: DwgLayoutViewport): Point2D {
		return {
			x: viewport.centerX + (point.x - viewport.viewCenterX) * viewport.scaleFactor,
			y: viewport.centerY + (point.y - viewport.viewCenterY) * viewport.scaleFactor
		};
	}

	private handleMeasureClick(screenX: number, screenY: number) {
		if (this.measureTool.state.phase !== 'second-point') {
			this.measureContext = this.measurementContextAt(screenX, screenY);
		}
		const context = this.measureContext;
		if (!context) return;
		const point = this.pointForContext(context, screenX, screenY);
		const snap = this.snapAt(context, point);
		const event = this.measureTool.handleClick(point.x, point.y, snap);
		if (event) {
			const paperPoints: [Point2D, Point2D] =
				context.space === 'model' && context.viewport
					? [
							this.modelToPaper(event.points[0], context.viewport),
							this.modelToPaper(event.points[1], context.viewport)
						]
					: event.points;
			this.emitter.emit('measure', {
				...event,
				space: context.space,
				viewportId: context.viewport?.id,
				paperPoints
			});
		}
		this.requestRender();
	}

	private updateMeasurePointer(screenX: number, screenY: number) {
		const context =
			this.measureTool.state.phase === 'second-point' && this.measureContext
				? this.measureContext
				: this.measurementContextAt(screenX, screenY, false);
		const point = this.pointForContext(context, screenX, screenY);
		this.measureTool.handleMove(this.snapAt(context, point));
		this.requestRender();
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
			const modelView = this.modelView(viewport);
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

		this.renderSelection();
		this.renderMeasurement();
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

	private drawSelectionEntity(
		document: DxfDocument,
		entity: DxfEntity,
		entityIndex: number,
		spatialIndex: SpatialIndex,
		view: ViewTransform
	) {
		const context = this.context;
		const pixelSize = 1 / Math.max(view.scale, 1e-12);
		applyTransform(context, view);
		context.strokeStyle = THEMES.light.selectionColor;
		context.fillStyle = THEMES.light.selectionColor;
		context.lineWidth = pixelSize * 3;
		drawEntity(context, entity, document, view, 'light', pixelSize);
		const bounds = spatialIndex.getEntityBBox(entityIndex);
		if (!bounds) return;
		context.strokeStyle = THEMES.light.selectionColor;
		context.lineWidth = pixelSize * 1.5;
		context.setLineDash([pixelSize * 6, pixelSize * 3]);
		context.strokeRect(
			bounds.minX,
			bounds.minY,
			bounds.maxX - bounds.minX,
			bounds.maxY - bounds.minY
		);
		context.setLineDash([]);
		const handleSize = pixelSize * 5;
		for (const [x, y] of [
			[bounds.minX, bounds.minY],
			[bounds.minX, bounds.maxY],
			[bounds.maxX, bounds.minY],
			[bounds.maxX, bounds.maxY]
		] as const) {
			context.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
		}
	}

	private renderSelection() {
		const selection = this.selection;
		if (!selection) return;
		const context = this.context;
		if (selection.kind === 'viewport') {
			const viewport = this.viewportById(selection.viewportId);
			if (!viewport) return;
			context.save();
			applyTransform(context, this.view);
			context.strokeStyle = THEMES.light.selectionColor;
			context.lineWidth = 3 / Math.max(this.view.scale, 1e-12);
			context.setLineDash([8 / this.view.scale, 4 / this.view.scale]);
			context.strokeRect(
				viewport.minX,
				viewport.minY,
				viewport.maxX - viewport.minX,
				viewport.maxY - viewport.minY
			);
			context.restore();
			return;
		}

		if (selection.space === 'paper') {
			context.save();
			const bounds = this.presentation.bounds;
			if (bounds) {
				applyTransform(context, this.view);
				context.beginPath();
				context.rect(
					bounds.minX,
					bounds.minY,
					bounds.maxX - bounds.minX,
					bounds.maxY - bounds.minY
				);
				context.clip();
			}
			this.drawSelectionEntity(
				this.paperDocument,
				selection.entity,
				selection.entityIndex,
				this.paperSpatialIndex,
				this.view
			);
			context.restore();
			return;
		}

		const viewport = this.viewportById(selection.viewportId);
		if (!viewport) return;
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
		this.drawSelectionEntity(
			this.modelDocument,
			selection.entity,
			selection.entityIndex,
			this.modelSpatialIndex,
			this.modelView(viewport)
		);
		context.restore();
	}

	private renderMeasurement() {
		if (this.currentTool !== 'measure' || !this.measureContext) return;
		const state = this.measureTool.state;
		if (state.phase !== 'second-point' && state.phase !== 'done') return;
		const transform = this.contextTransform(this.measureContext);
		const first = state.firstPoint;
		const second =
			state.phase === 'done'
				? state.secondPoint
				: (this.measureTool.currentSnap?.point ??
					this.pointForContext(this.measureContext, this.mouseScreenX, this.mouseScreenY));
		const [startX, startY] = worldToScreen(transform, first.x, first.y);
		const [endX, endY] = worldToScreen(transform, second.x, second.y);
		const ratio = window.devicePixelRatio || 1;
		const context = this.context;
		context.save();
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.strokeStyle = THEMES.light.measureColor;
		context.fillStyle = THEMES.light.measureColor;
		context.lineWidth = 2;
		if (state.phase === 'second-point') context.setLineDash([6, 3]);
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.stroke();
		context.setLineDash([]);
		for (const [x, y] of [
			[startX, startY],
			[endX, endY]
		] as const) {
			context.beginPath();
			context.arc(x, y, 4, 0, Math.PI * 2);
			context.fill();
		}
		const distance = Math.hypot(second.x - first.x, second.y - first.y);
		const labelX = (startX + endX) / 2;
		const labelY = (startY + endY) / 2;
		context.font = '600 12px system-ui, sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'bottom';
		const label = distance.toFixed(3);
		const width = context.measureText(label).width + 12;
		context.fillStyle = 'rgba(15, 23, 42, 0.9)';
		context.fillRect(labelX - width / 2, labelY - 25, width, 20);
		context.fillStyle = '#f8fafc';
		context.fillText(label, labelX, labelY - 9);
		if (this.measureTool.currentSnap) {
			context.strokeStyle = THEMES.light.measureColor;
			context.strokeRect(endX - 5, endY - 5, 10, 10);
		}
		context.restore();
	}

	private pointerDown = (event: PointerEvent) => {
		if (event.button !== 0 || this.destroyed) return;
		const rect = this.canvas.getBoundingClientRect();
		this.mouseScreenX = event.clientX - rect.left;
		this.mouseScreenY = event.clientY - rect.top;
		this.dragging = this.currentTool === 'pan';
		this.pointerMoved = false;
		this.pointerId = event.pointerId;
		this.pointerStartX = event.clientX;
		this.pointerStartY = event.clientY;
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;
		this.canvas.setPointerCapture(event.pointerId);
		if (this.currentTool === 'pan') this.canvas.style.cursor = 'grabbing';
	};

	private pointerMove = (event: PointerEvent) => {
		if (this.destroyed) return;
		const rect = this.canvas.getBoundingClientRect();
		this.mouseScreenX = event.clientX - rect.left;
		this.mouseScreenY = event.clientY - rect.top;
		if (
			event.pointerId === this.pointerId &&
			Math.hypot(event.clientX - this.pointerStartX, event.clientY - this.pointerStartY) > 4
		) {
			this.pointerMoved = true;
		}
		if (this.dragging && event.pointerId === this.pointerId) {
			this.view = {
				...this.view,
				offsetX: this.view.offsetX + event.clientX - this.lastPointerX,
				offsetY: this.view.offsetY + event.clientY - this.lastPointerY
			};
			this.emitter.emit('viewchange', this.getViewTransform());
			this.requestRender();
		} else if (this.currentTool === 'measure') {
			this.updateMeasurePointer(this.mouseScreenX, this.mouseScreenY);
		}
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;
	};

	private pointerUp = (event: PointerEvent) => {
		if (event.pointerId !== this.pointerId) return;
		const rect = this.canvas.getBoundingClientRect();
		const screenX = event.clientX - rect.left;
		const screenY = event.clientY - rect.top;
		const activate = !this.pointerMoved;
		this.dragging = false;
		this.pointerId = -1;
		if (this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
		if (activate && this.currentTool === 'select') {
			this.selection = this.pick(screenX, screenY);
			this.emitter.emit('select', this.selection);
			this.requestRender();
		} else if (activate && this.currentTool === 'measure') {
			this.handleMeasureClick(screenX, screenY);
		}
		this.canvas.style.cursor = this.currentTool === 'pan' ? 'grab' : 'crosshair';
	};

	private pointerCancel = (event: PointerEvent) => {
		if (event.pointerId !== this.pointerId) return;
		this.dragging = false;
		this.pointerId = -1;
		this.canvas.style.cursor = this.currentTool === 'pan' ? 'grab' : 'crosshair';
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
		this.emitter.emit('viewchange', this.getViewTransform());
		this.requestRender();
	};

	private doubleClick = (event: MouseEvent) => {
		event.preventDefault();
		this.fitToView();
	};
}

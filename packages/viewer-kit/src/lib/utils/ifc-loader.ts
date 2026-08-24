import * as THREE from 'three';
import { IfcAPI, type FlatMesh } from 'web-ifc';
import webIfcWasmUrl from 'web-ifc/web-ifc.wasm?url';
import type { ViewerSource } from '../types';

export interface LoadedIfcModel {
	group: THREE.Group;
	properties(expressId: number): Record<string, string | number>;
	dispose(): void;
}

function unwrapIfcValue(value: unknown): string | number | undefined {
	if (typeof value === 'string' || typeof value === 'number') return value;
	if (value && typeof value === 'object' && 'value' in value) {
		const nested = (value as { value?: unknown }).value;
		if (typeof nested === 'string' || typeof nested === 'number') return nested;
	}
	return undefined;
}

function geometryFromIfc(api: IfcAPI, modelId: number, geometryExpressId: number) {
	const ifcGeometry = api.GetGeometry(modelId, geometryExpressId);
	try {
		const rawVertices = api.GetVertexArray(
			ifcGeometry.GetVertexData(),
			ifcGeometry.GetVertexDataSize()
		);
		const rawIndices = api.GetIndexArray(
			ifcGeometry.GetIndexData(),
			ifcGeometry.GetIndexDataSize()
		);
		const vertexCount = rawVertices.length / 6;
		const positions = new Float32Array(vertexCount * 3);
		const normals = new Float32Array(vertexCount * 3);

		for (let sourceIndex = 0, targetIndex = 0; sourceIndex < rawVertices.length; sourceIndex += 6) {
			positions[targetIndex] = rawVertices[sourceIndex];
			normals[targetIndex++] = rawVertices[sourceIndex + 3];
			positions[targetIndex] = rawVertices[sourceIndex + 1];
			normals[targetIndex++] = rawVertices[sourceIndex + 4];
			positions[targetIndex] = rawVertices[sourceIndex + 2];
			normals[targetIndex++] = rawVertices[sourceIndex + 5];
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
		geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(rawIndices), 1));
		geometry.computeBoundingBox();
		return geometry;
	} finally {
		ifcGeometry.delete();
	}
}

function addFlatMesh(
	api: IfcAPI,
	modelId: number,
	flatMesh: FlatMesh,
	group: THREE.Group,
	materials: Map<string, THREE.MeshStandardMaterial>
) {
	for (let index = 0; index < flatMesh.geometries.size(); index += 1) {
		const placed = flatMesh.geometries.get(index);
		const geometry = geometryFromIfc(api, modelId, placed.geometryExpressID);
		geometry.applyMatrix4(new THREE.Matrix4().fromArray(placed.flatTransformation));
		const alpha = Math.max(0, Math.min(1, placed.color.w));
		const materialKey = [placed.color.x, placed.color.y, placed.color.z, alpha]
			.map((channel) => channel.toFixed(3))
			.join(':');
		let material = materials.get(materialKey);
		if (!material) {
			material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(placed.color.x, placed.color.y, placed.color.z),
				side: THREE.DoubleSide,
				transparent: alpha < 0.999,
				opacity: alpha,
				depthWrite: alpha >= 0.999,
				roughness: 0.82,
				metalness: 0.02
			});
			materials.set(materialKey, material);
		}
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = `IFC element #${flatMesh.expressID}`;
		mesh.userData = { expressId: flatMesh.expressID };
		group.add(mesh);
	}
}

export async function loadIfcModel(source: ViewerSource): Promise<LoadedIfcModel> {
	let buffer: ArrayBuffer;
	if (typeof source === 'string') {
		const response = await fetch(source);
		if (!response.ok) throw new Error(`IFC request failed with ${response.status}.`);
		buffer = await response.arrayBuffer();
	} else {
		buffer = await source.arrayBuffer();
	}
	const data = new Uint8Array(buffer);

	const api = new IfcAPI();
	await api.Init((fileName) => (fileName.endsWith('.wasm') ? webIfcWasmUrl : fileName), true);
	const modelId = api.OpenModel(data, { COORDINATE_TO_ORIGIN: true, CIRCLE_SEGMENTS: 24 });
	if (modelId < 0) {
		api.Dispose();
		throw new Error('The IFC model could not be opened.');
	}

	const group = new THREE.Group();
	group.name = 'IFC model';
	group.rotation.x = -Math.PI / 2;
	const materials = new Map<string, THREE.MeshStandardMaterial>();
	api.StreamAllMeshes(modelId, (flatMesh) => addFlatMesh(api, modelId, flatMesh, group, materials));

	return {
		group,
		properties(expressId) {
			const line = api.GetLine(modelId, expressId, false);
			const result: Record<string, string | number> = {
				'Express ID': expressId,
				Type: api.GetNameFromTypeCode(api.GetLineType(modelId, expressId))
			};
			for (const key of ['Name', 'GlobalId', 'ObjectType', 'Tag', 'Description']) {
				const value = unwrapIfcValue(line?.[key]);
				if (value !== undefined && value !== '') result[key] = value;
			}
			return result;
		},
		dispose() {
			group.traverse((object) => {
				if (object instanceof THREE.Mesh) object.geometry.dispose();
			});
			for (const material of materials.values()) material.dispose();
			api.CloseModel(modelId);
			api.Dispose();
		}
	};
}

<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import type { BaseViewerProps, BimFileType, ViewerSource } from '../types';
	import type { LoadedIfcModel } from '../utils/ifc-loader';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		type: BimFileType;
	}

	let {
		source,
		type,
		title = 'BIM model',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();

	let canvasHost = $state<HTMLDivElement>();
	let loading = $state(true);
	let message = $state('Preparing model...');
	let loadError = $state('');
	let selectedName = $state('Nothing selected');
	let selectedDetails = $state('Click an element in the model to inspect it.');
	let iframeUrl = $state('');
	let renderer = $state<THREE.WebGLRenderer>();
	let scene: THREE.Scene | undefined;
	let camera: THREE.PerspectiveCamera | undefined;
	let controls: OrbitControls | undefined;
	let model: THREE.Object3D | undefined;
	let ifcModel: LoadedIfcModel | undefined;
	let selectionOutline: THREE.BoxHelper | undefined;
	let animationFrame = 0;
	let resizeObserver: ResizeObserver | undefined;
	let ownedUrl: string | undefined;
	let pointerStart: THREE.Vector2 | undefined;

	function sourceUrl(value: ViewerSource) {
		if (typeof value === 'string') return value;
		ownedUrl = URL.createObjectURL(value);
		return ownedUrl;
	}

	function fitModel() {
		if (!model || !camera || !controls) return;
		const box = new THREE.Box3().setFromObject(model);
		if (box.isEmpty()) return;
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());
		const maxSize = Math.max(size.x, size.y, size.z, 0.1);
		const distance = maxSize / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		camera.position
			.copy(center)
			.add(new THREE.Vector3(1, 0.75, 1).normalize().multiplyScalar(distance * 0.72));
		camera.near = Math.max(distance / 10000, 0.01);
		camera.far = Math.max(distance * 100, 1000);
		camera.updateProjectionMatrix();
		controls.target.copy(center);
		controls.update();
	}

	function pointerDown(event: PointerEvent) {
		pointerStart = new THREE.Vector2(event.clientX, event.clientY);
	}

	function selectElement(event: PointerEvent) {
		if (!renderer || !camera || !model || !pointerStart) return;
		if (pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5) return;
		const rect = renderer.domElement.getBoundingClientRect();
		const pointer = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(pointer, camera);
		const hit = raycaster.intersectObject(model, true)[0]?.object;
		if (!hit) return;

		selectionOutline?.removeFromParent();
		selectionOutline?.geometry.dispose();
		selectionOutline?.material.dispose();
		selectionOutline = new THREE.BoxHelper(hit, 0x2563eb);
		scene?.add(selectionOutline);

		const expressId =
			typeof hit.userData.expressId === 'number' ? hit.userData.expressId : undefined;
		const data =
			expressId !== undefined && ifcModel
				? Object.entries(ifcModel.properties(expressId))
				: Object.entries(hit.userData || {}).filter(([, value]) =>
						['string', 'number', 'boolean'].includes(typeof value)
					);
		selectedName = hit.name || hit.parent?.name || 'Unnamed element';
		selectedDetails = data.length
			? data
					.slice(0, 8)
					.map(([key, value]) => `${key}: ${String(value)}`)
					.join(' · ')
			: `Type: ${hit.type}`;
	}

	function setupScene() {
		if (!canvasHost) throw new Error('The 3D viewer container is unavailable.');
		const host = canvasHost;
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf1f5f9);
		camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		host.appendChild(renderer.domElement);
		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.screenSpacePanning = true;
		scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2.6));
		const sun = new THREE.DirectionalLight(0xffffff, 2.4);
		sun.position.set(20, 30, 10);
		scene.add(sun, new THREE.GridHelper(1000, 100, 0x94a3b8, 0xcbd5e1));

		const resize = () => {
			if (!renderer || !camera) return;
			const { clientWidth, clientHeight } = host;
			renderer.setSize(clientWidth, clientHeight, false);
			camera.aspect = clientWidth / Math.max(clientHeight, 1);
			camera.updateProjectionMatrix();
		};
		resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(host);
		resize();
		const animate = () => {
			animationFrame = requestAnimationFrame(animate);
			controls?.update();
			if (renderer && scene && camera) renderer.render(scene, camera);
		};
		animate();
	}

	async function prepare() {
		try {
			if (type === 'svg') {
				iframeUrl = sourceUrl(source);
				loading = false;
				onload?.();
				return;
			}

			setupScene();
			if (type === 'ifc') {
				message = 'Reading IFC geometry locally...';
				const { loadIfcModel } = await import('../utils/ifc-loader');
				ifcModel = await loadIfcModel(source);
				const loadedModel = ifcModel.group;
				model = loadedModel;
				scene?.add(loadedModel);
			} else {
				message = 'Loading 3D model...';
				const loadedModel = await new GLTFLoader()
					.loadAsync(sourceUrl(source))
					.then((result) => result.scene);
				model = loadedModel;
				scene?.add(loadedModel);
			}
			fitModel();
			loading = false;
			onload?.();
		} catch (cause) {
			loading = false;
			loadError =
				type === 'ifc'
					? 'This IFC file could not be decoded in the browser.'
					: 'The BIM model could not be loaded.';
			onerror?.({ code: 'LOAD_FAILED', message: loadError, cause });
		}
	}

	function disposeModel() {
		if (ifcModel) {
			ifcModel.dispose();
			return;
		}
		model?.traverse((object) => {
			if (!(object instanceof THREE.Mesh)) return;
			object.geometry.dispose();
			const materials = Array.isArray(object.material) ? object.material : [object.material];
			for (const material of materials) material.dispose();
		});
	}

	onMount(() => {
		prepare();
		return () => {
			cancelAnimationFrame(animationFrame);
			resizeObserver?.disconnect();
			controls?.dispose();
			disposeModel();
			selectionOutline?.geometry.dispose();
			selectionOutline?.material.dispose();
			renderer?.dispose();
			if (ownedUrl) URL.revokeObjectURL(ownedUrl);
		};
	});

	$effect(() => {
		if (!renderer) return;
		const canvas = renderer.domElement;
		canvas.addEventListener('pointerdown', pointerDown);
		canvas.addEventListener('pointerup', selectElement);
		return () => {
			canvas.removeEventListener('pointerdown', pointerDown);
			canvas.removeEventListener('pointerup', selectElement);
		};
	});
</script>

<div
	class={`relative min-h-80 overflow-hidden bg-slate-100 ${heightClass} ${className}`}
	aria-label={title}
>
	{#if type === 'svg'}
		<iframe
			src={iframeUrl}
			{title}
			class="size-full border-0 bg-white"
			onerror={(cause) =>
				onerror?.({ code: 'LOAD_FAILED', message: 'The SVG drawing could not be loaded.', cause })}
		></iframe>
	{:else}
		<div
			bind:this={canvasHost}
			class="size-full"
			role="application"
			aria-label={`${title} interactive 3D viewer`}
		></div>
	{/if}

	{#if renderer && !loading && !loadError}
		<div class="absolute left-3 top-3">
			<button
				type="button"
				onclick={fitModel}
				class="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
				>Fit model</button
			>
		</div>
		<div
			class="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 font-sans shadow-lg backdrop-blur sm:right-auto sm:max-w-lg"
		>
			<p class="text-xs font-semibold text-slate-900">{selectedName}</p>
			<p class="mt-1 text-xs leading-5 text-slate-500">{selectedDetails}</p>
		</div>
	{/if}

	{#if loading}
		<div class="absolute inset-0 grid place-content-center bg-slate-100/90 text-center font-sans">
			<div
				class="mx-auto size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
			></div>
			<p class="mt-3 text-sm font-medium text-slate-600">{message}</p>
		</div>
	{:else if loadError}
		<div class="absolute inset-0 grid place-content-center p-8 text-center font-sans">
			<div
				class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"
			>
				<svg
					class="block size-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"><path d="M12 8v5m0 3.5v.1M4.5 19.5h15L12 4z" /></svg
				>
			</div>
			<h3 class="mt-4 font-semibold text-slate-900">Unable to open model</h3>
			<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{loadError}</p>
		</div>
	{/if}
</div>

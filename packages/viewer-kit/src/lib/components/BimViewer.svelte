<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import type {
		BaseViewerProps,
		BimConverter,
		BimFileType,
		BimViewable,
		ViewerSource
	} from '../types';

	interface Props extends BaseViewerProps {
		source: ViewerSource;
		type: BimFileType;
		bimConverter?: BimConverter;
	}

	let {
		source,
		type,
		bimConverter,
		title = 'BIM model',
		heightClass = 'h-[70vh]',
		class: className = '',
		onload,
		onerror
	}: Props = $props();
	let canvasHost = $state<HTMLDivElement>();
	let viewable = $state<BimViewable>();
	let loading = $state(true);
	let message = $state('Preparing model…');
	let selectedName = $state('Nothing selected');
	let selectedDetails = $state('Click an element in the model to inspect it.');
	let iframeUrl = $state('');
	let renderer = $state<THREE.WebGLRenderer>();
	let scene: THREE.Scene | undefined;
	let camera: THREE.PerspectiveCamera | undefined;
	let controls: OrbitControls | undefined;
	let model: THREE.Object3D | undefined;
	let animationFrame = 0;
	let resizeObserver: ResizeObserver | undefined;
	let ownedUrl: string | undefined;
	const convertible = new Set<BimFileType>(['dwg', 'dxf', 'ifc', 'rvt', 'nwd', 'nwc']);

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
		const distance =
			Math.max(size.x, size.y, size.z) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		camera.position
			.copy(center)
			.add(new THREE.Vector3(1, 0.8, 1).normalize().multiplyScalar(distance * 0.75));
		camera.near = Math.max(distance / 10000, 0.01);
		camera.far = Math.max(distance * 100, 1000);
		camera.updateProjectionMatrix();
		controls.target.copy(center);
		controls.update();
	}

	function resetView() {
		fitModel();
	}

	function selectElement(event: PointerEvent) {
		if (!renderer || !camera || !model) return;
		const rect = renderer.domElement.getBoundingClientRect();
		const pointer = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(pointer, camera);
		const hit = raycaster.intersectObject(model, true)[0]?.object;
		if (!hit) return;
		selectedName = hit.name || hit.parent?.name || 'Unnamed element';
		const data = Object.entries(hit.userData || {})
			.filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
			.slice(0, 6);
		selectedDetails = data.length
			? data.map(([key, value]) => `${key}: ${String(value)}`).join(' · ')
			: `Type: ${hit.type}`;
	}

	async function prepare() {
		try {
			if (convertible.has(type)) {
				if (!bimConverter) {
					loading = false;
					message = `${type.toUpperCase()} requires conversion before browsers can display it.`;
					return;
				}
				message = `Converting ${type.toUpperCase()}…`;
				viewable = await bimConverter(source, type as Exclude<BimFileType, 'gltf' | 'glb' | 'svg'>);
			} else {
				viewable = { source, type: type as 'gltf' | 'glb' | 'svg' };
			}
			iframeUrl = sourceUrl(viewable.source);
			if (viewable.type === 'svg' || viewable.type === 'iframe') {
				loading = false;
				onload?.();
				return;
			}
			await loadThreeModel(iframeUrl);
		} catch (cause) {
			loading = false;
			message = 'The BIM model could not be prepared.';
			onerror?.({ code: 'LOAD_FAILED', message, cause });
		}
	}

	async function loadThreeModel(url: string) {
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
		controls.saveState();
		scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2.6));
		const sun = new THREE.DirectionalLight(0xffffff, 2.4);
		sun.position.set(20, 30, 10);
		scene.add(sun, new THREE.GridHelper(1000, 100, 0x94a3b8, 0xcbd5e1));
		const loadedModel = await new GLTFLoader().loadAsync(url).then((result) => result.scene);
		model = loadedModel;
		scene.add(loadedModel);
		fitModel();
		loading = false;
		onload?.();
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

	onMount(() => {
		prepare();
		return () => {
			cancelAnimationFrame(animationFrame);
			resizeObserver?.disconnect();
			controls?.dispose();
			renderer?.dispose();
			renderer?.domElement.removeEventListener('pointerup', selectElement);
			if (ownedUrl) URL.revokeObjectURL(ownedUrl);
		};
	});

	$effect(() => {
		if (!renderer) return;
		renderer.domElement.addEventListener('pointerup', selectElement);
		return () => renderer?.domElement.removeEventListener('pointerup', selectElement);
	});
</script>

<div
	class={`relative min-h-80 overflow-hidden bg-slate-100 ${heightClass} ${className}`}
	aria-label={title}
>
	{#if viewable?.type === 'svg' || viewable?.type === 'iframe'}
		<iframe
			src={iframeUrl}
			{title}
			class="size-full border-0 bg-white"
			onerror={(cause) =>
				onerror?.({
					code: 'LOAD_FAILED',
					message: 'The converted drawing could not be loaded.',
					cause
				})}
		></iframe>
	{:else}
		<div
			bind:this={canvasHost}
			class="size-full"
			role="application"
			aria-label={`${title} interactive 3D viewer`}
		></div>
	{/if}

	{#if renderer && !loading}
		<div class="absolute left-3 top-3 flex gap-2">
			<button
				type="button"
				onclick={fitModel}
				class="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
				>Fit model</button
			>
			<button
				type="button"
				onclick={resetView}
				class="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
				>Reset view</button
			>
		</div>
		<div
			class="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:right-auto sm:max-w-md"
		>
			<p class="text-xs font-semibold text-slate-900">{selectedName}</p>
			<p class="mt-1 text-xs leading-5 text-slate-500">{selectedDetails}</p>
		</div>
	{/if}

	{#if loading}
		<div class="absolute inset-0 grid place-content-center bg-slate-100/90 text-center">
			<div
				class="mx-auto size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
			></div>
			<p class="mt-3 text-sm font-medium text-slate-600">{message}</p>
		</div>
	{:else if !viewable}
		<div class="absolute inset-0 grid place-content-center p-8 text-center">
			<div class="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
				CAD
			</div>
			<h3 class="mt-4 font-semibold text-slate-900">Conversion service required</h3>
			<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
				{message} Connect the <code class="rounded bg-slate-200 px-1.5 py-0.5">bimConverter</code> adapter
				to Autodesk APS or your internal conversion server.
			</p>
		</div>
	{/if}
</div>

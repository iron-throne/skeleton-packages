<script lang="ts">
	import { loaderStore } from '@aryagg/ui-kit';
	import { createConnectedAppBus } from './bus';
	import { loadConnectedApp } from './loader';
	import { CONNECTED_APP_EVENTS } from './types';
	import type {
		ConnectedAppContext,
		ConnectedAppHostInfo,
		ConnectedAppInstance,
		ConnectedAppManifest,
		ConnectedAppRenderMode,
		ConnectedAppUser,
	} from './types';

	let {
		manifest,
		mode,
		params = {},
		hostInfo,
		user,
		theme,
		locale,
		navigate,
		onClose,
	}: {
		manifest: ConnectedAppManifest;
		mode: ConnectedAppRenderMode;
		params?: Record<string, string>;
		/** Identifies this host to the connected app (shown/logged, not sensitive). */
		hostInfo: ConnectedAppHostInfo;
		/** Caller-supplied — this package never assumes any particular auth store shape. */
		user: ConnectedAppUser | null;
		theme: 'light' | 'dark';
		locale: string;
		/** Caller-supplied navigation (e.g. `(path) => goto(path)`) — never SvelteKit's router directly. */
		navigate: (path: string) => void;
		onClose?: () => void;
	} = $props();

	let target = $state<HTMLDivElement>();
	let error = $state<string | null>(null);

	function buildContext(): ConnectedAppContext {
		return {
			version: 1,
			host: hostInfo,
			user,
			theme,
			locale,
			mode,
			params,
			navigate,
			bus: createConnectedAppBus(),
			...(mode === 'modal' && onClose ? { close: onClose } : {}),
		};
	}

	$effect(() => {
		if (!target) return;

		let cancelled = false;
		let instance: ConnectedAppInstance | null = null;
		const context = buildContext();
		error = null;
		loaderStore.show();

		loadConnectedApp(manifest.entryUrl)
			.then((mod) => mod.mount(target!, context))
			.then((mounted) => {
				if (cancelled) {
					mounted.destroy();
					return;
				}
				instance = mounted;
			})
			.catch((err) => {
				console.error(`[connected-apps] failed to load "${manifest.id}"`, err);
				error = 'This connected app failed to load.';
			})
			.finally(() => loaderStore.hide());

		const unsubClose = context.bus.on(CONNECTED_APP_EVENTS.CLOSE, () => onClose?.());
		const unsubNavigate = context.bus.on(CONNECTED_APP_EVENTS.NAVIGATE, (path) => {
			navigate(String(path));
		});
		const unsubTitle = context.bus.on(CONNECTED_APP_EVENTS.TITLE, (title) => {
			document.title = String(title);
		});

		return () => {
			cancelled = true;
			unsubClose();
			unsubNavigate();
			unsubTitle();
			instance?.destroy();
		};
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if error}
		<div class="text-error flex flex-1 items-center justify-center p-6 text-sm">{error}</div>
	{/if}
	<div bind:this={target} class="min-h-0 flex-1"></div>
</div>

import type { ConnectedAppManifest } from './types';

export interface ActiveConnectedApp {
	manifest: ConnectedAppManifest;
	params: Record<string, string>;
}

export interface ConnectedAppStore {
	readonly current: ActiveConnectedApp | null;
	open(id: string, params?: Record<string, string>): void;
	close(): void;
}

/**
 * Creates a host's modal-launcher store. Each host supplies its own manifest
 * lookup (its own registry.ts) — this just owns the "which one is open" state,
 * following the same getter-object singleton pattern as the rest of this workspace
 * (see e.g. entities/auth/store.svelte.ts in either consuming app).
 */
export function createConnectedAppStore(
	getManifest: (id: string) => ConnectedAppManifest | undefined,
): ConnectedAppStore {
	let _active = $state<ActiveConnectedApp | null>(null);

	function open(id: string, params: Record<string, string> = {}) {
		const manifest = getManifest(id);
		if (!manifest) {
			console.error(`[connected-apps] Unknown app id "${id}"`);
			return;
		}
		if (!manifest.modes.includes('modal')) {
			console.error(`[connected-apps] "${id}" does not support modal mode`);
			return;
		}
		_active = { manifest, params };
	}

	function close() {
		_active = null;
	}

	return {
		get current() {
			return _active;
		},
		open,
		close,
	};
}

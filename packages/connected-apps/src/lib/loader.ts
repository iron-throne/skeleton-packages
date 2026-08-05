import type { ConnectedAppModule } from './types';

const moduleCache = new Map<string, Promise<ConnectedAppModule>>();

/**
 * Loads a connected app's remote ESM entry by URL, at runtime — never a build-time
 * `import()` target, so bundlers can't (and shouldn't) try to statically resolve it.
 * Results are cached per URL so re-opening the same connected app doesn't re-fetch it.
 */
export function loadConnectedApp(entryUrl: string): Promise<ConnectedAppModule> {
	let pending = moduleCache.get(entryUrl);
	if (!pending) {
		pending = import(/* @vite-ignore */ entryUrl) as Promise<ConnectedAppModule>;
		pending.catch(() => moduleCache.delete(entryUrl));
		moduleCache.set(entryUrl, pending);
	}
	return pending;
}

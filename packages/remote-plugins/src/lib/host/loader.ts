import type { IRemotePluginModule } from "../types";

export const loadRemoteManifestFile = async (url: string) => {
    return await import(/* @vite-ignore */ url);
}

export const loadRemotePlugin = async (url: string): Promise<IRemotePluginModule> => {
    const module = await loadRemoteManifestFile(url);
    // Accept both `export const mount = ...` (named) and
    // `export default defineRemotePlugin(...)` (default) — plugin authors
    // reach for both instinctively, and getting this wrong just to satisfy
    // the host's loader is not a useful failure mode.
    const resolved: IRemotePluginModule | undefined =
        typeof module.mount === 'function' ? module : module.default;
    if (!resolved || typeof resolved.mount !== 'function') {
        throw new Error('Remote plugin must export mount(), either directly or as its default export');
    }
    return resolved;
};

const moduleCache = new Map<string, Promise<IRemotePluginModule>>();

export const loadRemotePluginCached = (url: string): Promise<IRemotePluginModule> => {
    let pending = moduleCache.get(url);
    if (!pending) {
        pending = loadRemotePlugin(url);
        // If a load fails, remove it from the cache so a later attempt can retry.
        pending.catch(() => moduleCache.delete(url));
        moduleCache.set(url, pending);
    }
    return pending;
}
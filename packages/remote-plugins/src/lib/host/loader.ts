import type { IRemotePluginModule } from "../types";

export const loadRemotePlugin = async (url: string): Promise<IRemotePluginModule> => {
    const module = await import(/* @vite-ignore */ url);
    if (typeof module.mount !== 'function') {
        throw new Error('Remote plugin must export mount()');
    }
    return module;
};

const moduleCache = new Map<string, Promise<IRemotePluginModule>>();

export const loadRemotePluginCached = (url: string): Promise<IRemotePluginModule> => {
    let pending = moduleCache.get(url);
    if (!pending) {
        pending = loadRemotePlugin(url);
        pending.catch(() => moduleCache.delete(url));
        moduleCache.set(url, pending);
    }
    return pending;
}
// This should coordinate loading and mounting, without Svelte UI concerns.

import type { IMountedRemotePlugin, IRemotePluginContext, IRemotePluginManifest } from "../types";
import { loadRemotePlugin } from "./loader";


export const mountRemotePlugin = async (
    manifest: IRemotePluginManifest,
    target: HTMLElement,
    context: IRemotePluginContext
): Promise<IMountedRemotePlugin> => {
    // 1. Validate the manifest before we touch the network at all — fail
    // fast with a message that names the plugin, instead of a generic
    if (!manifest.entryUrl) {
        throw new Error(`Remote plugin "${manifest.name}" has no entryUrl`);
    }

    // 2. Load (and cache) the remote plugin's JS module.
    const remoteModule = await loadRemotePlugin(manifest.entryUrl);

    // 3. Call the remote plugin's mount() and validate what it hands back —
    // a misbehaving remote should not be able to crash the host with a
    // confusing error somewhere else later.
    let instance;
    try {
        instance = await remoteModule.mount(target, context);
    } catch (error) {
        throw new Error(`Remote plugin "${manifest.name}" threw while mounting: ${(error as Error)?.message ?? error}`);
    }
    if (!instance || typeof instance.destroy !== 'function') {
        throw new Error(`Remote plugin "${manifest.name}" mount() did not return an instance with destroy()`);
    }

    // 4. Ensure destroy() is only called once, and that the bus (shared,
    // mutable state) is released as part of teardown.
    let destroyed = false;

    return {
        update(nextContext: IRemotePluginContext) {
            if (destroyed) return;
            instance.update?.(nextContext);
        },
        async destroy() {
            if (destroyed) return;
            destroyed = true;
            await instance.destroy();
            context.bus.clear();
        }
    };
};

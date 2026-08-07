// This is what a remote plugin author imports — it exists purely for type
// safety and editor autocomplete on `target`/`context`. It compiles away to
// `{ mount: setup }`; nothing here talks to the network or the host.

import type { IRemotePluginContext, IMountedRemotePlugin, IRemotePluginModule } from "../types";

export type RemotePluginSetup = (
    target: HTMLElement,
    context: IRemotePluginContext
) => IMountedRemotePlugin | Promise<IMountedRemotePlugin>;

/**
 * Wrap your plugin's mount logic so the module you export is guaranteed to
 * match what the host's `mountRemotePlugin()` expects.
 *
 * @example
 * export default defineRemotePlugin((target, context) => {
 *   const el = document.createElement('div');
 *   el.textContent = `Hello ${context.user?.name ?? 'guest'}`;
 *   target.appendChild(el);
 *
 *   return {
 *     update(nextContext) { el.textContent = `Hello ${nextContext.user?.name ?? 'guest'}`; },
 *     destroy() { target.removeChild(el); }
 *   };
 * });
 */
export const defineRemotePlugin = (setup: RemotePluginSetup): IRemotePluginModule => ({
    mount: setup
});

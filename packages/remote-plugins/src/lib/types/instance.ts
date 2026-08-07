import type { IRemotePluginContext } from "./context";

/**
 * Handle returned to the host app after a plugin has been mounted.
 * The host uses this instead of talking to the raw plugin instance —
 * it adds the "only destroy once" safety net.
 */
export interface IMountedRemotePlugin {
    /** Push a new context (theme/locale/user/etc. changed) into the running plugin. No-ops after destroy(). */
    update(context: IRemotePluginContext): void;
    /** Tear down the plugin and clear its event bus. Safe to call more than once. */
    destroy(): Promise<void>;
}

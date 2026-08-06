import type { IRemotePluginContext } from "./context";

// This represents one running copy of a plugin:A single plugin module could potentially create several instances. For example, the same plugin might appear as both a page and a widget.
export interface IRemotePluginInstance {
    update?(context: IRemotePluginContext): void;
    destroy(): void | Promise<void>;
}

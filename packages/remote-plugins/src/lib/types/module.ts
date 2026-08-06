// This is what the downloaded JavaScript must export:

import type { IRemotePluginContext } from "./context";
import type { IRemotePluginInstance } from "./instance";

export interface IRemotePluginModule {
	mount(
		target: HTMLElement,
		context: IRemotePluginContext
	): IRemotePluginInstance | Promise<IRemotePluginInstance>;
}
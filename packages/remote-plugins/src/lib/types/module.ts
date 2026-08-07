// This is what the downloaded JavaScript must export:

import type { IRemotePluginContext } from "./context";
import type { IMountedRemotePlugin } from "./instance";

export interface IRemotePluginModule {
	mount(
		target: HTMLElement,
		context: IRemotePluginContext
	): IMountedRemotePlugin | Promise<IMountedRemotePlugin>;
}

// A remote plugin, at the end of the day, is any JavaScript file that exports a mount() function matching that shape. It could be built in React, Vue, vanilla JS — the host doesn't care.
// The context is the host-controlled API passed to a running plugin:

import type { ETheme } from "@aryagg/types";
import type { RemotePluginMode } from "./manifest";
import type { IRemotePluginBus } from "./events";


export interface IHostInfo {
	id: string;
	name: string;
}
export interface IRemotePluginUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

//Purpose: the remote should communicate through this object instead of reaching into the host’s internal stores and router.
export interface IRemotePluginContext {
	apiVersion: 1;
	host: IHostInfo;
	user: IRemotePluginUser | null;
	theme: ETheme;
	locale: string;
	mode: RemotePluginMode;
	/** Route params / launch params (e.g. `{ courseId: '...' }` from `/apps/[appId]/[...rest]`). */

	params: Record<string, string>;
	/** Host-owned navigation — a remote app must never touch the host's router directly. */

	navigate(path: string): void;
	/** Present only when `mode === 'modal'`. */

	close?(): void;
	bus: IRemotePluginBus;
}
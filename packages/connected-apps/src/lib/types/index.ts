/**
 * Connected Apps contract — the interface between a host app and a connected
 * app loaded at runtime as a remote ESM module (no npm install / rebuild step
 * for the connected app itself; only this framework is a shared package).
 */

export type ConnectedAppRenderMode = 'page' | 'modal';

export interface ConnectedAppHostInfo {
	id: string;
	name: string;
}

export interface ConnectedAppUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

/** Bidirectional pub/sub shared between host and remote for the lifetime of one mount. */
export interface ConnectedAppBus {
	emit(event: string, payload?: unknown): void;
	/** Returns an unsubscribe function. */
	on(event: string, handler: (payload: unknown) => void): () => void;
}

/** Everything the host hands down to a connected app on mount, and on every `update()`. */
export interface ConnectedAppContext {
	version: 1;
	host: ConnectedAppHostInfo;
	user: ConnectedAppUser | null;
	theme: 'light' | 'dark';
	locale: string;
	mode: ConnectedAppRenderMode;
	/** Route params / launch params (e.g. `{ courseId: '...' }` from `/apps/[appId]/[...rest]`). */
	params: Record<string, string>;
	/** Host-owned navigation — a remote app must never touch the host's router directly. */
	navigate(path: string): void;
	/** Present only when `mode === 'modal'`. */
	close?(): void;
	bus: ConnectedAppBus;
}

/** What a mounted connected app hands back to the host. */
export interface ConnectedAppInstance {
	/** Host pushes a fresh context (theme/user/route change) without a full remount. */
	update?(context: ConnectedAppContext): void;
	/** Host calls this on unmount/close — the remote must release everything here. */
	destroy(): void;
}

/** The shape every remote ESM entry module must export. */
export interface ConnectedAppModule {
	mount(
		target: HTMLElement,
		context: ConnectedAppContext,
	): ConnectedAppInstance | Promise<ConnectedAppInstance>;
}

/** Host-side registration describing where to fetch a connected app and how it may be launched. */
export interface ConnectedAppManifest {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	entryUrl: string;
	modes: ConnectedAppRenderMode[];
}

/** Standard event names both sides always understand, regardless of the specific app. */
export const CONNECTED_APP_EVENTS = {
	READY: 'ready',
	NAVIGATE: 'navigate',
	CLOSE: 'close',
	TITLE: 'title',
	ERROR: 'error',
} as const;

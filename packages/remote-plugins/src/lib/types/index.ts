/**
 * Connected Apps contract — the interface between a host app and a connected
 * app loaded at runtime as a remote ESM module (no npm install / rebuild step
 * for the connected app itself; only this framework is a shared package).
 */

import type { ETheme } from "@aryagg/types";

export enum ERemoteAppMode {
    PAGE = 'page', // Remote app renders a full page inside the host.
    MODAL = 'modal', // Remote app renders a popup dialog or modal.
    WIDGET = 'widget', // Remote app renders a small UI widget inside a slot.
    PANEL = 'panel', // Remote app renders a left/right side panel.
    COMMAND = 'command', // Remote app exposes a command/action with no UI.
    SERVICE = 'service', // Remote app provides logic only; host calls its methods.
    OVERLAY = 'overlay', // Remote app renders a floating overlay on top of host UI.
    TAB = 'tab', // Remote app becomes a tab inside an existing host page.
    SECTION = 'section', // Remote app injects a section into an existing page.
    EMBED = 'embed', // Remote app is embedded inside a specific host component.
    MICRO_APP = 'micro_app', // Remote app is a full micro‑frontend with its own routing.
}



/** Standard event names both sides always understand, regardless of the specific app. */
export enum ERemoteAppEvent {
    READY = 'ready', // Remote app finished loading and is ready.
    NAVIGATE = 'navigate', // Remote app requests host navigation.
    CLOSE = 'close', // Remote app asks host to close its UI.
    TITLE = 'title', // Remote app updates its displayed title.
    ERROR = 'error', // Remote app reports an error to the host.

    REQUEST_HOST_DATA = 'request_host_data', // Remote app asks host for data.
    HOST_DATA = 'host_data', // Host sends requested data to remote app.

    CALL_HOST = 'call_host', // Remote app calls a host command or API.
    HOST_RESULT = 'host_result', // Host returns result of a command call.

    CUSTOM_EVENT = 'custom_event', // Remote app emits a custom event.
    HOST_EVENT = 'host_event', // Host sends a custom event to remote app.

    RESIZE = 'resize', // Remote app requests container resize.
    FOCUS = 'focus', // Remote app requests focus for its UI.

    PERMISSION_REQUEST = 'permission_request', // Remote app asks for permission.
    PERMISSION_RESPONSE = 'permission_response', // Host responds to permission request.

    OPEN_REMOTE_APP = 'open_remote_app', // Remote app asks host to open another remote app.
    RELOAD = 'reload', // Remote app requests host to reload it.

    SAVE_STATE = 'save_state', // Remote app asks host to persist some state.
    STATE = 'state', // Host sends previously saved state back to remote app.
}


export interface IHostInfo {
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
export interface IRemoteAppBus {
    emit(event: string, payload?: unknown): void;
    /** Returns an unsubscribe function. */
    on(event: string, handler: (payload: unknown) => void): () => void;
}
/** Everything the host hands down to a connected app on mount, and on every `update()`. */
export interface IRemoteAppContext {
    version: 1;
    host: IHostInfo;
    user: ConnectedAppUser | null;
    theme: ETheme;
    locale: string;
    mode: ERemoteAppMode;
    /** Route params / launch params (e.g. `{ courseId: '...' }` from `/apps/[appId]/[...rest]`). */
    params: Record<string, string>;
    /** Host-owned navigation — a remote app must never touch the host's router directly. */
    navigate(path: string): void;
    /** Present only when `mode === 'modal'`. */
    close?(): void;
    bus: IRemoteAppBus;
}


/** What a mounted connected app hands back to the host. */
export interface IRemoteAppInstance {
    /** Host pushes a fresh context (theme/user/route change) without a full remount. */
    update?(context: IRemoteAppContext): void;
    /** Host calls this on unmount/close — the remote must release everything here. */
    destroy(): void;
}

/** The shape every remote ESM entry module must export. */
export interface IRemoteAppModule {
    mount(
        target: HTMLElement,
        context: IRemoteAppContext,
    ): IRemoteAppInstance | Promise<IRemoteAppInstance>;
}

/** Host-side registration describing where to fetch a connected app and how it may be launched. */
export interface IRemoteAppManifest {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    entryUrl: string;
    modes: ERemoteAppMode[];
}
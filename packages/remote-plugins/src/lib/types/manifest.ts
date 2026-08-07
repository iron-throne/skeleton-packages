//The manifest describes a plugin before it is loaded:
export interface IRemotePluginManifest {
	id: string;
	name: string;
	version: string;
	entryUrl: string;
	modes: RemotePluginMode[];
	permissions?: IRemotePluginPermission[];
}

/**
 * Capabilities a plugin declares it needs. This is metadata only — the host
 * decides what to do with it (e.g. show a consent screen, or reject the
 * plugin outright). `mountRemotePlugin()` does not enforce these; wire that
 * up in the host app once you know what each permission should gate.
 */
export enum IRemotePluginPermission {
    NAVIGATE = 'navigate', // Plugin wants to call context.navigate().
    HOST_DATA = 'host_data', // Plugin wants to read host data via the bus.
    NOTIFICATIONS = 'notifications', // Plugin wants to show host-level notifications.
    STORAGE = 'storage', // Plugin wants a persisted key/value slot via SAVE_STATE/STATE.
    CLIPBOARD = 'clipboard', // Plugin wants clipboard read/write access.
}

export enum RemotePluginMode {
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
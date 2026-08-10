//The manifest describes a plugin before it is loaded:
export interface IRemotePluginManifest {
	id: string;
	name: string;
	version: string;
	entryUrl: string;
    styleUrl?:string
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
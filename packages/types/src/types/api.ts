export interface IApiResult<T = unknown> {
    status: boolean;
    message: string;
    result?: T;
}

export interface IApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T | null;
}

export interface IAPIQueuePayload {
    url: string;
    method: EHttpMethod;
    data?: unknown;
    headers?: Record<string, string>;
    isFormData?: boolean;
}

export enum EHttpStatus {
    // 2xx — Success
    OK = 200,                         // Request succeeded
    CREATED = 201,                    // Resource successfully created
    ACCEPTED = 202,                   // Request accepted for processing
    NO_CONTENT = 204,                 // Succeeded, nothing to return

    // 3xx — Redirection
    MOVED_PERMANENTLY = 301,          // Resource has a new permanent URL
    FOUND = 302,                      // Temporary redirect
    SEE_OTHER = 303,                  // Redirect using GET (after POST)
    NOT_MODIFIED = 304,               // Cached version is still valid
    TEMPORARY_REDIRECT = 307,         // Temporary redirect, method preserved
    PERMANENT_REDIRECT = 308,         // Permanent redirect, method preserved

    // 4xx — Client errors
    BAD_REQUEST = 400,                // Client sent invalid data
    UNAUTHORIZED = 401,               // Authentication required
    FORBIDDEN = 403,                  // Authenticated but not allowed
    NOT_FOUND = 404,                  // Resource not found
    METHOD_NOT_ALLOWED = 405,         // HTTP method not supported on this route
    NOT_ACCEPTABLE = 406,             // Can't produce a response matching Accept header
    CONFLICT = 409,                   // Request conflicts with current state
    GONE = 410,                       // Resource permanently removed
    UNPROCESSABLE_ENTITY = 422,       // Semantically invalid request body
    TOO_MANY_REQUESTS = 429,          // Rate limit exceeded

    // 5xx — Server errors
    INTERNAL_SERVER_ERROR = 500,      // Server failed unexpectedly
    NOT_IMPLEMENTED = 501,            // Server doesn't support this functionality
    BAD_GATEWAY = 502,                // Invalid response from upstream server
    SERVICE_UNAVAILABLE = 503,        // Server temporarily unavailable
    GATEWAY_TIMEOUT = 504,            // Upstream server timed out
}


export enum EHttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}
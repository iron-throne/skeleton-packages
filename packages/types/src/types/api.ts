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
    OK = 200,                         // Request succeeded
    CREATED = 201,                    // Resource successfully created

    BAD_REQUEST = 400,                // Client sent invalid data
    UNAUTHORIZED = 401,               // Authentication required
    FORBIDDEN = 403,                  // Authenticated but not allowed
    NOT_FOUND = 404,                  // Resource not found

    SEE_OTHER = 303,                  // Redirect using GET (after POST)
    TOO_MANY_REQUESTS = 429,          // Rate limit exceeded
    SERVICE_UNAVAILABLE = 503,        // Server temporarily unavailable

    INTERNAL_SERVER_ERROR = 500,      // Server failed unexpectedly
}


export enum EHttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}
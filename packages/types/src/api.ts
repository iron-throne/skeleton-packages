
/** Raw response body shape returned by the backend API */
export interface IApiResult<T = unknown> {
    status: boolean;
    message: string;
    result?: T;
}

/** Standardized response envelope returned to all callers */
export interface IApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T | null;
}

/** Serialized request stored in the offline sync queue */
export interface IAPIQueuePayload {
    url: string;
    method: HttpMethod;
    data?: unknown;
    headers?: Record<string, string>;
    isFormData?: boolean; // true when data is FormData — needs special serialization
}

/** HTTP methods allowed in queue payloads */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
};

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
    method: HttpMethod;
    data?: unknown;
    headers?: Record<string, string>;
    isFormData?: boolean;
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

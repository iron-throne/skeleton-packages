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

export enum HttpStatus {
	OK = 200,
	CREATED = 201,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}
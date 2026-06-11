import { IApiResponse, IApiResult } from "./types";
import { isAxiosError } from "axios";

// const { error: showError } = snackStore;
// ─── Core response handler ────────────────────────────────────────────────────
export const handleResponse = async <T>(
  requestFn: Promise<any>,
  errorMsg: string,
  unwrap: (data: IApiResult<T>) => T,
): Promise<IApiResponse<T>> => {
  try {
    const response = await requestFn;

    if (response.status === 200) {
      const responseData: IApiResult<T> =
        response.data?.object__ ?? response.data;

      if (!responseData.status) {
        // showError(responseData.message || errorMsg);
        return {
          isSuccess: false,
          message: responseData.message || errorMsg,
          data: null,
        };
      }

      return {
        isSuccess: true,
        message: responseData.message || "Success",
        data: unwrap(responseData),
      };
    }

    // showError(errorMsg);
    return { isSuccess: false, message: errorMsg, data: null };

  } catch (error: unknown) {
    if (isNetworkError(error)) throw error; // ✅ let callWithQueue handle + queue it
    return normalizeError(error);
  }
}
export const handleApiResponse = <T>(
  requestFn: Promise<any>,
  errorMsg: string,
): Promise<IApiResponse<T>> => {
  return handleResponse<T>(
    requestFn,
    errorMsg,
    (data) => (data.result ?? data) as T,  // unwraps nested result if present
  );
}

export const handlePlainApiResponse = <T>(
  requestFn: Promise<any>,
  errorMsg: string,
): Promise<IApiResponse<T>> => {
  return handleResponse<T>(
    requestFn,
    errorMsg,
    (data) => data as T,                   // returns data as-is
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const normalizeError = (err: unknown): IApiResponse<never> => {
  let message: string;

  if (isAxiosError(err)) {
    message =
      err.response?.data?.message ??
      err.response?.statusText ??
      "Network error. Please check your connection.";
  } else {
    message = "An unexpected error occurred.";
  }

  // showError(message);
  return { isSuccess: false, message, data: null };
}
export const isNetworkError = (err: unknown): boolean => {
  return (
    isAxiosError(err) &&
    (err.code === "ERR_NETWORK" ||
      err.code === "ECONNABORTED" ||
      !err.response)  // no response = no connectivity
  );
}
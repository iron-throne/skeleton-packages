import { EHttpStatus } from "@aryagg/types";

export const errorHint = (status: EHttpStatus, message?: string) => {
    return status === EHttpStatus.NOT_FOUND
        ? "The page you are looking for is not available!"
        : status === EHttpStatus.FORBIDDEN
            ? "You don't have permission to view this resource."
            : status === EHttpStatus.INTERNAL_SERVER_ERROR
                ? "Our servers ran into an issue. Please try again in a moment."
                : message
}

export const errorTitle = (status: EHttpStatus) => {
    return status === EHttpStatus.NOT_FOUND
        ? "LOOKS LIKE YOU'RE LOST"
        : status === EHttpStatus.FORBIDDEN
            ? "ACCESS DENIED"
            : status === EHttpStatus.INTERNAL_SERVER_ERROR
                ? "SOMETHING BROKE"
                : "SOMETHING WENT WRONG"
}
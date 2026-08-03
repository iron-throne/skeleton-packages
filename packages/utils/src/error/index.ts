import { HttpStatus } from "@aryagg/types";

export const errorHint = (status: HttpStatus, message?: string) => {
    return status === HttpStatus.NOT_FOUND
        ? "The page you are looking for is not available!"
        : status === HttpStatus.FORBIDDEN
            ? "You don't have permission to view this resource."
            : status === HttpStatus.INTERNAL_SERVER_ERROR
                ? "Our servers ran into an issue. Please try again in a moment."
                : message
}

export const errorTitle = (status: HttpStatus) => {
    return status === HttpStatus.NOT_FOUND
        ? "LOOKS LIKE YOU'RE LOST"
        : status === HttpStatus.FORBIDDEN
            ? "ACCESS DENIED"
            : status === HttpStatus.INTERNAL_SERVER_ERROR
                ? "SOMETHING BROKE"
                : "SOMETHING WENT WRONG"
}
import { DEBOUNCE_DELAY } from "@aryagg/types";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const debounce = <F extends (...args: any[]) => void>(func: F, delay: number = DEBOUNCE_DELAY): F => {
    return ((...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as F;
};
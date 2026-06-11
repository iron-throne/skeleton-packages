// * Debounce means:
//  *   - Wait for the user to stop triggering the function

import { DEBOUNCE_DELAY } from "@aryagg/types";

//  *   - Only run the function AFTER the delay
export const debounce = <F extends (...args: any[]) => void>(func: F, delay: number = DEBOUNCE_DELAY): F => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return ((...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as F;
};
// * Throttle means:
//  *   - Allow the function to run ONCE
//  *   - Then block it for "limit" milliseconds
export const throttle = <F extends (...args: any[]) => void>(func: F, limit: number): F => {
    let inThrottle = false;
    return ((...args: any[]) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limit);
        }
    }) as F;
};

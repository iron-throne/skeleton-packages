import { isBrowser } from "../browser/browser";

export const setItem = (key: string, value: string): void => {
    if (isBrowser) {
        localStorage.setItem(key, value);
    }
};

export const getItem = (key: string): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
};

export const removeItem = (key: string): void => {
    if (isBrowser) {
        localStorage.removeItem(key);
    }
};

export const hasItem = (key: string): boolean => {
    return localStorage.getItem(key) !== null;
};

export const clearAppStorage = (): void => {
    localStorage.clear();
};

import { EStorageKey } from "@aryagg/types";

export const setItem = (key: EStorageKey, value: string): void => {
    localStorage.setItem(key, value);
};

export const getItem = (key: EStorageKey): string | null => {
    const isBrowser = typeof document !== 'undefined' && typeof window !== 'undefined';
    if (!isBrowser) return null;
    return localStorage.getItem(key);
};

export const removeItem = (key: EStorageKey): void => {
    localStorage.removeItem(key);
};

export const hasItem = (key: EStorageKey): boolean => {
    return localStorage.getItem(key) !== null;
};

export const clearAppStorage = (): void => {
    Object.values(EStorageKey).forEach((key) => localStorage.removeItem(key));
};

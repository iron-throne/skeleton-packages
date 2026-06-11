
export const setItem = (key: string, value: string): void => {
    const isBrowser = typeof document !== 'undefined' && typeof window !== 'undefined';
    if (isBrowser) {
        localStorage.setItem(key, value);
    }
};

export const getItem = (key: string): string | null => {
    const isBrowser = typeof document !== 'undefined' && typeof window !== 'undefined';
    if (!isBrowser) return null;
    return localStorage.getItem(key);
};

export const removeItem = (key: string): void => {
    localStorage.removeItem(key);
};

export const hasItem = (key: string): boolean => {
    return localStorage.getItem(key) !== null;
};

export const clearAppStorage = (): void => {
    localStorage.clear();
};

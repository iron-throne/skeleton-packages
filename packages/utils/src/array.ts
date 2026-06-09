// Returns a new array with duplicate values removed
export const unique = <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
};

// Removes duplicates based on a specific object key
export const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter((item) => {
        const k = item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

// Groups items into an object based on a key
// Example: groupBy(users, "role") → { admin: [...], user: [...] }
export const groupByArr = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce(
        (acc, item) => {
            const group = String(item[key]);
            (acc[group] ??= []).push(item);
            return acc;
        },
        {} as Record<string, T[]>
    );
}

// Splits an array into chunks of a given size
// Example: chunk([1,2,3,4], 2) → [[1,2],[3,4]]
export const chunk = <T>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

// Sorts an array by a specific key (ascending or descending)
export const sortBy = <T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
        const av = a[key], bv = b[key];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return direction === 'asc' ? cmp : -cmp;
    });
}

// Flattens a deeply nested array into a single-level array
export const flattenDeep = <T>(arr: unknown[]): T[] => {
    return arr.flat(Infinity) as T[];
}

// Returns a new object without the specified keys
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach((k) => delete result[k]);
    return result;
}

// Returns a new object containing only the specified keys
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    return keys.reduce(
        (acc, k) => {
            if (k in obj) acc[k] = obj[k];
            return acc;
        },
        {} as Pick<T, K>
    );
}

// Creates a deep clone of any value (objects, arrays, etc.)
export const deepClone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value));
};

// Checks if a value is empty (null, empty string, empty array, empty object)
export const isEmpty = (value: unknown): boolean => {
    if (value == null) return true;
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};


export const removeFalsy = <T>(arr: T[]): Exclude<T, false | 0 | "" | null | undefined>[] => {
    return arr.filter(Boolean) as Exclude<T, false | 0 | "" | null | undefined>[];
}

export const countOccurrences = <T>(arr: T[], val: T): number =>
    arr.reduce((count, item) => (item === val ? count + 1 : count), 0);

export const isEmptyObject = (obj: Record<string, unknown>) => Object.keys(obj).length === 0;

// Deeply merges two objects (nested merge)
export const mergeDeep = <T extends object>(target: T, source: Partial<T>): T => {
    // Start with a shallow copy of the target
    const result = { ...target };

    // Loop through each key in the source object
    for (const key in source) {
        const sv = source[key]; // source value
        const tv = result[key]; // target value

        // If both values are objects (not arrays), merge them recursively
        if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
            result[key] = mergeDeep(tv as object, sv as object) as T[typeof key];
        } else {
            // Otherwise, overwrite the value
            result[key] = sv as T[typeof key];
        }
    }

    return result;
}


export const groupBy = <T>(arr: T[], keys: (keyof T)[]): Record<string, T[]> => {
    return arr.reduce(
        (acc, item) => {
            const group = keys.map((k) => String(item[k])).join('|');
            (acc[group] ??= []).push(item);
            return acc;
        },
        {} as Record<string, T[]>
    );
}

export const invertObj = (obj: Record<string, string>) =>
    Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [v, k])
    );

export const hasKey = <T extends object>(
    obj: T,
    key: PropertyKey
): key is keyof T => key in obj;

export const freeze = <T>(obj: T): Readonly<T> =>
    Object.freeze(obj);

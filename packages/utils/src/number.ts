


// Formats a number in compact form (e.g., 1500 → "1.5K")
export function formatCompact(value: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

// Rounds a number to a fixed number of decimals
export function roundTo(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}



// Returns percentage of value/total, rounded to decimals
export function percentage(value: number, total: number, decimals = 1): number {
    if (total === 0) return 0;
    return roundTo((value / total) * 100, decimals);
}

// Sums values in an array by a specific key
export function sumBy<T>(arr: T[], key: keyof T): number {
    return arr.reduce((acc, item) => acc + Number(item[key] ?? 0), 0);
}

// Returns the average of an array of numbers
export function average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

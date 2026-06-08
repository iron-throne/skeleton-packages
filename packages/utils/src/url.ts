// Gets a query parameter value from a URL (e.g., ?id=10 → "10")
export function getQueryParam(key: string, url = window.location.href): string | null {
    return new URL(url).searchParams.get(key);
}

// Sets or updates a query parameter and returns the new URL
export function setQueryParam(key: string, value: string, url = window.location.href): string {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
}

// Removes a query parameter and returns the updated URL
export function removeQueryParam(key: string, url = window.location.href): string {
    const u = new URL(url);
    u.searchParams.delete(key);
    return u.toString();
}

// Converts a query string into an object
// Example: "?a=1&b=2" → { a: "1", b: "2" }
export function parseQueryString(search: string): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(search).entries());
}

// Builds a query string from an object
// Example: { a: 1, b: true } → "a=1&b=true"
export function buildQueryString(params: Record<string, string | number | boolean>): string {
    return new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
}

// Joins URL path segments cleanly (removes duplicate slashes)
// Example: joinPath("api/", "/users/", "1") → "api/users/1"
export function joinPath(...segments: string[]): string {
    return segments
        .map((s) => s.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
}


// Extracts the domain/hostname from a URL
export function getDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

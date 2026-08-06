export const parseQueryString = (search: string): Record<string, string> =>
    Object.fromEntries(new URLSearchParams(search).entries());

export const buildQueryString = (params: Record<string, string | number | boolean>): string =>
    new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

export const joinPath = (...segments: string[]): string =>
    segments
        .map((s) => s.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');

export const getDomain = (url: string): string => {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
};

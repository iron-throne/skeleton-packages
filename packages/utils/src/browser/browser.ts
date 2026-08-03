export const isBrowser =
    typeof document !== "undefined" && typeof window !== "undefined";
export const getUrl = () => (isBrowser ? window.location.href : "");
export const getOrigin = () => (isBrowser ? window.location.origin : "");
export const getUrlHashRaw = () => (isBrowser ? window.location.hash : "");
export const getUrlHash = () =>
    isBrowser ? window.location.hash.replace(/^#/, "") : "";
export const getQueryParamAsObj = () => {
    if (!isBrowser) return {};
    return Object.fromEntries(new URLSearchParams(window.location.search));
};
export const getQueryParam = (key: string) => {
    if (!isBrowser) return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
};
export const setQueryParam = (key: string, value: string) => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.location.search = params.toString();
};
export const removeQueryParam = (key: string) => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    window.location.search = params.toString();
};
export const replaceQueryParam = (key: string, value: string) => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.location.search = params.toString();
};

export const onHashChange = (callback: () => void) => {
    if (!isBrowser) return;
    window.addEventListener("hashchange", callback);
};
export const removeHashChangeListener = (callback: () => void) => {
    if (!isBrowser) return;
    window.removeEventListener("hashchange", callback);
};
export const scrollToTop = () => {
    if (!isBrowser) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
};
// Scroll to element by ID
export const scrollToId = (id: string) => {
    if (!isBrowser) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
};

export const setHash = (value: string) => {
    if (!isBrowser) return;
    window.location.hash = value.startsWith("#") ? value : `#${value}`;
};

export const replaceHash = (value: string) => {
    if (!isBrowser) return;
    const newUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#${value}`;
    window.history.replaceState(null, "", newUrl);
};

export const debounceScroll = (callback: () => void, delay = 150) => {
    if (!isBrowser) return;
    let timeout: number | undefined;

    window.addEventListener("scroll", () => {
        clearTimeout(timeout);
        timeout = window.setTimeout(callback, delay);
    });
};

export const viewportInfo = () => {
    if (!isBrowser) return { width: 0, height: 0 };
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};

// Detect mobile viewport
export const isMobile = () => {
    if (!isBrowser) return false;
    return window.innerWidth <= 768;
};

import { ETheme } from "./types";

export const setTheme = (theme: ETheme, key: string): void => {
    const themeLink = document.getElementById('theme-style') as HTMLLinkElement | null;
    if (themeLink) themeLink.href = `styles/theme-${theme}.css`;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(key, theme);
};

export const enableDarkTheme = (key: string): void => setTheme(ETheme.DARK, key);
export const enableLightTheme = (key: string): void => setTheme(ETheme.LIGHT, key);

export const getSystemTheme = (): ETheme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? ETheme.DARK : ETheme.LIGHT;

export const watchSystemTheme = (callback: (theme: ETheme) => void): () => void => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches ? ETheme.DARK : ETheme.LIGHT);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
};

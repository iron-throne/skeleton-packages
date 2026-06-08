export function enableDarkTheme() {
    const themeLink = document.getElementById('theme-style') as HTMLLinkElement | null;
    if (themeLink) {
        themeLink.href = 'styles/theme-dark.css';
    }
}

export function enableLightTheme() {
    const themeLink = document.getElementById('theme-style') as HTMLLinkElement | null;
    if (themeLink) {
        themeLink.href = 'styles/theme-light.css';
    }
}
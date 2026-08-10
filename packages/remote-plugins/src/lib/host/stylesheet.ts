// With per-entry CSS code splitting on the plugin build side, each entry's
// stylesheet lives at the same URL as its JS with a .css extension (e.g.
// profile-card-entry.js -> profile-card-entry.css). Link it once per entry
// and reuse it — calling this again for an already-linked manifest is a
// no-op, so hosts can call it unconditionally on every mount.
export const ensurePluginStylesheet = (href?: string): void => {
    if (!href) return;
    // const href = url ? url.replace(/\.js$/, '.css') : 'remote-plugin.css'; // If single file from remote it will be s
    if (document.head.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
};

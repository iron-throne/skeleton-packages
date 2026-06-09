// Tailwind CSS configuration
// Defines design tokens, custom themes, and plugin setup


const config = {
    content: ['./src/**/*.{html,js,svelte,ts,css}'],
    // Dark mode controlled via a `.dark` class (managed by your theme store)
    darkMode: 'class',

    theme: {
        extend: {
            colors: {
                // ── Surface Colors ─────────────────────────────
                surface: {
                    primary: 'var(--surface-primary)',   // main interactive color (buttons, links)
                    secondary: 'var(--surface-secondary)', // supporting brand color (badges, accents)
                    tertiary: 'var(--surface-tertiary)',   // decorative highlights (tags, illustrations)
                    'primary-text': 'var(--on-surface-primary)',
                    'primary-secondary': 'var(--on-surface-secondary)',
                    'primary-tertiary': 'var(--on-surface-tertiary)',

                },

                // ── Semantic Colors ────────────────────────────
                accent: 'var(--semantic-accent)',
                success: 'var(--semantic-success)',   // confirmations, valid states
                warning: 'var(--semantic-warning)',   // alerts, pending states
                error: 'var(--semantic-error)',       // errors, destructive actions
                info: 'var(--semantic-info)',         // tooltips, info banners

                'on-accent': 'var(--on-accent)',
                'on-success': 'var(--on-success)',   // confirmations, valid states
                'on-warning': 'var(--on-warning)',   // alerts, pending states
                'on-error': 'var(--on-error)',       // errors, destructive actions
                'on-info': 'var(--on-info)',

                // ── Text Colors ───────────────────────────────
                primary: 'var(--text-primary)',     // headings, important labels
                secondary: 'var(--text-secondary)', // body text, descriptions
                tertiary: 'var(--text-tertiary)',    // placeholders, captions, disabled text
                
                'border-primary': 'var(--border-primary)',
            }
            
        }
    },

    plugins: [
    ]
};

export default config;

import { interpolate } from './interpolate';
import type { I18nOptions, Locale, TranslationMap, TranslationMessages } from '../types';

export class I18n {
    // The currently active language (e.g., "en", "ar")
    private locale: Locale;

    // Fallback language if a key is missing in the current locale
    private fallbackLocale: Locale;

    // All translation messages grouped by locale
    private messages: TranslationMessages;

    // Optional callback when a translation key is missing
    private missing?: (key: string, locale: Locale) => void;

    constructor(options: I18nOptions) {
        // Set the initial locale
        this.locale = options.locale;

        // Use provided fallback or default to English
        this.fallbackLocale = options.fallbackLocale ?? 'en';

        // Load all translation messages
        this.messages = options.messages;

        // Optional "missing key" handler
        this.missing = options.missing;
    }

    // Return the current active locale
    getLocale(): Locale {
        return this.locale;
    }

    // Change the active locale
    setLocale(locale: Locale): void {
        this.locale = locale;
    }

    /** 
     * Translate a key like "home.title"
     * Optionally replace placeholders using {param}
     */
    t(key: string, params?: Record<string, string | number>): string {
        // Try to find the message in the current locale
        const message = this.resolve(key, this.locale)
            // If not found, try the fallback locale
            ?? this.resolve(key, this.fallbackLocale);

        // If still not found, call missing handler and return the key itself
        if (message === undefined) {
            this.missing?.(key, this.locale);
            return key;
        }

        // If params exist, interpolate {placeholders}
        return params ? interpolate(message, params) : message;
    }

    /** 
     * Add or merge new messages into a locale at runtime
     * Useful for lazy-loading translations
     */
    addMessages(locale: Locale, map: TranslationMap): void {
        this.messages[locale] = { ...this.messages[locale], ...map };
    }

    /** 
     * Return all available locales (e.g., ["en", "ar"])
     */
    getLocales(): Locale[] {
        return Object.keys(this.messages);
    }

    /**
     * Resolve a translation key like "home.title"
     * by walking through nested objects
     */
    private resolve(key: string, locale: Locale): string | undefined {
        const map = this.messages[locale];
        if (!map) return undefined;

        // Split "home.title" into ["home", "title"]
        const parts = key.split('.');

        // Walk through nested objects
        let current: TranslationMap[string] = map;
        for (const part of parts) {
            if (typeof current !== 'object' || current === null) return undefined;
            current = (current as TranslationMap)[part];
        }

        // Only return if it's a string (final translation)
        return typeof current === 'string' ? current : undefined;
    }
}

// Helper function to create an I18n instance
export function createI18n(options: I18nOptions): I18n {
    return new I18n(options);
}

export type Locale = string;

/**
 * Common language codes, provided for convenience and autocomplete when
 * wiring up a language switcher. `Locale` itself stays a plain string so
 * consuming apps can register any locale beyond this list.
 */
export enum ELanguage {
    EN = 'en',        // English
    AR = 'ar',        // Arabic
    ES = 'es',        // Spanish

    FR = 'fr',        // French
    DE = 'de',        // German
    IT = 'it',        // Italian
    PT = 'pt',        // Portuguese
    RU = 'ru',        // Russian
    ZH = 'zh',        // Chinese (Simplified)
    ZH_TW = 'zh-TW',  // Chinese (Traditional)
    HI = 'hi',        // Hindi
    BN = 'bn',        // Bengali
    UR = 'ur',        // Urdu
    TR = 'tr',        // Turkish
    FA = 'fa',        // Persian
    TL = 'tl',        // Filipino/Tagalog
    ID = 'id',        // Indonesian
    JA = 'ja',        // Japanese
    KO = 'ko',        // Korean
}

export type TranslationValue = string | TranslationMap;
export type TranslationMap = { [key: string]: TranslationValue };
export type TranslationMessages = Record<Locale, TranslationMap>;

export interface I18nOptions {
    locale: Locale;
    fallbackLocale?: Locale;
    messages: TranslationMessages;
    /** Called when a key is not found in any locale — use for dev-mode logging */
    missing?: (key: string, locale: Locale) => void;
    /**
     * Locales that read right-to-left. Defaults to DEFAULT_RTL_LOCALES.
     * Pass this to extend/override which locales `isRTL()`/`dir()` treat as RTL.
     */
    rtlLocales?: Locale[];
}

export interface PluralForms {
    one: string;
    other: string;
    zero?: string;
}

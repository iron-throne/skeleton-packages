export type Locale = string;

export type TranslationValue = string | TranslationMap;
export type TranslationMap = { [key: string]: TranslationValue };
export type TranslationMessages = Record<Locale, TranslationMap>;

export interface I18nOptions {
    locale: Locale;
    fallbackLocale?: Locale;
    messages: TranslationMessages;
    /** Called when a key is not found in any locale — use for dev-mode logging */
    missing?: (key: string, locale: Locale) => void;
}

export interface PluralForms {
    one: string;
    other: string;
    zero?: string;
}

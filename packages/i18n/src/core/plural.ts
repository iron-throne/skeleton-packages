import type { PluralForms } from '../types';

/**
 * Returns the correct plural form for a count.
 * Works with any language that has one/other/zero rules (covers most western langs + Arabic).
 * For complex Arabic plurals, pass all needed forms and use count directly.
 *
 * @example
 * plural(1, { one: '{count} item', other: '{count} items' })  // "1 item"
 * plural(0, { one: '{count} item', other: '{count} items', zero: 'No items' })  // "No items"
 */
export function plural(count: number, forms: PluralForms): string {
    let template: string;
    if (count === 0 && forms.zero !== undefined) {
        template = forms.zero;
    } else if (count === 1) {
        template = forms.one;
    } else {
        template = forms.other;
    }
    return template.replace(/\{count\}/g, String(count));
}

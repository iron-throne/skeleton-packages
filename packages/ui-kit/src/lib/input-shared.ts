import { DEBOUNCE_DELAY, EInputType, REGEX, type IFormField, type InputValue } from '@aryagg/types';

export const inputBaseClass = [
    'w-full px-4 py-2 rounded-lg border ',
    'bg-surface-secondary/50 text-content-secondary text-sm',
    'placeholder:text-content-tertiary',
    'disabled:opacity-50 disabled:cursor-not-allowed transition',
    'placeholder:text-xs'
].join(' ');

function checkValidation(field: IFormField, val: InputValue) {
    if (field.type === EInputType.FILE) {
        if (field.required && (val == null || (Array.isArray(val) && val.length === 0))) {
            field.errorMsg = `${field.label} is required`;
        }
        field.errorMsg = '';
        return;
    }
    if (field.rules?.length) {
        const valString = typeof val === 'string' ? val : String(val);
        for (const rule of field.rules) {
            field.errorMsg = valString?.match(rule.regex) ? '' : rule.message;
            if (field.errorMsg) {
                return;
            }
        }
    }
}

export function emitValue(field: IFormField, inputVal: InputValue) {
    const val = typeof inputVal === 'string' ? inputVal.trim() : inputVal;
    checkValidation(field, val);

    if (field.errorMsg) return;
    if (field.type !== EInputType.FILE) {
        field.value = val;
    }
    field.onChange?.(val);
}

export function applyDefaultRules(field: IFormField) {
    field.rules = [
        ...(field.rules ?? []),
        ...(field.required ? [{ regex: REGEX.REQUIRED, message: `${field.label} is required` }] : []),
        ...(field.type === EInputType.EMAIL
            ? [{ regex: REGEX.EMAIL, message: `${field.label} is not a valid email` }]
            : [])
    ];
}

/** Debounced emit, guarded off for FILE fields (their value is committed immediately on change). */
export function createDebouncedEmit(field: IFormField) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (val: InputValue) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            if (field.type !== EInputType.FILE) {
                emitValue(field, val);
            }
        }, DEBOUNCE_DELAY);
    };
}

/** Shared attribute set for native text-like controls (input/textarea/select). */
export function buildAttributes(
    field: IFormField,
    cls: string,
    onInputDebounced: (val: InputValue) => void
) {
    return {
        value: field.value as string | number | null | undefined,
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        readonly: field.readOnly,
        multiple: field.multiple,
        class: cls,
        oninput: (e: Event) =>
            onInputDebounced((e.target as HTMLInputElement | HTMLTextAreaElement).value),
        onblur: field.onBlur,
        onfocus: field.onFocus,
        onkeydown: field.onKeydown,
        ...(field.errorMsg && { 'data-state': 'error' }),
        ...field.attributes
    };
}

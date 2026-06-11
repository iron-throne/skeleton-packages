import { IFormField, EInputType, EDataType } from "@aryagg/types";

export const isRequiredFilled = (field: IFormField): boolean => {
    if (!field.required) return true;
    const value = field.value;

    switch (field.type) {
        case EInputType.FILE:
        case EInputType.IMAGE:
            if (field.multiple) return Array.isArray(value) && value.length > 0;
            return value instanceof File;

        case EInputType.CHECKBOX:
        case EInputType.RADIO:
        case EInputType.SELECT:
        case EInputType.NUMBER:
            return value !== null && value !== undefined && value !== '';

        case EInputType.MULTISELECT:
        case EInputType.MULTISELECT_ADDNEW:
            return Array.isArray(value) && value.length > 0;

        default:
            return (value || '').toString().trim().length > 0;
    }
};

export const parseInputValue = (value: unknown, type?: EDataType): unknown => {
    if (!value || !type) return value;
    switch (type) {
        case EDataType.NUMBER:
            return typeof value === 'number' ? value : Number(value);
        case EDataType.STRING:
            return String(value ?? '');
        case EDataType.BOOLEAN:
            return value === true || value === 'true' || value === 1 || value === '1';
        case EDataType.DATE:
            return value instanceof Date ? value : new Date(value as string);
        case EDataType.ARRAY:
            return Array.isArray(value) ? value : String(value).split(',');
    }
    return value;
};

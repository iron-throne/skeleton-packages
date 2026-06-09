import { EDataType, EInputType, IFormField, REGEX } from "@aryagg/types";

export const isEmail = (value: string): boolean => {
	return REGEX.EMAIL.test(value);
}

export const isPhone = (value: string): boolean => {
	return REGEX.PHONE.test(value);
}

export const isNumeric = (value: string): boolean => {
	return !isNaN(Number(value)) && value.trim() !== '';
}
export const isInRange = (value: number, min: number, max: number): boolean => {
	return value >= min && value <= max;
}

export const hasMinLength = (value: string, min: number): boolean => {
	return value.trim().length >= min;
}

export const hasMaxLength = (value: string, max: number): boolean => {
	return value.trim().length <= max;
}

export const isRequiredFilled = (field: IFormField): boolean => {
	if (!field.required) return true;

	const value = field.value;

	switch (field.type) {
		case EInputType.FILE:
		case EInputType.IMAGE:
			// File or File[]
			if (field.multiple) return Array.isArray(value) && value.length > 0;
			return value instanceof File;

		case EInputType.CHECKBOX:
		case EInputType.RADIO:
		case EInputType.SELECT:
		case EInputType.NUMBER:
			return value !== null && value !== undefined && value !== "";

		case EInputType.MULTISELECT:
		case EInputType.MULTISELECT_ADDNEW:
			return Array.isArray(value) && value.length > 0;

		default:
			// TEXT, EMAIL, PASSWORD, SEARCH, TEL, URL, DATE, TIME, etc.
			return (value || "").toString().trim().length > 0;
	}
}
export const parseInputValue = (value: unknown, type?: EDataType) => {
	if (!value || !type) return value; // handle null, undefined, empty string
	switch (type) {
		case EDataType.NUMBER:
			return typeof value === "number" ? value : Number(value);

		case EDataType.STRING:
			return String(value ?? "");

		case EDataType.BOOLEAN:
			return value === true || value === "true" || value === 1 || value === "1";

		case EDataType.DATE:
			return value instanceof Date ? value : new Date(value as string);

		case EDataType.ARRAY:
			return Array.isArray(value) ? value : String(value).split(",");

	}

	return value; // fallback
}



import { REGEX } from "@aryagg/types";

export const isEmail = (value: string): boolean => REGEX.EMAIL.test(value);
export const isPhone = (value: string): boolean => REGEX.PHONE.test(value);
export const isUrl = (value: string): boolean => REGEX.URL.test(value);
export const isAlpha = (value: string): boolean => REGEX.ALPHA.test(value);
export const isAlphanumeric = (value: string): boolean => REGEX.ALPHANUM.test(value);
export const isUUID = (value: string): boolean => REGEX.UUID.test(value);
export const isHexColor = (value: string): boolean => REGEX.HEX_COLOR.test(value);
export const isStrongPassword = (value: string): boolean => REGEX.PASSWORD_STRONG.test(value);

export const isNumeric = (value: string): boolean =>
    !isNaN(Number(value)) && value.trim() !== '';

export const isInRange = (value: number, min: number, max: number): boolean =>
    value >= min && value <= max;

export const hasMinLength = (value: string, min: number): boolean =>
    value.trim().length >= min;

export const hasMaxLength = (value: string, max: number): boolean =>
    value.trim().length <= max;

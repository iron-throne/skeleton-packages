export type InputFieldType =
	| 'text'
	| 'email'
	| 'password'
	| 'number'
	| 'search'
	| 'tel'
	| 'url'
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'month'
	| 'week'
	| 'file'
	| 'textarea'
	| 'select'
	| 'checkbox'
	| 'radio'
	| 'range'
	| 'color';

export type InputFieldState = 'default' | 'success' | 'warning' | 'error';

/** @deprecated Import ESize from @aryagg/types instead. */
export type InputFieldSize = ESize;

export type InputFieldIconPosition = 'left' | 'right';

export type InputFieldOption = {
	label: string;
	value: string;
	disabled?: boolean;
};

export type InputFieldValue = string | number | boolean | File | File[] | null;
import type { ESize } from '@aryagg/types';

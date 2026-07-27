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

export type InputFieldSize = 'sm' | 'md' | 'lg';

export type InputFieldOption = {
	label: string;
	value: string;
	disabled?: boolean;
};

export type InputFieldValue = string | number | boolean | File | File[] | null;

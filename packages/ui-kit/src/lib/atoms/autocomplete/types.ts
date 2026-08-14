import type { InputFieldSize, InputFieldState } from '../input-field/types';
import type { IconType } from '@aryagg/types';

export type AutocompleteOption = {
	label: string;
	value: string;
	description?: string;
	color?: string;
	icon?: IconType;
	iconClass?: string;
	disabled?: boolean;
};

export type AutocompleteValue = string | string[] | null;

export type AutocompleteDensity = InputFieldSize;

export type AutocompleteState = InputFieldState;

export type AutocompleteProps = {
	id?: string;
	label?: string;
	value?: AutocompleteValue;
	options?: AutocompleteOption[];
	placeholder?: string;
	helperText?: string;
	state?: AutocompleteState;
	density?: AutocompleteDensity;
	multiple?: boolean;
	chips?: boolean;
	clearable?: boolean;
	disabled?: boolean;
	loading?: boolean;
	searchable?: boolean;
	showSearchIcon?: boolean;
	showOptionIcons?: boolean;
	noDataText?: string;
	class?: string;
	onChange?: (value: AutocompleteValue) => void;
};

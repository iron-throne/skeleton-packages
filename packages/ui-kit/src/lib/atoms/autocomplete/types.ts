import type { InputFieldSize, InputFieldState } from '../input-field/types';

export type AutocompleteOption = {
	label: string;
	value: string;
	description?: string;
	disabled?: boolean;
};

export type AutocompleteValue = string | string[] | null;

export type AutocompleteDensity = InputFieldSize;

export type AutocompleteState = InputFieldState;

import type { AutocompleteDensity, AutocompleteState } from './types';

export const AUTOCOMPLETE_SIZE_CLASS: Record<AutocompleteDensity, string> = {
	sm: 'min-h-8 px-2.5 py-1 text-xs',
	md: 'min-h-10 px-3 py-1.5 text-sm',
	lg: 'min-h-12 px-3.5 py-2 text-sm'
};

export const AUTOCOMPLETE_STATE_CLASS: Record<AutocompleteState, string> = {
	default: 'border-border-primary focus-within:border-accent focus-within:ring-accent/25',
	success: 'border-success bg-success/5 focus-within:border-success focus-within:ring-success/20',
	warning: 'border-warning bg-warning/10 focus-within:border-warning focus-within:ring-warning/20',
	error: 'border-error bg-error/5 focus-within:border-error focus-within:ring-error/20'
};

export const AUTOCOMPLETE_HELPER_CLASS: Record<AutocompleteState, string> = {
	default: 'text-tertiary',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error'
};

export const AUTOCOMPLETE_PANEL_CLASS =
	'absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-primary bg-surface-primary p-1 shadow-lg';

export const AUTOCOMPLETE_EMPTY_TEXT = 'No options found';

import { ESize } from '@aryagg/types';
import type { InputFieldState } from './types';

export const INPUT_FIELD_SIZE_CLASS: Partial<Record<ESize, string>> = {
	[ESize.SM]: 'h-8 px-2.5 text-xs',
	[ESize.MD]: 'h-10 px-3 text-sm',
	[ESize.LG]: 'h-12 px-3.5 text-sm'
};

export const INPUT_FIELD_STATE_CLASS: Record<InputFieldState, string> = {
	default: 'border-border-primary focus:border-accent focus:ring-accent/25',
	success: 'border-success bg-success/5 focus:border-success focus:ring-success/20',
	warning: 'border-warning bg-warning/10 focus:border-warning focus:ring-warning/20',
	error: 'border-error bg-error/5 focus:border-error focus:ring-error/20'
};

export const INPUT_FIELD_HELPER_CLASS: Record<InputFieldState, string> = {
	default: 'text-tertiary',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error'
};

export const INPUT_FIELD_BASE_CLASS =
	'w-full rounded-xl border bg-surface-secondary text-primary placeholder:text-tertiary outline-none transition focus:bg-surface-primary focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

export const INPUT_FIELD_INLINE_CLASS =
	'rounded border-border-primary bg-surface-primary text-accent focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50';

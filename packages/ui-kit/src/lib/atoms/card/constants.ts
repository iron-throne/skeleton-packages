import type { CardPadding, CardTone, CardTrend, CardVariant } from './types';

export const CARD_VARIANT_CLASS: Record<CardVariant, string> = {
	default: 'rounded-xl border border-border-primary bg-surface-primary shadow-sm',
	metric:
		'rounded-xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden relative group',
	project: 'rounded-xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden',
	panel: 'rounded-xl border border-border-primary bg-surface-primary',
	insight: 'rounded-xl border border-accent/20 bg-accent/5 shadow-sm',
	feature: 'rounded-xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden'
};

export const CARD_PADDING_CLASS: Record<CardPadding, string> = {
	none: '',
	sm: 'p-3',
	md: 'p-4',
	lg: 'p-5'
};

export const CARD_TONE_CLASS: Record<CardTone, string> = {
	neutral: 'text-primary',
	accent: 'text-accent',
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error',
	info: 'text-info'
};

export const CARD_ICON_CLASS: Record<CardTone, string> = {
	neutral: 'bg-surface-tertiary text-secondary',
	accent: 'bg-accent/10 text-accent',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/15 text-warning',
	error: 'bg-error/10 text-error',
	info: 'bg-info/10 text-info'
};

export const CARD_TREND_CLASS: Record<CardTrend, string> = {
	up: 'text-success',
	down: 'text-error',
	flat: 'text-tertiary'
};

export const CARD_TREND_SYMBOL: Record<CardTrend, string> = {
	up: '+',
	down: '-',
	flat: '='
};

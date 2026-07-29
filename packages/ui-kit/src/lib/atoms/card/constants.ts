import type { CardPadding, CardTone, CardTrend, CardVariant } from './types';

export const CARD_VARIANT_CLASS: Record<CardVariant, string> = {
	default: 'ui-card ui-card-default',
	content: 'ui-card ui-card-content',
	metric: 'ui-card ui-card-metric overflow-hidden relative group',
	project: 'ui-card ui-card-project overflow-hidden',
	panel: 'ui-card ui-card-panel',
	insight: 'ui-card ui-card-insight',
	feature: 'ui-card ui-card-feature overflow-hidden'
};

export const CARD_PADDING_CLASS: Record<CardPadding, string> = {
	none: 'card-padding-none',
	sm: 'card-padding-sm',
	md: 'card-padding-md',
	lg: 'card-padding-lg'
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

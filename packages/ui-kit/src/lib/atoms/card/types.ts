import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CardVariant =
	| 'default'
	| 'content'
	| 'metric'
	| 'project'
	| 'panel'
	| 'insight'
	| 'feature';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type CardTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export type CardTrend = 'up' | 'down' | 'flat';

export type CardProps = Omit<
	HTMLAttributes<HTMLElement>,
	'children' | 'class' | 'style' | 'title'
> & {
	variant?: CardVariant;
	padding?: CardPadding;
	radius?: CardRadius;
	tone?: CardTone;
	title?: string;
	subtitle?: string;
	eyebrow?: string;
	value?: string | number;
	trend?: CardTrend;
	trendLabel?: string;
	badge?: string;
	href?: string;
	selected?: boolean;
	interactive?: boolean;
	icon?: any;
	chartValues?: number[];
	ariaLabel?: string;
	class?: string;
	style?: string;
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
	borderWidth?: string;
	borderRadius?: string;
	shadow?: string;
	hoverShadow?: string;
	hoverOffset?: string;
	paddingBlock?: string;
	paddingInline?: string;
	children?: Snippet;
	media?: Snippet;
	actions?: Snippet;
	footer?: Snippet;
};

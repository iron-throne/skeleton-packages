import type { ESize } from '@aryagg/types';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type BadgeVariant =
	| 'default'
	| 'accent'
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'blue'
	| 'green'
	| 'amber'
	| 'red'
	| 'violet';

export type BadgeAppearance = 'soft' | 'solid' | 'outline';

/** @deprecated Import ESize from @aryagg/types instead. */
export type BadgeSize = ESize;

export type BadgeRadius = 'none' | 'sm' | 'md' | 'full';

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class' | 'style'> & {
	label?: string;
	variant?: BadgeVariant;
	appearance?: BadgeAppearance;
	size?: ESize;
	radius?: BadgeRadius;
	dot?: boolean;
	dotOnly?: boolean;
	uppercase?: boolean;
	icon?: any;
	class?: string;
	style?: string;
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
	borderWidth?: string;
	borderRadius?: string;
	height?: string;
	paddingInline?: string;
	fontSize?: string;
	fontWeight?: string;
	dotColor?: string;
	children?: Snippet;
};

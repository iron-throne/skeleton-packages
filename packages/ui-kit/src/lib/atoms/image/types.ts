import type { Snippet } from 'svelte';
import type { HTMLImgAttributes } from 'svelte/elements';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export type ImageAspect = 'auto' | 'square' | 'video' | 'wide' | 'portrait' | 'project';

export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ImageOverlay = 'none' | 'top' | 'bottom' | 'full';

export type ImageProps = Omit<
	HTMLImgAttributes,
	'alt' | 'children' | 'class' | 'height' | 'loading' | 'src' | 'style' | 'width'
> & {
	src?: string;
	alt?: string;
	caption?: string;
	fit?: ImageFit;
	aspect?: ImageAspect;
	radius?: ImageRadius;
	overlay?: ImageOverlay;
	loading?: 'lazy' | 'eager';
	class?: string;
	imageClass?: string;
	style?: string;
	width?: string;
	height?: string;
	backgroundColor?: string;
	gradientFrom?: string;
	gradientTo?: string;
	borderColor?: string;
	borderWidth?: string;
	borderRadius?: string;
	objectPosition?: string;
	overlayColor?: string;
	fallbackText?: string;
	showBlueprint?: boolean;
	blueprintColor?: string;
	actions?: Snippet;
	topLeft?: Snippet;
	topRight?: Snippet;
	children?: Snippet;
};

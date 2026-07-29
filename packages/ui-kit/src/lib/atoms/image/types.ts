import type { Snippet } from 'svelte';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export type ImageAspect = 'auto' | 'square' | 'video' | 'wide' | 'portrait';

export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ImageOverlay = 'none' | 'top' | 'bottom' | 'full';

export type ImageProps = {
	src: string;
	alt: string;
	caption?: string;
	fit?: ImageFit;
	aspect?: ImageAspect;
	radius?: ImageRadius;
	overlay?: ImageOverlay;
	loading?: 'lazy' | 'eager';
	class?: string;
	actions?: Snippet;
};

import type { ImageAspect, ImageFit, ImageOverlay, ImageRadius } from './types';

export const IMAGE_FIT_CLASS: Record<ImageFit, string> = {
	cover: 'object-cover',
	contain: 'object-contain',
	fill: 'object-fill',
	none: 'object-none',
	'scale-down': 'object-scale-down'
};

export const IMAGE_ASPECT_CLASS: Record<ImageAspect, string> = {
	auto: '',
	square: 'aspect-square',
	video: 'aspect-video',
	wide: 'aspect-[21/9]',
	portrait: 'aspect-[3/4]'
};

export const IMAGE_RADIUS_CLASS: Record<ImageRadius, string> = {
	none: 'rounded-none',
	sm: 'rounded-md',
	md: 'rounded-lg',
	lg: 'rounded-xl',
	xl: 'rounded-2xl',
	full: 'rounded-full'
};

export const IMAGE_OVERLAY_CLASS: Record<ImageOverlay, string> = {
	none: '',
	top: 'items-start bg-gradient-to-b from-black/55 to-transparent',
	bottom: 'items-end bg-gradient-to-t from-black/60 to-transparent',
	full: 'items-end bg-black/35'
};

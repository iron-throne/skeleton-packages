import type { ImageAspect, ImageFit, ImageOverlay, ImageRadius } from './types';

export const IMAGE_FIT_CLASS: Record<ImageFit, string> = {
	cover: 'object-cover',
	contain: 'object-contain',
	fill: 'object-fill',
	none: 'object-none',
	'scale-down': 'object-scale-down'
};

export const IMAGE_ASPECT_CLASS: Record<ImageAspect, string> = {
	auto: 'image-aspect-auto',
	square: 'image-aspect-square',
	video: 'image-aspect-video',
	wide: 'image-aspect-wide',
	portrait: 'image-aspect-portrait',
	project: 'image-aspect-project'
};

export const IMAGE_RADIUS_CLASS: Record<ImageRadius, string> = {
	none: 'image-radius-none',
	sm: 'image-radius-sm',
	md: 'image-radius-md',
	lg: 'image-radius-lg',
	xl: 'image-radius-xl',
	full: 'image-radius-full'
};

export const IMAGE_OVERLAY_CLASS: Record<ImageOverlay, string> = {
	none: '',
	top: 'items-start bg-gradient-to-b from-black/55 to-transparent',
	bottom: 'items-end bg-gradient-to-t from-black/60 to-transparent',
	full: 'items-end bg-black/35'
};

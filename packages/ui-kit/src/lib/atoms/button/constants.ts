import type { ButtonSize, ButtonVariant } from './types';

export const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
	primary: 'btn-primary',
	secondary: 'btn-secondary',
	muted: 'btn-muted',
	outline: 'btn-outline',
	ghost: 'btn-ghost',
	'ghost-light': 'btn-ghost-light',
	actions: 'btn-actions',
	success: 'btn-success',
	danger: 'btn-danger',
	info: 'btn-info'
};

export const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
	md: '',
	sm: 'btn-sm',
	lg: 'btn-lg',
	icon: 'btn-icon'
};

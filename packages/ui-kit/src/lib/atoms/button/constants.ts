import { ESize } from '@aryagg/types';
import type { ButtonVariant } from './types';

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

export const BUTTON_SIZE_CLASS: Partial<Record<ESize, string>> = {
	[ESize.SM]: 'btn-sm',
	[ESize.MD]: '',
	[ESize.LG]: 'btn-lg'
};

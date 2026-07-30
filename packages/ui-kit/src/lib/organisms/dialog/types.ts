import type { ESize, IconType } from '@aryagg/types';
import type { Snippet } from 'svelte';

export type DialogVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';
export type DialogRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type DialogProps = {
	open?: boolean;
	title?: string;
	description?: string;
	icon?: IconType | null;
	variant?: DialogVariant;
	size?: ESize;
	radius?: DialogRadius;
	dismissible?: boolean;
	closeOnBackdrop?: boolean;
	closeOnEsc?: boolean;
	class?: string;
	backdropClass?: string;
	panelClass?: string;
	headerClass?: string;
	bodyClass?: string;
	footerClass?: string;
	children: Snippet;
	header?: Snippet;
	footer?: Snippet;
	onClose?: () => void;
};

import type { ESize, IconType } from '@aryagg/types';
import type { Snippet } from 'svelte';

export type DrawerPosition = 'left' | 'right';
export type DrawerVariant = 'default' | 'info' | 'success' | 'warning' | 'danger';

export type DrawerProps = {
	open?: boolean;
	title?: string;
	description?: string;
	icon?: IconType | null;
	variant?: DrawerVariant;
	/** Which edge of the viewport the panel slides in from. Defaults to 'right'. */
	position?: DrawerPosition;
	/** Controls the panel's max width. */
	size?: ESize;
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

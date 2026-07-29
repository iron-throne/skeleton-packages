import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ESize } from '@aryagg/types';

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'muted'
	| 'outline'
	| 'ghost'
	| 'ghost-light'
	| 'actions'
	| 'success'
	| 'danger'
	| 'info';

/** @deprecated Import ESize from @aryagg/types instead. */
export type ButtonSize = ESize;

export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type ButtonIconPosition = 'left' | 'right';

export type ButtonProps = Omit<
	HTMLButtonAttributes,
	'class' | 'children' | 'disabled' | 'onclick' | 'onkeydown' | 'type'
> & {
	/** Text content. May be replaced with the children snippet for richer content. */
	label?: string;
	children?: Snippet;
	class?: string;
	/** @deprecated Use class instead. */
	klass?: string;
	/** @deprecated Use class instead. */
	classes?: string;
	variant?: ButtonVariant;
	size?: ESize;
	radius?: ButtonRadius;
	type?: 'button' | 'submit' | 'reset';
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	iconOnly?: boolean;
	iconPosition?: ButtonIconPosition;
	// Icon components come from the consumer and may expose different prop types.
	icon?: any;
	onclick?: (event: MouseEvent) => void;
	/** @deprecated Use onclick instead. */
	onClick?: (event?: MouseEvent) => void | Promise<void>;
	onkeydown?: (event: KeyboardEvent) => void;
	/** @deprecated Use onkeydown instead. */
	onKeydown?: (event: KeyboardEvent) => void;
	onEnterKeydown?: () => void;
};

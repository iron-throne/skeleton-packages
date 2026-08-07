import type { ESize, IconType } from '@aryagg/types';

export type RatingProps = {
	value?: number;
	/** Number of rating items. */
	length?: number;
	size?: ESize;
	icon?: IconType;
	selectedIcon?: IconType;
	readonly?: boolean;
	disabled?: boolean;
	allowClear?: boolean;
	label?: string;
	class?: string;
	itemClass?: string;
	/** @deprecated Use iconKlass for consistency with the existing library API. */
	iconClass?: string;
	/** @deprecated Use selectedKlass for consistency with the existing library API. */
	selectedClass?: string;
	iconKlass?: string;
	selectedKlass?: string;
	onChange?: (value: number) => void;
};

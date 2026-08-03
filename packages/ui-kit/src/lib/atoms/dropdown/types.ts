import type { Snippet } from 'svelte';
import type { IconType } from '@aryagg/types';

export type DropdownPlacement = 'bottom' | 'top' | 'side';
export type DropdownVariant = 'v3' | 'rounded';
export type DropdownWidth = string | number;

export type DropdownItem = {
	id: string;
	label: string;
	icon?: IconType;
	selectedIcon?: IconType;
	iconClass?: string;
	selectedIconClass?: string;
	description?: string;
	shortcut?: string;
	badge?: string | number;
	selected?: boolean;
	danger?: boolean;
	disabled?: boolean;
	divider?: boolean;
	href?: string;
	class?: string;
	children?: DropdownItem[];
	onclick?: () => void;
};

export type DropdownTriggerContext = {
	open: boolean;
	toggle: () => void;
	close: () => void;
};

export type DropdownHeaderContext = {
	close: () => void;
};

export type DropdownMenuProps = {
	menus: DropdownItem[];
	align?: 'left' | 'right';
	placement?: DropdownPlacement;
	variant?: DropdownVariant;
	width?: DropdownWidth;
	maxHeight?: string;
	gap?: number;
	menuClass?: string;
	/** Extra class(es) applied to any menu item while it is selected - common to all items, independent of each item's own `class`. */
	activeKlass?: string;
	selected?: string;
	closeOnSelect?: boolean;
	trigger: Snippet<[DropdownTriggerContext]>;
	header?: Snippet<[DropdownHeaderContext]>;
	footer?: Snippet<[DropdownHeaderContext]>;
	onSelect?: (item: DropdownItem) => void;
};

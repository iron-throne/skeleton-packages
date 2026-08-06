import type { DropdownItem, DropdownVariant } from '../dropdown/types';

export type MenuListProps = {
	menus: DropdownItem[];
	align?: 'left' | 'right';
	variant?: DropdownVariant;
	menuClass?: string;
	/** Extra class(es) applied to any menu item while it is selected - common to all items, independent of each item's own `class`. */
	activeKlass?: string;
	selected?: string;
	onSelect?: (item: DropdownItem) => void;
};

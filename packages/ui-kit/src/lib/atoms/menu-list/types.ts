import type { DropdownItem, DropdownVariant } from '../dropdown/types';

export type MenuListProps = {
	menus: DropdownItem[];
	align?: 'left' | 'right';
	variant?: DropdownVariant;
	menuClass?: string;
	selected?: string;
	onSelect?: (item: DropdownItem) => void;
};

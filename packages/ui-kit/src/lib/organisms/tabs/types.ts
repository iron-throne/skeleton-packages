import type { Snippet } from 'svelte';
import type { IconType } from '@aryagg/types';

export type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TabsVariant = 'underline' | 'segmented' | 'surface' | 'classic';
export type TabsRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
export type TabsIconPosition = 'left' | 'right';

export type TabItem = {
	id: string;
	label: string;
	badge?: string | number;
	disabled?: boolean;
	icon?: IconType;
	selectedIcon?: IconType;
};

export type TabsProps = {
	tabs: TabItem[];
	active?: string;
	disabled?: boolean;
	size?: TabsSize;
	variant?: TabsVariant;
	radius?: TabsRadius;
	borderRadius?: string;
	containerBorderRadius?: string;
	showIcons?: boolean;
	iconPosition?: TabsIconPosition;
	class?: string;
	tabClass?: string;
	panelClass?: string;
	children?: Snippet;
	onChange?: (tab: TabItem) => void;
};

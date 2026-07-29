import type { Snippet } from 'svelte';
import type { ESize, IconType } from '@aryagg/types';

/** @deprecated Import ESize from @aryagg/types instead. */
export type TabsSize = ESize;
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
	size?: ESize;
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

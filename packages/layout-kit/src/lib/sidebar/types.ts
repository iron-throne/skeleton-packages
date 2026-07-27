import type { IMenu } from '@aryagg/types';
import type { Snippet } from 'svelte';

export interface SidebarMenuItem extends IMenu {
	/** Small uppercase label rendered above this item when the sidebar is expanded — groups items into sections. */
	heading?: string;
	/** Overrides the tooltip shown when the sidebar is collapsed to a rail (defaults to `label`). */
	tooltip?: string;
	/** Count/label rendered at the end of the item when the sidebar is expanded. */
	badge?: string | number;
	children?: SidebarMenuItem[];
}

export type SidebarPosition = 'left' | 'right';

export interface CollapsibleSidebarProps {
	menus: SidebarMenuItem[];

	/** Icon-only rail mode. Bindable. */
	isCollapsed?: boolean;
	/** Show the built-in expand/collapse toggle button. */
	collapsible?: boolean;

	/** Which edge of the screen the sidebar belongs to — flips flyouts, borders and the drawer's slide direction. */
	position?: SidebarPosition;
	expandedWidth?: string;
	collapsedWidth?: string;

	logosrc?: string;
	logohref?: string;
	brand?: string;
	brandClass?: string;

	mainClass?: string;
	logoClass?: string;
	listClass?: string;
	footerClass?: string;
	navAriaLabel?: string;

	/** Render as an off-canvas drawer with a backdrop instead of a static column, e.g. for mobile. */
	mobile?: boolean;
	/** Whether the mobile drawer is open. Bindable. */
	mobileOpen?: boolean;
	mobileWidth?: string;
	onMobileClose?: () => void;

	footerSlot?: Snippet;
	headerSlot?: Snippet<[{ isCollapsed: boolean; toggle: () => void }]>;
	menuSlot?: Snippet<[menu: SidebarMenuItem, ctx: { isCollapsed: boolean }]>;
}

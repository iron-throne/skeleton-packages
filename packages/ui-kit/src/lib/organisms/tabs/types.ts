import type { Snippet } from 'svelte';
import type { ESize, ITab } from '@aryagg/types';

/** @deprecated Import ESize from @aryagg/types instead. */
export type TabsSize = ESize;
export type TabsVariant = 'underline' | 'segmented' | 'surface' | 'classic';
export type TabsRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
export type TabsIconPosition = 'left' | 'right';

/** Re-exported for backwards compatibility; identical to the shared `ITab` shape. */
export type TabItem = ITab;

export type TabsProps = {
	tabs: TabItem[];
	/** Id of the selected tab. Bindable; defaults to the first non-disabled tab. */
	active?: string;
	/** Disables the whole tab list. */
	disabled?: boolean;
	size?: ESize;
	variant?: TabsVariant;
	radius?: TabsRadius;
	showIcons?: boolean;
	iconPosition?: TabsIconPosition;
	/** Class applied to the outer container. */
	klass?: string;
	/** Class applied to the tablist wrapper (the tab bar itself). */
	parentKlass?: string;
	/** Class applied to every tab button. */
	tabKlass?: string;
	/** Class applied to the tab panel wrapping `children`. */
	panelKlass?: string;
	/** Content rendered below the tab list, e.g. the active tab's panel. */
	children?: Snippet;
	onChange?: (tab: TabItem) => void;
	/** Extra class(es) applied to a tab button only while it is selected. */
	activeKlass?: string;
};

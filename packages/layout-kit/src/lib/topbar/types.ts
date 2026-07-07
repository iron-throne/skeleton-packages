	import { ETheme, type IMenu, type INavItem } from '@aryagg/types';
import type { Snippet } from 'svelte';

    export interface TopbarProps {
    	homeHref?: string;
		homeAriaLabel?: string;
		homeClass?: string;
		logoSrc?: string;
		logoAlt?: string;
		brand?: string;
        brandClass?: string;

		menus ?:INavItem[];
		activeHref?: string;

		searchPlaceholder?: string;
		searchClass?: string;
		searchIconClass?: string;
		searchValue?: string;
		onSearchInput?: (value?: string) => void;

		languages?: { label?: string; value?: string }[];
		currentLanguage?: string;
		onLanguageChange?: (value?: string) => void;

		theme?: ETheme;
		onThemeChange?: (theme?: ETheme) => void;

		avatarSrc?: string;
		userName?: string;
		profileLabel?: string;
		profileItems?: any[];

		leftSlot?: Snippet | null,
		midSlot?: Snippet | null,
		rightSlot?: Snippet | null,
		hclass?: string,
		klass?: string
}
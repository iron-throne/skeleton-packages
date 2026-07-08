import { ETheme, type IMenu } from '@aryagg/types';
import type { Snippet } from 'svelte';

export interface TopbarProps {
	homeHref?: string;
	homeAriaLabel?: string;
	homeClass?: string;
	logoSrc?: string;
	logoAlt?: string;
	brand?: string;
	brandClass?: string;

	menus?: IMenu[];
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

	leftSlot?: Snippet | null;
	midSlot?: Snippet | null;
	rightSlot?: Snippet | null;
	hclass?: string;
	klass?: string;
}

export type NavItem = {
	label: string;
	href?: string;
	icon?: any;
	badge?: string;
	children?: NavItem[];
};

export type HeaderVariant = 'default' | 'centered' | 'stacked' | 'minimal';

export type HeaderProps = {
	brand: string;
	brandHref?: string;
	brandIcon?: any;
	tagline?: string;
	items?: NavItem[];
	actions?: Snippet;
	variant?: HeaderVariant;
	class?: string;
};

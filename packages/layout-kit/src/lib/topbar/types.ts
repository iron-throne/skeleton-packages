import { ETheme, type IFormField, type IMenu } from '@aryagg/types';
import type { Snippet } from 'svelte';

export interface TopbarProps {
	homeHref?: string;
	homeAriaLabel?: string;
	homeClass?: string;
	logoSrc?: string;
	logoAlt?: string;
	brandClass?: string;

	menus?: IMenu[];
	activeHref?: string;
	menuClass?: string;
	menuLayout?: 'stacked' | 'horizontal';

	searchField?: IFormField;
	onSearchInput?: (value?: string) => void;
	searchSlot?: Snippet | null;

	languages?: { label?: string; value?: string }[];
	currentLanguage?: string;
	onLanguageChange?: (value?: string) => void;

	theme?: ETheme;
	onThemeChange?: (theme?: ETheme) => void;

	avatarSrc?: string;
	userName?: string;
	profileLabel?: string;
	profileItems?: any[];
	profileSlot?: Snippet | null;

	leftSlot?: Snippet | null;
	midSlot?: Snippet | null;
	rightSlot?: Snippet | null;
	klass?: string;
	brand?: string;
	brandHref?: string;
	tagline?: string;
	items?: IMenu[];
	actions?: Snippet;
	variant?: HeaderVariant;
	headerClass?: string;
}

export type NavItem = {
	label: string;
	href?: string;
	icon?: any;
	badge?: string;
	children?: NavItem[];
};

export type HeaderVariant = 'default' | 'centered' | 'stacked' | 'minimal';
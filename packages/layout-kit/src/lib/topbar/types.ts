import { ETheme, type IFormField, type IMenu } from '@aryagg/types';
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

export type HeaderProps = TopbarProps & {
	brand?: string;
	brandHref?: string;
	brandIcon?: any;
	tagline?: string;
	items?: IMenu[];
	actions?: Snippet;
	variant?: HeaderVariant;
	class?: string;
};

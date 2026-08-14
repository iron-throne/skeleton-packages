import type { Snippet } from 'svelte';
import { ESwitchLayout, type ETheme, type IMenu } from '@aryagg/types';

export type SwitchDisplay = 'icon' | 'label' | 'both';
export type SwitchLayout = ESwitchLayout;

export interface NavConfig {
	items: IMenu[];
	activeHref?: string;
	layout?: SwitchLayout;
	menuClass?: string;
}

export interface LanguageSwitchConfig {
	languages: { label?: string; value?: string }[];
	currentLanguage?: string;
	onLanguageChange?: (value?: string) => void;
	display?: SwitchDisplay;
	layout?: SwitchLayout;
	klass?: string;
}

export interface ThemeSwitchConfig {
	theme?: ETheme;
	onThemeChange?: (theme?: ETheme) => void;
	themeStorageKey?: string;
	display?: SwitchDisplay;
	layout?: SwitchLayout;
	klass?: string;
}

export interface ProfileConfig {
	src?: string;
	name?: string;
	label?: string;
	items?: IMenu[];
	onclick?: () => void;
	avatarKlass?: string;
	layout?: SwitchLayout;
	klass?: string;
}

export interface TopbarProps {
	title?: string;
	logoSrc?: string;
	logoAlt?: string;
	href?: string;

	klass?: string;

	leftSlot?: Snippet;
	midSlot?: Snippet;
	children?: Snippet;

	nav?: NavConfig;
	languageSwitch?: LanguageSwitchConfig;
	themeSwitch?: ThemeSwitchConfig;

	profile?: ProfileConfig;
}

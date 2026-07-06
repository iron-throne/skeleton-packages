import type { Snippet } from 'svelte';

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

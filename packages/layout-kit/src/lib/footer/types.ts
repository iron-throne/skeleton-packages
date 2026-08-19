import type { Snippet } from 'svelte';

export interface FooterLink {
	label: string;
	href: string;
	external?: boolean;
}

export interface FooterLinkGroup {
	title: string;
	links: FooterLink[];
}

export interface FooterSocialLink extends FooterLink {
	/** Optional icon or short label rendered before the accessible link label. */
	icon?: Snippet;
}

export interface FooterBaseProps {
	brand?: string;
	logo?: string;
	logoAlt?: string;
	homeHref?: string;
	description?: string;
	copyright?: string;
	legalLinks?: FooterLink[];
	socialLinks?: FooterSocialLink[];
	brandSlot?: Snippet;
	klass?: string;
	parentKlass?: string;
}

export interface FooterNewsletterProps extends FooterBaseProps {
	title?: string;
	subtitle?: string;
	emailPlaceholder?: string;
	submitText?: string;
	onSubscribe?: (email: string) => void | Promise<void>;
	loading?: boolean;
	successMessage?: string;
}

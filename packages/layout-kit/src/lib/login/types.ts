import type { Snippet } from 'svelte';
import type { ActionResult } from '@aryagg/types';

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe: boolean;
}

/** Called with the parsed credentials. Use this for callback-driven (non SvelteKit-action) submission. */
export type LoginSubmitHandler = (credentials: LoginCredentials) => void | Promise<void>;

/**
 * Class overrides for the internal regions of a Login* component.
 * Every variant accepts this same shape and simply ignores the keys that don't apply to it,
 * so swapping LoginSimple/LoginSplit/LoginCover for one another needs no prop renaming.
 */
export interface LoginClassNames {
	/** Heading text */
	title?: string;
	/** Subheading text */
	subtitle?: string;
	/** The <form> element */
	form?: string;
	/** Boxed content card (LoginSimple, LoginCover) */
	card?: string;
	/** Branding side panel (LoginSplit) */
	panel?: string;
	/** Form-side wrapper (LoginSplit) */
	formSection?: string;
	/** Scrim over the background/side image (LoginCover, LoginSplit) */
	overlay?: string;
	logo?:string;
	appName?:string;

	panelHeading?:string;

	panelDescription?:string;

}

/** Background/illustration image config, shared by LoginSplit (side image) and LoginCover (page background). */
export interface LoginImageConfig {
	url?: string;
	alt?: string;
	position?: 'left' | 'right';
	class?: string;
}

/** Props shared by every Login* component variant (LoginSimple, LoginSplit, LoginCover). */
export interface LoginBaseProps {
	// Text content
	appName?: string;
	title?: string;
	subtitle?: string;
	emailLabel?: string;
	emailPlaceholder?: string;
	passwordLabel?: string;
	passwordPlaceholder?: string;
	rememberMeLabel?: string;
	forgotPasswordText?: string;
	submitText?: string;
	dividerText?: string;
	noAccountText?: string;
	signUpText?: string;

	// Media / links
	logo?: string;
	homeHref?: string;
	forgotPasswordHref?: string;
	signUpHref?: string;

	// Behavior — provide `action` for a SvelteKit form action, or `onSubmit` for a plain callback
	action?: string;
	onSubmit?: LoginSubmitHandler;
	onResult?: (result: ActionResult) => void | Promise<void>;
	loading?: boolean;
	error?: string;

	// UI toggles
	showRememberMe?: boolean;
	showForgotPassword?: boolean;
	showSignUpLink?: boolean;

	// Slots
	logoSlot?: Snippet;
	headerSlot?: Snippet;
	/** Fully replaces the default <form>, e.g. to hand-write a `use:enhance` form yourself */
	formSlot?: Snippet;
	footerSlot?: Snippet;
	errorSlot?: Snippet;

	// CSS class overrides
	class?: string;
	classes?: LoginClassNames;
}

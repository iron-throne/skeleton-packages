import type { Snippet } from 'svelte';
import type { ActionResult } from '@aryagg/types';

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe: boolean;
}

/** Called with the parsed credentials. Use this for callback-driven (non SvelteKit-action) submission. */
export type LoginSubmitHandler = (credentials: LoginCredentials) => void | Promise<void>;

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
	titleClass?: string;
	subtitleClass?: string;
	formClass?: string;
}

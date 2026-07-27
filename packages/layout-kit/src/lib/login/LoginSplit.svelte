<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	import type { LoginCredentials, LoginBaseProps } from './types';
	import { Alert, Input } from '@aryagg/ui-kit';
	import { EInputType, type IFormField } from '@aryagg/types';

	let {
		// Text content
		appName = 'App',
		title = 'Welcome back',
		subtitle = 'Sign in to continue',
		emailLabel = 'Email',
		emailPlaceholder = 'you@example.com',
		passwordLabel = 'Password',
		passwordPlaceholder = '••••••••',
		rememberMeLabel = 'Remember me',
		forgotPasswordText = 'Forgot password?',
		submitText = 'Sign in',
		dividerText = 'or',
		noAccountText = "Don't have an account?",
		signUpText = 'Sign up',

		// Branding panel content
		panelHeading = 'Build something great',
		panelDescription = 'Sign in to pick up right where you left off.',

		// Media / links
		logo,
		homeHref = '/',
		forgotPasswordHref = '/forgot-password',
		signUpHref = '/register',
		image = 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80',
		imageAlt = 'Sign in illustration',
		imagePosition = 'left',

		// Behavior — provide `action` for a SvelteKit form action, or `onSubmit` for a plain callback
		action,
		onSubmit,
		onResult,
		loading = $bindable(false),
		error = '',

		// UI toggles
		showRememberMe = true,
		showForgotPassword = true,
		showSignUpLink = true,

		// Slots
		logoSlot,
		panelSlot,
		headerSlot,
		formSlot,
		footerSlot,
		errorSlot,

		// CSS class overrides
		class: klass = '',
		panelClass,
		imageClass,
		formSectionClass,
		titleClass,
		subtitleClass,
		formClass,
	}: LoginBaseProps & {
		panelHeading?: string;
		panelDescription?: string;
		image?: string;
		imageAlt?: string;
		imagePosition?: 'left' | 'right';
		/** Replaces the default heading/description on the branding panel */
		panelSlot?: Snippet;
		panelClass?: string;
		imageClass?: string;
		formSectionClass?: string;
	} = $props();

	let emailField = $state<IFormField>(
		untrack(() => ({
			key: 'email',
			id: 'login-split-email',
			type: EInputType.EMAIL,
			label: emailLabel,
			placeholder: emailPlaceholder,
			required: true,
			attributes: { name: 'email', autocomplete: 'email' },
		})),
	);

	let passwordField = $state<IFormField>(
		untrack(() => ({
			key: 'password',
			id: 'login-split-password',
			type: EInputType.PASSWORD,
			label: passwordLabel,
			placeholder: passwordPlaceholder,
			required: true,
			hideLabel: true,
			attributes: { name: 'password', autocomplete: 'current-password' },
		})),
	);

	let rememberMeField = $state<IFormField>(
		untrack(() => ({
			key: 'rememberMe',
			id: 'login-split-remember-me',
			type: EInputType.CHECKBOX,
			label: rememberMeLabel,
			placeholder: rememberMeLabel,
			hideLabel: true,
			attributes: { name: 'rememberMe' },
		})),
	);

	$effect(() => {
		emailField.label = emailLabel;
		emailField.placeholder = emailPlaceholder;
	});
	$effect(() => {
		passwordField.label = passwordLabel;
		passwordField.placeholder = passwordPlaceholder;
	});
	$effect(() => {
		rememberMeField.label = rememberMeLabel;
		rememberMeField.placeholder = rememberMeLabel;
	});

	const handleSubmit = ({ formData, cancel }: { formData: FormData; cancel: () => void }) => {
		if (onSubmit) {
			cancel();
			const credentials: LoginCredentials = {
				email: String(formData.get('email') ?? ''),
				password: String(formData.get('password') ?? ''),
				rememberMe: formData.get('rememberMe') === 'on',
			};
			loading = true;
			Promise.resolve(onSubmit(credentials)).finally(() => (loading = false));
			return;
		}

		loading = true;
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			if (onResult) await onResult(result);
			else await update();
			loading = false;
		};
	};

	const formSection = $derived(imagePosition === 'left' ? 'order-2' : 'order-1');
	const panelSection = $derived(imagePosition === 'left' ? 'order-1' : 'order-2');
</script>

<div class="bg-surface-primary flex min-h-screen flex-wrap {klass}">
	<!-- BRANDING PANEL -->
	<div
		class="bg-accent/90 relative hidden w-full items-center overflow-hidden sm:flex sm:w-5/12 {panelSection} {panelClass ??
			''}"
	>
		{#if image}
			<img
				src={image}
				alt={imageAlt}
				class="absolute inset-0 size-full object-cover {imageClass ?? ''}"
			/>
			<div class="from-accent/90 via-accent/60 absolute inset-0 bg-linear-to-t to-transparent"
			></div>
		{/if}

		<div class="text-on-accent relative z-10 p-10 lg:p-14">
			{#if logoSlot}
				{@render logoSlot()}
			{:else if logo || appName}
				<a href={homeHref} class="mb-8 flex items-center gap-2">
					{#if logo}
						<img src={logo} alt={appName} class="h-6 w-auto" />
					{:else}
						<span class="text-xl leading-none">✦</span>
					{/if}
					<span class="text-lg font-semibold tracking-wide">{appName}</span>
				</a>
			{/if}

			{#if panelSlot}
				{@render panelSlot()}
			{:else}
				<h2 class="text-3xl font-bold lg:text-4xl">{panelHeading}</h2>
				<p class="text-on-accent/80 mt-4 text-lg">{panelDescription}</p>
			{/if}
		</div>
	</div>

	<!-- FORM PANEL -->
	<div
		class="flex w-full items-center justify-center px-4 py-12 sm:w-7/12 {formSection} {formSectionClass ??
			''}"
	>
		<div class="w-full max-w-md">
			{#if !image}
				{#if logoSlot}
					{@render logoSlot()}
				{:else if logo || appName}
					<a href={homeHref} class="mb-8 flex items-center justify-center gap-2 sm:hidden">
						{#if logo}
							<img src={logo} alt={appName} class="h-6 w-auto" />
						{:else}
							<span class="text-accent text-xl leading-none">✦</span>
						{/if}
						<span class="text-content-primary text-lg font-semibold tracking-wide">{appName}</span>
					</a>
				{/if}
			{/if}

			{#if headerSlot}
				{@render headerSlot()}
			{:else}
				<div class="mb-8">
					<h1 class="text-content-primary mb-1 text-2xl font-bold {titleClass ?? ''}">
						{title}
					</h1>
					<p class="text-content-secondary text-sm {subtitleClass ?? ''}">{subtitle}</p>
				</div>
			{/if}

			{#if errorSlot}
				{@render errorSlot()}
			{:else if error}
				<div class="mb-5">
					<Alert variant="error">{error}</Alert>
				</div>
			{/if}

			{#if formSlot}
				{@render formSlot()}
			{:else}
				<form
					{action}
					method="POST"
					use:enhance={handleSubmit}
					class="flex flex-col gap-5 {formClass ?? ''}"
				>
					<Input bind:field={emailField} />

					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="login-split-password" class="text-content-primary text-sm font-medium">
								{passwordLabel}
							</label>
							{#if showForgotPassword}
								<a href={forgotPasswordHref} class="text-accent text-xs hover:underline">
									{forgotPasswordText}
								</a>
							{/if}
						</div>
						<Input bind:field={passwordField} />
					</div>

					{#if showRememberMe}
						<Input bind:field={rememberMeField} />
					{/if}

					<button
						type="submit"
						disabled={loading}
						class="btn btn-primary mt-1 w-full py-3 text-base font-semibold disabled:opacity-60"
					>
						{#if loading}
							<span
								class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
							></span>
						{/if}
						{submitText}
					</button>
				</form>
			{/if}

			{#if footerSlot}
				{@render footerSlot()}
			{:else if showSignUpLink}
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="border-border-primary w-full border-t"></div>
					</div>
					<div class="relative flex justify-center text-xs">
						<span class="bg-surface-primary text-content-tertiary px-3">{dividerText}</span>
					</div>
				</div>

				<p class="text-content-secondary text-center text-sm">
					{noAccountText}
					<a href={signUpHref} class="text-accent ml-1 font-medium hover:underline">
						{signUpText}
					</a>
				</p>
			{/if}
		</div>
	</div>
</div>

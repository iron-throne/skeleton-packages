<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoginCredentials, LoginBaseProps } from './types';
	import { Alert, Input } from '@aryagg/ui-kit';
	import { enhance } from '@aryagg/utils';
	import { EInputType, type IFormField, type ActionResult } from '@aryagg/types';

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

		// Media / links
		logo,
		homeHref = '/',
		forgotPasswordHref = '/forgot-password',
		signUpHref = '/register',
		backgroundImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80',

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
		headerSlot,
		formSlot,
		footerSlot,
		errorSlot,

		// CSS class overrides
		class: klass = '',
		overlayClass,
		cardClass,
		titleClass,
		subtitleClass,
		formClass,
	}: LoginBaseProps & {
		backgroundImage?: string;
		overlayClass?: string;
		cardClass?: string;
	} = $props();

	let emailField = $state<IFormField>(
		untrack(() => ({
			key: 'email',
			id: 'login-cover-email',
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
			id: 'login-cover-password',
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
			id: 'login-cover-remember-me',
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
</script>

<div
	class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12 {klass}"
	style="background-image: url('{backgroundImage}')"
>
	<div class="absolute inset-0 bg-black/50 {overlayClass ?? ''}" aria-hidden="true"></div>

	<div class="relative z-10 w-full max-w-md">
		{#if logoSlot}
			{@render logoSlot()}
		{:else if logo || appName}
			<a href={homeHref} class="mb-8 flex items-center justify-center gap-2">
				{#if logo}
					<img src={logo} alt={appName} class="h-6 w-auto" />
				{:else}
					<span class="text-xl leading-none text-white">✦</span>
				{/if}
				<span class="text-lg font-semibold tracking-wide text-white">{appName}</span>
			</a>
		{/if}

		<div
			class="bg-surface-primary/95 rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-sm {cardClass ??
				''}"
		>
			{#if headerSlot}
				{@render headerSlot()}
			{:else}
				<div class="mb-8 text-center">
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
							<label for="login-cover-password" class="text-content-primary text-sm font-medium">
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

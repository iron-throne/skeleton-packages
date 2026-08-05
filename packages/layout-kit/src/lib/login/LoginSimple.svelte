<script lang="ts">
	import { untrack } from 'svelte';
	import { Alert, Card, Input } from '@aryagg/ui-kit';
	import { enhance } from '@aryagg/utils';
	import { EInputType, type IFormField, type ActionResult } from '@aryagg/types';
	import type { LoginCredentials, LoginBaseProps } from './types';

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
		showAmbientBackground = true,

		// Slots
		logoSlot,
		headerSlot,
		formSlot,
		footerSlot,
		errorSlot,

		// CSS class overrides
		class: klass = '',
		cardClass,
		titleClass,
		subtitleClass,
		formClass
	}: LoginBaseProps & {
		showAmbientBackground?: boolean;
		cardClass?: string;
	} = $props();

	let emailField = $state<IFormField>(
		untrack(() => ({
			key: 'email',
			id: 'login-email',
			type: EInputType.EMAIL,
			label: emailLabel,
			placeholder: emailPlaceholder,
			required: true,
			attributes: { name: 'email', autocomplete: 'email' }
		}))
	);

	let passwordField = $state<IFormField>(
		untrack(() => ({
			key: 'password',
			id: 'login-password',
			type: EInputType.PASSWORD,
			label: passwordLabel,
			placeholder: passwordPlaceholder,
			required: true,
			hideLabel: true,
			attributes: { name: 'password', autocomplete: 'current-password' }
		}))
	);

	let rememberMeField = $state<IFormField>(
		untrack(() => ({
			key: 'rememberMe',
			id: 'login-remember-me',
			type: EInputType.CHECKBOX,
			label: rememberMeLabel,
			placeholder: rememberMeLabel,
			hideLabel: true,
			attributes: { name: 'rememberMe' }
		}))
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
				rememberMe: formData.get('rememberMe') === 'on'
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

<div class="bg-surface-tertiary flex min-h-screen items-center justify-center px-4 py-12 {klass}">
	{#if showAmbientBackground}
		<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			<div class="bg-accent/5 absolute -top-32 -left-32 size-96 rounded-full blur-3xl"></div>
			<div class="bg-info/5 absolute -right-24 -bottom-24 size-80 rounded-full blur-3xl"></div>
		</div>
	{/if}

	<div class="w-full max-w-md">
		{#if logoSlot}
			{@render logoSlot()}
		{:else if logo || appName}
			<a href={homeHref} class="mb-8 flex items-center justify-center gap-2">
				{#if logo}
					<img src={logo} alt={appName} class="h-6 w-auto" />
				{:else}
					<span class="text-accent text-xl leading-none">✦</span>
				{/if}
				<span class="text-content-primary text-lg font-semibold tracking-wide">{appName}</span>
			</a>
		{/if}

		<div class="card p-7 {cardClass}">
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
							<label for="login-password" class="text-content-primary text-sm font-medium">
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
							<span class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
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

<script lang="ts">
	import type { FooterNewsletterProps } from './types';

	let {
		brand = 'App',
		logo,
		logoAlt = brand,
		homeHref = '/',
		description = 'Useful updates, thoughtfully delivered.',
		copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
		legalLinks = [],
		socialLinks = [],
		brandSlot,
		klass = '',
		parentKlass = '',
		title = 'Stay in the loop',
		subtitle = 'Product news and practical tips, once a month.',
		emailPlaceholder = 'you@example.com',
		submitText = 'Subscribe',
		onSubscribe,
		loading = $bindable(false),
		successMessage = 'Thanks for subscribing.'
	}: FooterNewsletterProps = $props();

	let email = $state('');
	let submitted = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!email || !onSubscribe) return;
		loading = true;
		try {
			await onSubscribe(email);
			submitted = true;
			email = '';
		} finally {
			loading = false;
		}
	}
</script>

<footer class="bg-[var(--text-primary)] text-on-accent {klass}">
	<div class="mx-auto max-w-7xl px-6 py-12 lg:py-16 {parentKlass}">
		<div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
			<div>
				{#if brandSlot}{@render brandSlot()}{:else}<a
						href={homeHref}
						class="flex items-center gap-2 text-lg font-semibold"
						>{#if logo}<img src={logo} alt={logoAlt} class="h-8 w-auto" />{/if}<span>{brand}</span
						></a
					>{/if}
				{#if description}<p class="mt-4 max-w-md text-sm leading-6 opacity-75">
						{description}
					</p>{/if}
				{#if socialLinks.length}<nav class="mt-5 flex gap-4" aria-label="Social links">
						{#each socialLinks as link (link.label)}<a
								class="text-sm opacity-75 transition-opacity hover:opacity-100"
								href={link.href}>{link.label}</a
							>{/each}
					</nav>{/if}
			</div>
			<div>
				<h2 class="text-xl font-semibold">{title}</h2>
				<p class="mt-2 text-sm opacity-75">{subtitle}</p>
				<form class="mt-5 flex flex-col gap-3 sm:flex-row" onsubmit={submit}>
					<label class="sr-only" for="footer-newsletter-email">Email address</label>
					<input
						id="footer-newsletter-email"
						type="email"
						required
						bind:value={email}
						placeholder={emailPlaceholder}
						class="min-w-0 flex-1 rounded-lg bg-surface-primary px-4 py-3 text-sm text-primary outline-none placeholder:text-tertiary focus:ring-2 focus:ring-accent"
					/>
					<button
						type="submit"
						disabled={loading || !onSubscribe}
						class="bg-accent text-on-accent rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
						>{loading ? 'Submitting…' : submitText}</button
					>
				</form>
				{#if submitted}<p class="mt-3 text-sm" aria-live="polite">{successMessage}</p>{/if}
			</div>
		</div>
		<div
			class="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:justify-between"
		>
			<p class="text-xs opacity-60">{copyright}</p>
			<nav class="flex gap-4" aria-label="Legal links">
				{#each legalLinks as link (link.label)}<a
						class="text-xs opacity-60 hover:opacity-100"
						href={link.href}>{link.label}</a
					>{/each}
			</nav>
		</div>
	</div>
</footer>

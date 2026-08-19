<script lang="ts">
	import type { FooterBaseProps } from './types';

	let {
		brand = 'App',
		logo,
		logoAlt = brand,
		homeHref = '/',
		copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
		legalLinks = [],
		socialLinks = [],
		brandSlot,
		class: klass = ''
	}: FooterBaseProps = $props();
</script>

<footer class="border-border-primary bg-surface-primary border-t {klass}">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-8 sm:flex-row"
	>
		<div
			class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center sm:justify-start sm:text-left"
		>
			{#if brandSlot}
				{@render brandSlot()}
			{:else}
				<a href={homeHref} class="flex items-center gap-2 font-semibold text-primary">
					{#if logo}<img src={logo} alt={logoAlt} class="h-7 w-auto" />{/if}
					<span>{brand}</span>
				</a>
			{/if}
			<p class="text-xs text-tertiary">{copyright}</p>
		</div>

		<div class="flex flex-col items-center gap-3 sm:items-end">
			{#if socialLinks.length}
				<nav class="flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Social links">
					{#each socialLinks as link (link.label)}
						<a
							class="text-sm text-secondary transition-colors hover:text-accent"
							href={link.href}
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noreferrer' : undefined}
						>
							{#if link.icon}{@render link.icon()}{:else}{link.label}{/if}
							{#if link.icon}<span class="sr-only">{link.label}</span>{/if}
						</a>
					{/each}
				</nav>
			{/if}
			{#if legalLinks.length}
				<nav class="flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Legal links">
					{#each legalLinks as link (link.label)}
						<a
							class="text-xs text-tertiary transition-colors hover:text-accent"
							href={link.href}
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noreferrer' : undefined}>{link.label}</a
						>
					{/each}
				</nav>
			{/if}
		</div>
	</div>
</footer>

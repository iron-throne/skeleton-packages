<script lang="ts">
	import type { FooterBaseProps, FooterLinkGroup } from './types';

	let {
		brand = 'App',
		logo,
		logoAlt = brand,
		homeHref = '/',
		description = 'Tools and resources that help your team do its best work.',
		copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
		legalLinks = [],
		socialLinks = [],
		brandSlot,
		class: klass = '',
		groups = []
	}: FooterBaseProps & { groups?: FooterLinkGroup[] } = $props();
</script>

<footer class="border-border-primary bg-surface-primary border-t {klass}">
	<div class="mx-auto max-w-7xl px-6 py-12 lg:py-16">
		<div class="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
			<div class="max-w-sm">
				{#if brandSlot}{@render brandSlot()}{:else}
					<a href={homeHref} class="flex items-center gap-2 text-lg font-semibold text-primary">
						{#if logo}<img src={logo} alt={logoAlt} class="h-8 w-auto" />{/if}<span>{brand}</span>
					</a>
				{/if}
				{#if description}<p class="mt-4 text-sm leading-6 text-secondary">
						{description}
					</p>{/if}
				{#if socialLinks.length}<nav class="mt-5 flex flex-wrap gap-4" aria-label="Social links">
						{#each socialLinks as link (link.label)}<a
								class="text-sm text-secondary hover:text-accent"
								href={link.href}
								target={link.external ? '_blank' : undefined}
								rel={link.external ? 'noreferrer' : undefined}>{link.label}</a
							>{/each}
					</nav>{/if}
			</div>
			<nav class="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="Footer navigation">
				{#each groups as group (group.title)}
					<div>
						<h2 class="text-sm font-semibold text-primary">{group.title}</h2>
						<ul class="mt-4 space-y-3">
							{#each group.links as link (link.label)}<li>
									<a
										class="text-sm text-secondary transition-colors hover:text-accent"
										href={link.href}
										target={link.external ? '_blank' : undefined}
										rel={link.external ? 'noreferrer' : undefined}>{link.label}</a
									>
								</li>{/each}
						</ul>
					</div>
				{/each}
			</nav>
		</div>
		<div
			class="border-border-primary mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="text-xs text-tertiary">{copyright}</p>
			<nav class="flex flex-wrap gap-4" aria-label="Legal links">
				{#each legalLinks as link (link.label)}<a
						class="text-xs text-tertiary hover:text-accent"
						href={link.href}>{link.label}</a
					>{/each}
			</nav>
		</div>
	</div>
</footer>

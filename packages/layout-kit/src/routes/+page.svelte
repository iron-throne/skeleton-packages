<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import type { NavItem, HeaderVariant } from '$lib/header/types.js';

	const items: NavItem[] = [
		{ label: 'Home', href: '/' },
		{
			label: 'Products',
			children: [
				{ label: 'UI Kit', href: '/ui-kit' },
				{
					label: 'Layout Kit',
					children: [
						{ label: 'Header', href: '/header' },
						{ label: 'Sidebar', href: '/sidebar' },
					],
				},
				{ label: 'Theme', href: '/theme', badge: 'New' },
			],
		},
		{
			label: 'Docs',
			children: [
				{ label: 'Getting Started', href: '/docs/start' },
				{ label: 'Components', href: '/docs/components' },
			],
		},
		{ label: 'Pricing', href: '/pricing' },
	];

	const headers: { id: HeaderVariant; label: string }[] = [
		{ id: 'default', label: 'default — brand left · nav left · actions right' },
		{ id: 'centered', label: 'centered — brand left · nav grid-centered · actions right' },
		{ id: 'stacked', label: 'stacked — row 1: brand+actions / row 2: nav' },
		{ id: 'minimal', label: 'minimal — brand · tagline · actions · no nav' },
	];

	let active = $state<HeaderVariant>('default');
</script>

<Header brand="Skeleton" variant={active} {items} tagline="Build beautiful UIs faster.">
	{#snippet actions()}
		<button class="btn-ghost btn-sm">Sign in</button>
		<button class="btn-primary btn-sm">Get started</button>
	{/snippet}
</Header>

<main class="mx-auto max-w-7xl px-4 py-10 flex flex-col gap-4">
	<h2>Header variants</h2>
	<div class="flex flex-col gap-2">
		{#each headers as h (h.id)}
			<button
				class="btn-sm text-left {active === h.id ? 'btn-primary' : 'btn-secondary'}"
				onclick={() => (active = h.id)}
			>
				{h.label}
			</button>
		{/each}
	</div>
</main>

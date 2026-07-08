<script lang="ts">
	import { Header, type HeaderVariant } from '$lib';
	import type { IMenu } from '@aryagg/types';

	const items: IMenu[] = [
		{ label: 'Home', href: '/', id:"home" },
		{
			label: 'Products',
			id:'products',
			children: [
				{ label: 'UI Kit', href: '/ui-kit', id: "kit" },
				{
					label: 'Layout Kit',
					id:"layout-kit",
					children: [
						{ label: 'Header', href: '/header', id:"header" },
						{ label: 'Topbar', href: '/topbar', id:"topbar" },
						{ label: 'Landing Page', href: '/landing-page', id:"landing-page" },
						{ label: 'Sidebar', href: '/sidebar', id:"sidebar" },
					],
				},
				{ label: 'Theme', href: '/theme', id:"theme" },
			],
		},
		{
			label: 'Docs',
			id:"docs",
			children: [
				{ label: 'Getting Started', href: '/docs/start', id:"getting-started" },
				{ label: 'Guides', href: '/docs/guides', id:"guides" },
				{ label: 'API Reference', href: '/docs/api', id:"api-reference" },
				{ label: 'Components', href: '/docs/components', id:"components" },
			],
		},
		{ label: 'Pricing', href: '/pricing', id:"pricing" },
		{ label: 'About', href: '/about', id:"about" },
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

<script lang="ts">
	import { type HeaderVariant } from '$lib';
	import Topbar from '$lib/topbar/Topbar.svelte';
	import { EInputType, ETheme, type IFormField, type IMenu, type InputValue } from '@aryagg/types';
	import {
		ArrowClockwise,
		ArrowCounterclockwise,
		BellFill,
		BoxArrowRight,
		CloudDownload,
		Eye,
		FileEarmark,
		FileEarmarkPlus,
		Folder2Open,
		Gear,
		Grid,
		Grid1x2,
		Grid3x3Gap,
		Grid3x3GapFill,
		LightningCharge,
		PaletteFill,
		Person,
		PrinterFill,
		Save2,
		Search,
		ShareFill,
		ShieldLock,
		Sliders,
		Stack,
		TextCenter,
		Window,
		XCircle
	} from 'svelte-bootstrap-icons';

	let searchField = $state<IFormField>({
		key: 'search',
		id: `search`,
		label: 'Search',
		hideLabel: true,
		placeholder: 'Search...',
		type: EInputType.SEARCH,
		icon: Search,
		classes: '',
		onChange: (value: InputValue) => updateSearch(value)
	});

	const items: IMenu[] = [
		{
			label: 'Dashboard',
			href: '/',
			id: 'dashboard',
			icon: Grid3x3Gap,
			selectedIcon: Grid3x3GapFill
		},
		{
			label: 'Products',
			id: 'products',
			children: [
				{ label: 'UI Kit', href: '/ui-kit', id: 'ui-kit' },
				{ label: 'Layout Kit', href: '/layout-kit', id: 'layout-kit' },
				{ label: 'Theme', href: '/theme', id: 'theme' }
			]
		},
		{ label: 'Settings', href: '/settings', id: 'settings', icon: Gear }
	];

	// Nested under the profile menu to show DropdownMenu's recursive `children` support.
	const profileItems: IMenu[] = [
		{ label: 'Profile', href: '/profile', id: 'profile', icon: Person },
		{
			label: 'Preferences',
			id: 'preferences',
			icon: Sliders,
			children: [
				{ label: 'Appearance', href: '#', id: 'appearance', icon: PaletteFill },
				{ label: 'Notifications', href: '#', id: 'notifications', icon: BellFill },
				{ label: 'Security', href: '#', id: 'security', icon: ShieldLock }
			]
		},
		{
			label: 'Logout',
			href: '/logout',
			id: 'logout',
			icon: BoxArrowRight,
			danger: true,
			divider: true
		}
	];

	const languages = [
		{ label: 'EN', value: 'en' },
		{ label: 'AR', value: 'ar' },
		{ label: 'ES', value: 'es' }
	];


	let theme = $state<ETheme>(ETheme.LIGHT);
	let currentLanguage = $state('en');

	$effect(() => {
		document.documentElement.classList.toggle('dark', theme === ETheme.DARK);
	});

	function toggleTheme(next?: ETheme) {
		if (next) theme = next;
	}

	function updateSearch(value?: InputValue) {
		console.log('🚀 ~ updateSearch ~ value:', value);
	}
</script>

{#snippet variantDemo(
	variant: HeaderVariant,
	title: string,
	description: string,
	menuLayout: 'stacked' | 'horizontal' = 'stacked'
)}
	<section class="border-b border-border-primary pb-8">
		<div class="container mx-auto px-4 pt-6 pb-3">
			<h2 class="text-primary text-sm font-semibold">{title}</h2>
			<p class="text-tertiary text-xs">{description}</p>
		</div>
		<div class="overflow-hidden rounded-lg border border-border-primary shadow-sm">
			<Topbar
				brand="Skeleton"
				{variant}
				menus={items}
				activeHref="/"
				{menuLayout}
				{languages}
				{currentLanguage}
				onLanguageChange={(value) => value && (currentLanguage = value)}
				{theme}
				onThemeChange={toggleTheme}
				userName="Romeo Juliet"
				profileLabel="Me"
				{profileItems}
				bind:searchField
			></Topbar>
		</div>
	</section>
{/snippet}

<main class="min-h-screen space-y-6 bg-surface-tertiary text-primary">
	<div class="container mx-auto px-4 py-6">
		<h1 class="text-primary text-lg font-bold">Topbar alignment variants</h1>
		<p class="text-tertiary text-sm">
			The same brand, nav, search and action content laid out with each of the four
			<code class="text-xs">HeaderVariant</code> options.
		</p>
	</div>

	{@render variantDemo('default', 'Default', 'Brand, search and nav inline, actions pushed to the right.')}
	{@render variantDemo('centered', 'Centered', 'Nav centered in the middle column between brand and actions.')}
	{@render variantDemo('stacked', 'Stacked', 'Brand row on top, nav centered in its own row below.')}
	{@render variantDemo('minimal', 'Minimal', 'Brand and actions only, with an optional centered tagline.')}

	<div class="container mx-auto px-4 pt-6 pb-3">
		<h1 class="text-primary text-lg font-bold">Nav item layouts</h1>
		<p class="text-tertiary text-sm">
			<code class="text-xs">HeaderNavList</code>'s <code class="text-xs">menuLayout</code> prop: icon
			stacked above the label, or icon and label arranged horizontally.
		</p>
	</div>

	{@render variantDemo(
		'default',
		'Stacked nav items',
		'Icon on top, label below — compact, works well in a tab-style bar.',
		'stacked'
	)}
	{@render variantDemo(
		'default',
		'Horizontal nav items',
		'Icon and label side by side — reads more like a traditional nav link.',
		'horizontal'
	)}
</main>

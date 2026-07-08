<script lang="ts">
	import { Header, Topbar, type HeaderVariant } from '$lib';
	import { ETheme, type IMenu } from '@aryagg/types';
	import {
		BoxArrowRight,
		Gear,
		Grid3x3Gap,
		Grid3x3GapFill,
		LightningCharge,
		Person,
		Search
	} from 'svelte-bootstrap-icons';

	const items: IMenu[] = [
		{ label: 'Dashboard', href: '/', id: 'dashboard', icon: Grid3x3Gap, selectedIcon: Grid3x3GapFill },
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

	const profileItems: IMenu[] = [
		{ label: 'Profile', href: '/profile', id: 'profile', icon: Person },
		{ label: 'Logout', href: '/logout', id: 'logout', icon: BoxArrowRight, danger: true, divider: true }
	];

	const languages = [
		{ label: 'EN', value: 'en' },
		{ label: 'AR', value: 'ar' },
		{ label: 'ES', value: 'es' }
	];

	const variants: { id: HeaderVariant; label: string }[] = [
		{ id: 'default', label: 'Default' },
		{ id: 'centered', label: 'Centered' },
		{ id: 'stacked', label: 'Stacked' },
		{ id: 'minimal', label: 'Minimal' }
	];

	let theme = $state<ETheme>(ETheme.LIGHT);
	let currentLanguage = $state('en');
	let activeVariant = $state<HeaderVariant>('default');

	function toggleTheme(next?: ETheme) {
		if (next) theme = next;
	}

	function updateSearch(value?: string) {
	}
</script>

<main class="bg-surface-primary text-primary min-h-screen">
	<section class="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8">
		<div class="flex flex-col gap-2">
			<p class="text-accent text-xs font-semibold tracking-widest uppercase">Layout Kit</p>
			<h1 class="text-3xl font-bold">Header and Topbar Scenarios</h1>
			<p class="text-secondary max-w-2xl text-sm">
				Every combination below uses the same combined header API: built-in search, custom search slot,
				no search, built-in profile menu, custom profile slot, and no profile.
			</p>
		</div>

		<section class="flex flex-col gap-3">
			<h2 class="text-lg font-semibold">Variant Switcher</h2>
			<div class="flex flex-wrap gap-2">
				{#each variants as variant (variant.id)}
					<button
						class="btn-sm {activeVariant === variant.id ? 'btn-primary' : 'btn-secondary'}"
						onclick={() => (activeVariant = variant.id)}
					>
						{variant.label}
					</button>
				{/each}
			</div>
			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Skeleton"
					brandIcon={LightningCharge}
					variant={activeVariant}
					{items}
					activeHref="/"
					tagline="Build beautiful UIs faster."
					onSearchInput={updateSearch}
					{languages}
					{currentLanguage}
					onLanguageChange={(value) => value && (currentLanguage = value)}
					{theme}
					onThemeChange={toggleTheme}
					userName="Romeo Juliet"
					profileLabel="Me"
					{profileItems}
				>
					{#snippet actions()}
						<button class="btn-ghost btn-sm">Sign in</button>
						<button class="btn-primary btn-sm">Get started</button>
					{/snippet}
				</Header>
			</div>
		</section>

		<section class="flex flex-col gap-4">
			<h2 class="text-lg font-semibold">All Search and Profile Combinations</h2>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Built-in Search + Built-in Profile"
					variant="default"
					{items}
					activeHref="/settings"
					onSearchInput={updateSearch}
					{languages}
					{currentLanguage}
					onLanguageChange={(value) => value && (currentLanguage = value)}
					{theme}
					onThemeChange={toggleTheme}
					userName="Avery Stone"
					profileLabel="Avery"
					{profileItems}
				/>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Search Slot + Built-in Profile"
					variant="centered"
					{items}
					activeHref="/"
					{theme}
					onThemeChange={toggleTheme}
					userName="Mina Cole"
					profileLabel="Mina"
					{profileItems}
				>
					{#snippet searchSlot()}
						<label class="bg-surface-secondary flex min-w-72 items-center gap-2 rounded-md border border-border-primary px-3 py-2">
							<Search class="text-tertiary size-4" />
							<input class="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Custom search slot" />
							<span class="text-tertiary text-xs">Ctrl K</span>
						</label>
					{/snippet}
				</Header>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="No Search + Built-in Profile"
					variant="stacked"
					{items}
					activeHref="/"
					{theme}
					onThemeChange={toggleTheme}
					userName="Sam Rivera"
					profileLabel="Sam"
					{profileItems}
				/>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Built-in Search + Profile Slot"
					variant="default"
					{items}
					activeHref="/"
					onSearchInput={updateSearch}
					{theme}
					onThemeChange={toggleTheme}
				>
					{#snippet profileSlot()}
						<button class="btn-secondary btn-sm flex items-center gap-2">
							<Person class="size-4" />
							<span>Admin</span>
						</button>
					{/snippet}
				</Header>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Search Slot + Profile Slot"
					variant="minimal"
					tagline="Custom middle content remains available."
					{theme}
					onThemeChange={toggleTheme}
				>
					{#snippet searchSlot()}
						<div class="flex items-center gap-2">
							<input class="w-56 rounded-md border border-border-primary px-3 py-2 text-sm" placeholder="Slot search" />
							<button class="btn-primary btn-sm">Go</button>
						</div>
					{/snippet}
					{#snippet profileSlot()}
						<a href="/account" class="btn-ghost btn-sm flex items-center gap-2 no-underline">
							<Person class="size-4" />
							Account
						</a>
					{/snippet}
				</Header>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="Built-in Search + No Profile"
					variant="centered"
					{items}
					activeHref="/settings"
					onSearchInput={updateSearch}
					{languages}
					{currentLanguage}
					onLanguageChange={(value) => value && (currentLanguage = value)}
				/>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header brand="Search Slot + No Profile" variant="default" {items} activeHref="/">
					{#snippet searchSlot()}
						<button class="btn-secondary btn-sm flex items-center gap-2">
							<Search class="size-4" />
							Open search
						</button>
					{/snippet}
				</Header>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header
					brand="No Search + Profile Slot"
					variant="stacked"
					{items}
					activeHref="/"
					{languages}
					{currentLanguage}
					onLanguageChange={(value) => value && (currentLanguage = value)}
				>
					{#snippet profileSlot()}
						<div class="flex items-center gap-2">
							<span class="bg-accent size-2 rounded-full"></span>
							<button class="btn-ghost btn-sm">Team</button>
						</div>
					{/snippet}
				</Header>
			</div>

			<div class="rounded-lg border border-border-primary">
				<Header brand="No Search + No Profile" variant="minimal" tagline="Plain minimal header">
					{#snippet actions()}
						<button class="btn-primary btn-sm">Action</button>
					{/snippet}
				</Header>
			</div>
		</section>

		<section class="flex flex-col gap-4">
			<h2 class="text-lg font-semibold">Topbar Compatibility</h2>
			<div class="rounded-lg border border-border-primary">
				<Topbar
					brand="Topbar wrapper"
					menus={items}
					activeHref="/"
					onSearchInput={updateSearch}
					{theme}
					onThemeChange={toggleTheme}
					userName="Legacy User"
					profileLabel="User"
					{profileItems}
				/>
			</div>
		</section>
	</section>
</main>

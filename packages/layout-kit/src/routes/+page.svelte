<script lang="ts">
	import { Topbar, CollapsibleSidebar, LandingPageHero, LandingPageSearch } from '$lib';
	import { LoginSimple, LoginSplit, LoginCover, type LoginCredentials } from '$lib/login';
	import { ETheme, EInputType, type IMenu } from '@aryagg/types';
	import {
		HouseDoorFill,
		GearFill,
		PeopleFill,
		BarChartFill,
		FolderFill,
		FileEarmarkTextFill,
		LayoutTextWindow,
		LayoutSidebarInset,
		Window,
		BoxArrowInRight
	} from 'svelte-bootstrap-icons';

	// Shared placeholder logomark reused across every component preview below.
	const demoLogo =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232563eb'/%3E%3Ctext x='16' y='22' font-family='sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E";

	const sections = [
		{
			id: 'topbar',
			label: 'Topbar',
			icon: LayoutTextWindow,
			description: 'Responsive application header with brand, nav, search, language and profile menu.'
		},
		{
			id: 'sidebar',
			label: 'Collapsible Sidebar',
			icon: LayoutSidebarInset,
			description: 'Icon-rail navigation with grouped items, flyouts, dividers and disabled states.'
		},
		{
			id: 'landing',
			label: 'Landing Pages',
			icon: Window,
			description: 'High-impact public-facing hero and search-driven landing sections.'
		},
		{
			id: 'login',
			label: 'Login',
			icon: BoxArrowInRight,
			description: 'Simple, split and cover presentations sharing one base props API.'
		}
	] as const;

	let activeComponent = $state<(typeof sections)[number]['id']>('topbar');
	const activeSection = $derived(sections.find((s) => s.id === activeComponent)!);

	// ── Topbar demo ─────────────────────────────────────────────
	const topbarVariants = ['default', 'centered', 'stacked', 'minimal'] as const;
	const topbarMenuLayouts = ['stacked', 'horizontal'] as const;
	let topbarVariant = $state<(typeof topbarVariants)[number]>('default');
	let topbarMenuLayout = $state<(typeof topbarMenuLayouts)[number]>('stacked');
	let topbarTheme = $state<ETheme>(ETheme.LIGHT);
	let showLanguages = $state(true);
	let showProfileMenu = $state(true);
	let showSearchField = $state(true);
	let showTopbarLogo = $state(true);

	const topbarMenus: IMenu[] = [
		{ id: 'home', label: 'Home', icon: HouseDoorFill, selected: true },
		{ id: 'courses', label: 'Courses', icon: FolderFill, selected: true },
		{ id: 'reports', label: 'Reports', icon: BarChartFill, selected: true }
	];
	const topbarProfileItems: IMenu[] = [
		{ id: 'profile', label: 'Your profile', href: '#' },
		{ id: 'settings', label: 'Settings', href: '#' },
		{ id: 'divider', label: '', divider: true, href: '#' },
		{ id: 'logout', label: 'Sign out', href: '#' }
	];

	// ── Sidebar demo ─────────────────────────────────────────────
	const sidebarPositions = ['left', 'right'] as const;
	const sidebarCollapsedModes = ['icons', 'hide'] as const;
	let sidebarPosition = $state<(typeof sidebarPositions)[number]>('left');
	let sidebarCollapsedMode = $state<(typeof sidebarCollapsedModes)[number]>('icons');
	let sidebarCollapsed = $state(false);
	let sidebarCollapsible = $state(true);

	const sidebarMenus: IMenu[] = [
		{ id: 'dashboard', label: 'Dashboard', href: '#', icon: HouseDoorFill, selected: true },
		{
			id: 'catalog',
			label: 'Catalog',
			icon: FolderFill,
			children: [
				{ id: 'courses', label: 'Courses', href: '#' },
				{ id: 'categories', label: 'Categories', href: '#' }
			],
			divider: true
		},
		{
			id: 'people',
			label: 'People',
			icon: PeopleFill,
			children: [
				{ id: 'students', label: 'Students', href: '#' },
				{ id: 'instructors', label: 'Instructors', href: '#' }
			]
		},
		{ id: 'reports', label: 'Reports', href: '#', icon: BarChartFill },
		{ id: 'docs', label: 'Documents', href: '#', icon: FileEarmarkTextFill, disabled: true },
		{ id: 'settings', label: 'Settings', href: '#', icon: GearFill }
	];

	// ── Landing Pages demo ─────────────────────────────────────────────
	const landingVariants = ['hero', 'search'] as const;
	let activeLandingVariant = $state<(typeof landingVariants)[number]>('hero');
	let hideHeroDivider = $state(false);
	let showHeroLogo = $state(true);
	let showLandingSearchButton = $state(true);

	// ── Login demos ─────────────────────────────────────────────
	const loginVariants = ['simple', 'split', 'cover'] as const;
	let activeLoginVariant = $state<(typeof loginVariants)[number]>('simple');
	const loginImagePositions = ['left', 'right'] as const;
	let loginShowRememberMe = $state(true);
	let loginShowForgotPassword = $state(true);
	let loginShowSignUpLink = $state(true);
	let loginImagePosition = $state<(typeof loginImagePositions)[number]>('left');
	let demoLoading = $state(false);
	let demoError = $state('');

	async function handleDemoSubmit(credentials: LoginCredentials) {
		demoError = '';
		demoLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 800));
		demoLoading = false;

		if (credentials.password.length < 4) {
			demoError = 'Password must be at least 4 characters.';
			return;
		}

		console.log('[LoginDemo] submitted', credentials);
		alert(`Signed in as ${credentials.email} (remember me: ${credentials.rememberMe})`);
	}
</script>

<svelte:head>
	<title>Layout Kit · Component Showcase</title>
	<meta name="description" content="Live preview of every component in @aryagg/layout-kit." />
</svelte:head>

{#snippet PickerField(label: string, options: readonly string[], active: string, onPick: (v: any) => void)}
	<div>
		<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</p>
		<div class="flex flex-wrap gap-1.5">
			{#each options as opt (opt)}
				<button
					type="button"
					class="rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors {active === opt
						? 'bg-accent text-on-accent'
						: 'border border-border-primary bg-surface-primary text-secondary hover:bg-surface-tertiary'}"
					onclick={() => onPick(opt)}
				>
					{opt}
				</button>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet Toggle(label: string, checked: boolean, onToggle: () => void)}
	<label class="flex cursor-pointer items-center gap-2 text-sm text-secondary">
		<input type="checkbox" class="accent-accent" {checked} onchange={onToggle} />
		{label}
	</label>
{/snippet}

{#snippet PropsPanel(
	title: string,
	description: string,
	pickers: import('svelte').Snippet,
	toggles: import('svelte').Snippet
)}
	<div>
		<h2 class="text-xl font-bold text-primary">{title}</h2>
		<p class="mt-1 max-w-2xl text-sm text-secondary">{description}</p>
	</div>
	<div class="mt-4 rounded-xl border border-border-primary bg-surface-secondary p-4 sm:p-5">
		<div class="flex flex-wrap gap-x-8 gap-y-4">
			{@render pickers()}
		</div>
		<div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border-primary pt-4">
			{@render toggles()}
		</div>
	</div>
{/snippet}

<div class="min-h-screen bg-surface-tertiary text-primary lg:flex">
	<aside
		class="shrink-0 border-b border-border-primary bg-surface-primary lg:sticky lg:top-0 lg:h-screen lg:w-52 lg:border-r lg:border-b-0"
	>
		<div class="px-4 py-4">
			<h1 class="text-sm font-bold tracking-tight text-primary">@aryagg/layout-kit</h1>
			<p class="mt-0.5 text-[11px] text-tertiary">Component showcase</p>
		</div>
		<nav class="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Components">
			{#each sections as section (section.id)}
				<button
					type="button"
					onclick={() => (activeComponent = section.id)}
					class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors lg:w-full {activeComponent ===
					section.id
						? 'bg-accent text-on-accent'
						: 'text-secondary hover:bg-surface-tertiary hover:text-accent'}"
				>
					<section.icon class="size-4 shrink-0" />
					{section.label}
				</button>
			{/each}
		</nav>
	</aside>

	<main class="min-w-0 flex-1 px-4 py-6 sm:px-8">
		<!-- TOPBAR -->
		<section class="flex flex-col gap-4" class:hidden={activeComponent !== 'topbar'}>
			{#snippet topbarPickers()}
				{@render PickerField('variant', topbarVariants, topbarVariant, (v) => (topbarVariant = v))}
				{@render PickerField('menuLayout', topbarMenuLayouts, topbarMenuLayout, (v) => (topbarMenuLayout = v))}
			{/snippet}
			{#snippet topbarToggles()}
				{@render Toggle('logoSrc', showTopbarLogo, () => (showTopbarLogo = !showTopbarLogo))}
				{@render Toggle('searchField', showSearchField, () => (showSearchField = !showSearchField))}
				{@render Toggle('languages', showLanguages, () => (showLanguages = !showLanguages))}
				{@render Toggle('profileItems', showProfileMenu, () => (showProfileMenu = !showProfileMenu))}
			{/snippet}
			{@render PropsPanel(activeSection.label, activeSection.description, topbarPickers, topbarToggles)}

			<div class="overflow-hidden rounded-lg border border-border-primary">
				<Topbar
					variant={topbarVariant}
					brand="Acme"
					logoSrc={showTopbarLogo ? demoLogo : ''}
					tagline="Everything you need to learn, in one place."
					menus={topbarMenus}
					menuLayout={topbarMenuLayout}
					activeHref="#"
					searchField={showSearchField
						? { id: 'topbar-search', key: 'search', label: '', placeholder: 'Search…', type: EInputType.SEARCH }
						: undefined}
					languages={showLanguages ? [{ label: 'EN', value: 'en' }, { label: 'AR', value: 'ar' }] : []}
					currentLanguage="en"
					userName={showProfileMenu ? 'Jordan Lee' : ''}
					profileLabel={showProfileMenu ? 'Jordan Lee' : ''}
					profileItems={showProfileMenu ? topbarProfileItems : []}
					showThemeToggle
					bind:theme={topbarTheme}
				/>
				<div class="flex h-24 items-center justify-center bg-surface-tertiary text-sm text-tertiary">
					Page content renders below the topbar
				</div>
			</div>
		</section>

		<!-- SIDEBAR -->
		<section class="flex flex-col gap-4" class:hidden={activeComponent !== 'sidebar'}>
			{#snippet sidebarPickers()}
				{@render PickerField('position', sidebarPositions, sidebarPosition, (v) => (sidebarPosition = v))}
				{@render PickerField(
					'collapsedMode',
					sidebarCollapsedModes,
					sidebarCollapsedMode,
					(v) => (sidebarCollapsedMode = v)
				)}
			{/snippet}
			{#snippet sidebarToggles()}
				{@render Toggle('collapsible', sidebarCollapsible, () => (sidebarCollapsible = !sidebarCollapsible))}
				{@render Toggle('collapsed', sidebarCollapsed, () => (sidebarCollapsed = !sidebarCollapsed))}
			{/snippet}
			{@render PropsPanel(activeSection.label, activeSection.description, sidebarPickers, sidebarToggles)}

			<div class="overflow-hidden rounded-lg border border-border-primary">
				<div class="relative flex h-128">
					<CollapsibleSidebar
						menus={sidebarMenus}
						position={sidebarPosition}
						collapsedMode={sidebarCollapsedMode}
						collapsible={sidebarCollapsible}
						bind:collapsed={sidebarCollapsed}
						logosrc={demoLogo}
					>
						{#snippet headerSlot()}<span class="text-sm font-bold text-primary">Acme</span>{/snippet}
					</CollapsibleSidebar>
					<div class="flex flex-1 flex-col gap-4 bg-surface-tertiary p-6">
						<div class="grid grid-cols-3 gap-3">
							<div class="h-16 rounded-lg bg-surface-primary shadow-sm"></div>
							<div class="h-16 rounded-lg bg-surface-primary shadow-sm"></div>
							<div class="h-16 rounded-lg bg-surface-primary shadow-sm"></div>
						</div>
						<div class="flex-1 rounded-lg bg-surface-primary shadow-sm"></div>
					</div>
				</div>
			</div>
		</section>

		<!-- LANDING PAGES -->
		<section class="flex flex-col gap-4" class:hidden={activeComponent !== 'landing'}>
			{#snippet landingPickers()}
				{@render PickerField('variant', landingVariants, activeLandingVariant, (v) => (activeLandingVariant = v))}
			{/snippet}
			{#snippet landingToggles()}
				{#if activeLandingVariant === 'hero'}
					{@render Toggle('logo', showHeroLogo, () => (showHeroLogo = !showHeroLogo))}
					{@render Toggle('hideDivider', hideHeroDivider, () => (hideHeroDivider = !hideHeroDivider))}
				{:else}
					{@render Toggle(
						'showSearch',
						showLandingSearchButton,
						() => (showLandingSearchButton = !showLandingSearchButton)
					)}
				{/if}
			{/snippet}
			{@render PropsPanel(activeSection.label, activeSection.description, landingPickers, landingToggles)}

			<div class="overflow-hidden rounded-lg border border-border-primary">
				{#if activeLandingVariant === 'hero'}
					<div class="h-[520px] bg-surface-primary">
						<LandingPageHero
							title="Acme"
							heading="Build something great"
							highlight="great"
							description="Create beautiful, responsive layouts with flexible, ready-made components."
							ctaText="Get Started"
							hideDivider={hideHeroDivider}
							logo={showHeroLogo ? demoLogo : ''}
						/>
					</div>
				{:else}
					<div class="h-[80vh]">
						<LandingPageSearch
							title="Discover Your New Home"
							placeholder="City, address, or ZIP"
							buttonText="Search"
							showSearch={showLandingSearchButton}
							onSubmit={(value: string) => console.log('[LandingPageSearch] submitted', value)}
						/>
					</div>
				{/if}
			</div>
		</section>

		<!-- LOGIN -->
		<section class="flex flex-col gap-4" class:hidden={activeComponent !== 'login'}>
			{#snippet loginPickers()}
				{@render PickerField('variant', loginVariants, activeLoginVariant, (v) => (activeLoginVariant = v))}
				{#if activeLoginVariant === 'split'}
					{@render PickerField(
						'imagePosition',
						loginImagePositions,
						loginImagePosition,
						(v) => (loginImagePosition = v)
					)}
				{/if}
			{/snippet}
			{#snippet loginToggles()}
				{@render Toggle('showRememberMe', loginShowRememberMe, () => (loginShowRememberMe = !loginShowRememberMe))}
				{@render Toggle(
					'showForgotPassword',
					loginShowForgotPassword,
					() => (loginShowForgotPassword = !loginShowForgotPassword)
				)}
				{@render Toggle('showSignUpLink', loginShowSignUpLink, () => (loginShowSignUpLink = !loginShowSignUpLink))}
			{/snippet}
			{@render PropsPanel(activeSection.label, activeSection.description, loginPickers, loginToggles)}

			<div class="overflow-hidden rounded-lg border border-border-primary">
				{#if activeLoginVariant === 'simple'}
					<LoginSimple
						appName="Acme"
						logo={demoLogo}
						title="Welcome back"
						subtitle="Sign in to your Acme account"
						loading={demoLoading}
						error={demoError}
						showRememberMe={loginShowRememberMe}
						showForgotPassword={loginShowForgotPassword}
						showSignUpLink={loginShowSignUpLink}
						onSubmit={handleDemoSubmit}
					/>
				{:else if activeLoginVariant === 'split'}
					<LoginSplit
						appName="Acme"
						logo={demoLogo}
						title="Welcome back"
						subtitle="Sign in to your Acme account"
						panelHeading="Build something great"
						panelDescription="Sign in to pick up right where you left off."
						imagePosition={loginImagePosition}
						loading={demoLoading}
						error={demoError}
						showRememberMe={loginShowRememberMe}
						showForgotPassword={loginShowForgotPassword}
						showSignUpLink={loginShowSignUpLink}
						onSubmit={handleDemoSubmit}
					/>
				{:else}
					<LoginCover
						appName="Acme"
						logo={demoLogo}
						title="Welcome back"
						subtitle="Sign in to your Acme account"
						loading={demoLoading}
						error={demoError}
						showRememberMe={loginShowRememberMe}
						showForgotPassword={loginShowForgotPassword}
						showSignUpLink={loginShowSignUpLink}
						onSubmit={handleDemoSubmit}
					/>
				{/if}
			</div>
		</section>
	</main>
</div>

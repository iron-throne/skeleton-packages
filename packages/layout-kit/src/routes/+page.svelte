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
		FileEarmarkTextFill
	} from 'svelte-bootstrap-icons';

	// Shared placeholder logomark reused across every component preview below.
	const demoLogo =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232563eb'/%3E%3Ctext x='16' y='22' font-family='sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E";

	const sections = [
		{ id: 'topbar', label: 'Topbar' },
		{ id: 'sidebar', label: 'Collapsible Sidebar' },
		{ id: 'landing', label: 'Landing Pages' },
		{ id: 'login', label: 'Login' }
	] as const;

	let activeComponent = $state<(typeof sections)[number]['id']>('topbar');

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
	<meta
		name="description"
		content="Live preview of every component in @aryagg/layout-kit."
	/>
</svelte:head>

{#snippet SegButtons(options: readonly string[], active: string, onPick: (v: any) => void)}
	<div class="flex flex-wrap gap-1.5">
		{#each options as opt (opt)}
			<button
				type="button"
				class="rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors {active === opt
					? 'bg-blue-600 text-white'
					: 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}"
				onclick={() => onPick(opt)}
			>
				{opt}
			</button>
		{/each}
	</div>
{/snippet}

<div class="min-h-screen bg-white text-slate-900">
	<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
		<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
			<div>
				<h1 class="text-base font-bold tracking-tight">@aryagg/layout-kit</h1>
				<p class="text-xs text-slate-500">Select a component to preview it live</p>
			</div>
			<nav class="flex flex-wrap gap-1" aria-label="Components">
				{#each sections as section (section.id)}
					<button
						type="button"
						onclick={() => (activeComponent = section.id)}
						class="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {activeComponent === section.id
							? 'bg-blue-600 text-white'
							: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}"
					>
						{section.label}
					</button>
				{/each}
			</nav>
		</div>
	</header>

	<main class="px-4 py-8 sm:px-8 h-[90vh]">
		<!-- TOPBAR -->
		<section class="space-y-4" class:hidden={activeComponent !== 'topbar'}>
			<div>
				<h2 class="text-xl font-bold">Topbar</h2>
				<p class="mt-1 max-w-2xl text-sm text-slate-500">
					Responsive application header — brand, nav, search, language switch, theme toggle and profile menu, in 4 layout variants.
				</p>
			</div>

			<div class="flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">variant</p>
					{@render SegButtons(topbarVariants, topbarVariant, (v) => (topbarVariant = v))}
				</div>
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">menuLayout</p>
					{@render SegButtons(topbarMenuLayouts, topbarMenuLayout, (v) => (topbarMenuLayout = v))}
				</div>
				<div class="flex flex-wrap gap-x-5 gap-y-2 self-center">
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showTopbarLogo} /> logoSrc</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showSearchField} /> searchField</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showLanguages} /> languages</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showProfileMenu} /> profileItems</label>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border border-slate-200">
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
				<div class="flex h-24 items-center justify-center bg-slate-50 text-sm text-slate-400">Page content renders below the topbar</div>
			</div>
		</section>

		<!-- SIDEBAR -->
		<section class="space-y-4" class:hidden={activeComponent !== 'sidebar'}>
			<div>
				<h2 class="text-xl font-bold">Collapsible Sidebar</h2>
				<p class="mt-1 max-w-2xl text-sm text-slate-500">
					Icon-rail navigation sidebar with grouped items, flyouts, dividers, disabled states and left/right docking.
				</p>
			</div>

			<div class="flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">position</p>
					{@render SegButtons(sidebarPositions, sidebarPosition, (v) => (sidebarPosition = v))}
				</div>
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">collapsedMode</p>
					{@render SegButtons(sidebarCollapsedModes, sidebarCollapsedMode, (v) => (sidebarCollapsedMode = v))}
				</div>
				<div class="flex flex-wrap gap-x-5 gap-y-2 self-center">
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={sidebarCollapsible} /> collapsible</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={sidebarCollapsed} /> collapsed</label>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border border-slate-200">
				<div class="relative flex h-128">
					<CollapsibleSidebar
						menus={sidebarMenus}
						position={sidebarPosition}
						collapsedMode={sidebarCollapsedMode}
						collapsible={sidebarCollapsible}
						bind:collapsed={sidebarCollapsed}
						logosrc={demoLogo}
					>
						{#snippet headerSlot()}<span class="text-sm font-bold text-slate-900">Acme</span>{/snippet}
					</CollapsibleSidebar>
					<div class="flex flex-1 flex-col gap-4 bg-slate-50 p-6">
						<div class="grid grid-cols-3 gap-3">
							<div class="h-16 rounded-lg bg-white shadow-sm"></div>
							<div class="h-16 rounded-lg bg-white shadow-sm"></div>
							<div class="h-16 rounded-lg bg-white shadow-sm"></div>
						</div>
						<div class="flex-1 rounded-lg bg-white shadow-sm"></div>
					</div>
				</div>
			</div>
		</section>

		<!-- LANDING PAGES -->
		<section class="space-y-4" class:hidden={activeComponent !== 'landing'}>
			<div>
				<h2 class="text-xl font-bold">Landing Pages</h2>
				<p class="mt-1 max-w-2xl text-sm text-slate-500">
					Two presentation variants — <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">LandingPageHero</code>
					and <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">LandingPageSearch</code> — high-impact public-facing sections.
				</p>
			</div>

			<div class="flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">variant</p>
					{@render SegButtons(landingVariants, activeLandingVariant, (v) => (activeLandingVariant = v))}
				</div>
				<div class="flex flex-wrap gap-x-5 gap-y-2 self-center">
					{#if activeLandingVariant === 'hero'}
						<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showHeroLogo} /> logo</label>
						<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={hideHeroDivider} /> hideDivider</label>
					{:else}
						<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={showLandingSearchButton} /> showSearch</label>
					{/if}
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border border-slate-200 ">
				{#if activeLandingVariant === 'hero'}
					<div class="h-[80vh] bg-white">
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
		<section class="space-y-4" class:hidden={activeComponent !== 'login'}>
			<div>
				<h2 class="text-xl font-bold">Login</h2>
				<p class="mt-1 max-w-2xl text-sm text-slate-500">
					Three presentation variants — <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">LoginSimple</code>,
					<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">LoginSplit</code> and
					<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">LoginCover</code> — sharing one base props API.
				</p>
			</div>

			<div class="flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
				<div>
					<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">variant</p>
					{@render SegButtons(loginVariants, activeLoginVariant, (v) => (activeLoginVariant = v))}
				</div>
				{#if activeLoginVariant === 'split'}
					<div>
						<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">imagePosition</p>
						{@render SegButtons(loginImagePositions, loginImagePosition, (v) => (loginImagePosition = v))}
					</div>
				{/if}
				<div class="flex flex-wrap gap-x-5 gap-y-2 self-center">
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={loginShowRememberMe} /> showRememberMe</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={loginShowForgotPassword} /> showForgotPassword</label>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" class="accent-blue-600" bind:checked={loginShowSignUpLink} /> showSignUpLink</label>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border border-slate-200">
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

<script lang="ts">
	import {
		Topbar,
		HeaderNavList,
		ThemeToggle,
		LanguageSwitcher,
		ProfileMenu,
		CollapsibleSidebar,
		LandingPageHero,
		LandingPageSearch,
		ErrorSimple,
		ErrorOverlayIcon,
		ErrorCard,
		ErrorSplit
	} from '$lib';
	import { LoginSimple, LoginSplit, LoginCover, type LoginCredentials } from '$lib/login';
	import { ESwitchLayout, ETheme, HttpStatus, type IMenu } from '@aryagg/types';
	import { errorTitle, errorHint } from '@aryagg/utils';
	import type { Snippet } from 'svelte';
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
		BoxArrowInRight,
		ExclamationTriangleFill,
		ArrowLeft,
		ArrowRight
	} from 'svelte-bootstrap-icons';

	// Shared placeholder logomark reused across every component preview below.
	const demoLogo =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232563eb'/%3E%3Ctext x='16' y='22' font-family='sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E";

	const sections = [
		{
			id: 'topbar',
			label: 'Topbar',
			icon: LayoutTextWindow,
			description:
				'Responsive application header with brand, nav, search, language and profile menu.'
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
		},
		{
			id: 'errors',
			label: 'Error Pages',
			icon: ExclamationTriangleFill,
			description: 'Full-page 404 / 403 / 500 states with icon, title, hint and CTAs.'
		}
	] as const;

	// null = landing grid; otherwise the id of the component being viewed.
	let activeComponent = $state<(typeof sections)[number]['id'] | null>(null);
	const activeSection = $derived(sections.find((s) => s.id === activeComponent));

	// ── Topbar demo ─────────────────────────────────────────────
	const topbarModes = ['simple', 'advanced', 'config props'] as const;
	let topbarMode = $state<(typeof topbarModes)[number]>('simple');
	let topbarTheme = $state<ETheme>(ETheme.LIGHT);
	let showLanguages = $state(true);
	let showProfileMenu = $state(true);
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

	// ── Error Pages demo ─────────────────────────────────────────────
	const errorVariants = ['simple', 'overlay', 'card', 'split'] as const;
	let activeErrorVariant = $state<(typeof errorVariants)[number]>('simple');
	const errorStatusLabels = ['404', '403', '500', '400'] as const;
	const errorStatusByLabel: Record<(typeof errorStatusLabels)[number], HttpStatus> = {
		'404': HttpStatus.NOT_FOUND,
		'403': HttpStatus.FORBIDDEN,
		'500': HttpStatus.INTERNAL_SERVER_ERROR,
		'400': HttpStatus.BAD_REQUEST
	};
	let errorStatusLabel = $state<(typeof errorStatusLabels)[number]>('404');
	let errorHideIcon = $state(false);
	const errorStatus = $derived(errorStatusByLabel[errorStatusLabel]);
	const errorPageTitle = $derived(errorTitle(errorStatus));
	const errorPageHint = $derived(
		errorHint(errorStatus, 'Please check your request and try again.')
	);
</script>

<svelte:head>
	<title>Layout Kit · Component Showcase</title>
	<meta name="description" content="Live preview of every component in @aryagg/layout-kit." />
</svelte:head>

{#snippet PickerField(
	label: string,
	options: readonly string[],
	active: string,
	onPick: (v: any) => void
)}
	<div>
		<p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</p>
		<div class="flex flex-wrap gap-1.5">
			{#each options as opt (opt)}
				<button
					type="button"
					class="rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors {active ===
					opt
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

{#snippet OptionsPanel(pickers: Snippet, toggles: Snippet)}
	<div class="rounded-xl border border-border-primary bg-surface-primary p-5 sm:p-6">
		<div class="flex flex-wrap gap-x-8 gap-y-4">
			{@render pickers()}
			{@render toggles()}
		</div>
	</div>
{/snippet}

<div class="min-h-screen bg-surface-tertiary text-primary">
	<header
		class="sticky top-0 z-10 border-b border-border-primary bg-surface-primary/95 backdrop-blur"
	>
		<div class="px-4 py-5 sm:px-8 lg:px-12">
			{#if activeSection}
				<button
					type="button"
					class="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary transition-colors hover:text-accent"
					onclick={() => (activeComponent = null)}
				>
					<ArrowLeft class="size-3.5" />
					All components
				</button>
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
					>
						<activeSection.icon class="size-5" />
					</div>
					<div>
						<h1 class="text-lg font-bold text-primary">{activeSection.label}</h1>
						<p class="text-sm text-secondary">{activeSection.description}</p>
					</div>
				</div>
			{:else}
				<h1 class="text-2xl font-bold tracking-tight text-primary">@aryagg/layout-kit</h1>
				<p class="mt-1 text-sm text-secondary">
					Browse every component below, then open one to preview it live and try all of its options.
				</p>
			{/if}
		</div>
	</header>

	<main class="px-4 py-8 sm:px-8 lg:px-12">
		{#if !activeSection}
			<!-- COMPONENT GRID -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each sections as section (section.id)}
					<button
						type="button"
						class="group flex flex-col items-start gap-3 rounded-xl border border-border-primary bg-surface-primary p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
						onclick={() => (activeComponent = section.id)}
					>
						<div
							class="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent"
						>
							<section.icon class="size-5" />
						</div>
						<div class="w-full">
							<h2 class="font-semibold text-primary">{section.label}</h2>
							<p class="mt-1 text-sm text-secondary whitespace-pre-line text-secondary">
								{section.description}
							</p>
						</div>
						<span
							class="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100"
						>
							View component
							<ArrowRight class="size-3.5" />
						</span>
					</button>
				{/each}
			</div>

			<section class="mt-8">
				<div class="mb-4 flex items-end justify-between gap-4">
					<div>
						<h2 class="text-lg font-bold text-primary">Topbar example</h2>
						<p class="mt-1 text-sm text-secondary">
							A live preview of the default application header.
						</p>
					</div>
					<button
						type="button"
						class="shrink-0 text-xs font-semibold text-accent hover:underline"
						onclick={() => (activeComponent = 'topbar')}
					>
						View all options
					</button>
				</div>

				<div
					class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
				>
					<Topbar
						brand="Acme"
						logoSrc={demoLogo}
						tagline="Everything you need to learn, in one place."
						menus={topbarMenus}
						activeHref="#"
						searchField={{
							id: 'home-topbar-search',
							key: 'search',
							label: '',
							placeholder: 'Search…',
							type: EInputType.SEARCH
						}}
						languages={[
							{ label: 'EN', value: 'en' },
							{ label: 'AR', value: 'ar' }
						]}
						currentLanguage="en"
						userName="Jordan Lee"
						profileLabel="Jordan Lee"
						profileItems={topbarProfileItems}
						showThemeToggle
					/>
					<div
						class="flex h-20 items-center justify-center bg-surface-tertiary text-sm text-tertiary"
					>
						Page content renders below the topbar
					</div>
				</div>
			</section>
		{:else}
			<div class="flex flex-col gap-6 lg:flex-row lg:items-start">
				<nav
					class="flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
					aria-label="Components"
				>
					{#each sections as section (section.id)}
						<button
							type="button"
							onclick={() => (activeComponent = section.id)}
							class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:w-full {activeComponent ===
							section.id
								? 'bg-accent text-on-accent'
								: 'text-secondary hover:bg-surface-primary hover:text-accent'}"
						>
							<section.icon class="size-4 shrink-0" />
							{section.label}
						</button>
					{/each}
				</nav>

				<div class="min-w-0 flex-1">
					{#if activeComponent === 'topbar'}
						<!-- TOPBAR -->
						<div class="flex flex-col gap-6">
							{@render OptionsPanel(topbarPickers, topbarToggles)}
							<div
								class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
							>
								{#if topbarMode === 'simple'}
									<Topbar title="Acme" logoSrc={showTopbarLogo ? demoLogo : ''} />
								{:else if topbarMode === 'advanced'}
									<Topbar title="Acme" logoSrc={showTopbarLogo ? demoLogo : ''}>
										<HeaderNavList items={topbarMenus} activeHref="#" layout={ESwitchLayout.HORIZONTAL} />
										{#if showLanguages}
											<LanguageSwitcher
												languages={[
													{ label: 'EN', value: 'en' },
													{ label: 'AR', value: 'ar' }
												]}
												currentLanguage="en"
											/>
										{/if}
										<ThemeToggle bind:theme={topbarTheme} />
										{#if showProfileMenu}
											<ProfileMenu
												name="Jordan Lee"
												label="Jordan Lee"
												items={topbarProfileItems}
											/>
										{/if}
									</Topbar>
								{:else}
									<!-- Same look as "advanced", but nav/language/theme/profile are all
									     wired through Topbar's own config-object props instead of
									     composed by hand in children. -->
									<Topbar
										title="Acme"
										logoSrc={showTopbarLogo ? demoLogo : ''}
										nav={{ items: topbarMenus, activeHref: '#', layout: ESwitchLayout.HORIZONTAL }}
										languageSwitch={showLanguages
											? {
													languages: [
														{ label: 'EN', value: 'en' },
														{ label: 'AR', value: 'ar' }
													],
													currentLanguage: 'en'
												}
											: undefined}
										themeSwitch={{
											theme: topbarTheme,
											onThemeChange: (t) => (topbarTheme = t ?? topbarTheme)
										}}
										profile={showProfileMenu
											? { name: 'Jordan Lee', label: 'Jordan Lee', items: topbarProfileItems }
											: undefined}
									/>
								{/if}
								<div
									class="flex h-24 items-center justify-center bg-surface-tertiary text-sm text-tertiary"
								>
									Page content renders below the topbar
								</div>
							</div>

							{#snippet topbarPickers()}
								{@render PickerField('mode', topbarModes, topbarMode, (v) => (topbarMode = v))}
							{/snippet}
							{#snippet topbarToggles()}
								{@render Toggle(
									'logoSrc',
									showTopbarLogo,
									() => (showTopbarLogo = !showTopbarLogo)
								)}
								{#if topbarMode !== 'simple'}
									{@render Toggle(
										'languages',
										showLanguages,
										() => (showLanguages = !showLanguages)
									)}
									{@render Toggle(
										'profileMenu',
										showProfileMenu,
										() => (showProfileMenu = !showProfileMenu)
									)}
								{/if}
							{/snippet}
						</div>
					{:else if activeComponent === 'sidebar'}
						<!-- SIDEBAR -->
						<div class="flex flex-col gap-6">
							{@render OptionsPanel(sidebarPickers, sidebarToggles)}

							<div
								class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
							>
								<div class="relative flex h-128">
									<CollapsibleSidebar
										menus={sidebarMenus}
										position={sidebarPosition}
										collapsedMode={sidebarCollapsedMode}
										collapsible={sidebarCollapsible}
										bind:collapsed={sidebarCollapsed}
										logosrc={demoLogo}
									>
										{#snippet headerSlot()}<span class="text-sm font-bold text-primary">Acme</span
											>{/snippet}
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

							{#snippet sidebarPickers()}
								{@render PickerField(
									'position',
									sidebarPositions,
									sidebarPosition,
									(v) => (sidebarPosition = v)
								)}
								{@render PickerField(
									'collapsedMode',
									sidebarCollapsedModes,
									sidebarCollapsedMode,
									(v) => (sidebarCollapsedMode = v)
								)}
							{/snippet}
							{#snippet sidebarToggles()}
								{@render Toggle(
									'collapsible',
									sidebarCollapsible,
									() => (sidebarCollapsible = !sidebarCollapsible)
								)}
								{@render Toggle(
									'collapsed',
									sidebarCollapsed,
									() => (sidebarCollapsed = !sidebarCollapsed)
								)}
							{/snippet}
						</div>
					{:else if activeComponent === 'landing'}
						<!-- LANDING PAGES -->
						<div class="flex flex-col gap-6">
							{@render OptionsPanel(landingPickers, landingToggles)}

							<div
								class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
							>
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
											onSubmit={(value: string) =>
												console.log('[LandingPageSearch] submitted', value)}
										/>
									</div>
								{/if}
							</div>

							{#snippet landingPickers()}
								{@render PickerField(
									'variant',
									landingVariants,
									activeLandingVariant,
									(v) => (activeLandingVariant = v)
								)}
							{/snippet}
							{#snippet landingToggles()}
								{#if activeLandingVariant === 'hero'}
									{@render Toggle('logo', showHeroLogo, () => (showHeroLogo = !showHeroLogo))}
									{@render Toggle(
										'hideDivider',
										hideHeroDivider,
										() => (hideHeroDivider = !hideHeroDivider)
									)}
								{:else}
									{@render Toggle(
										'showSearch',
										showLandingSearchButton,
										() => (showLandingSearchButton = !showLandingSearchButton)
									)}
								{/if}
							{/snippet}
						</div>
					{:else if activeComponent === 'login'}
						<!-- LOGIN -->
						<div class="flex flex-col gap-6">
							{@render OptionsPanel(loginPickers, loginToggles)}

							<div
								class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
							>
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

							{#snippet loginPickers()}
								{@render PickerField(
									'variant',
									loginVariants,
									activeLoginVariant,
									(v) => (activeLoginVariant = v)
								)}
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
								{@render Toggle(
									'showRememberMe',
									loginShowRememberMe,
									() => (loginShowRememberMe = !loginShowRememberMe)
								)}
								{@render Toggle(
									'showForgotPassword',
									loginShowForgotPassword,
									() => (loginShowForgotPassword = !loginShowForgotPassword)
								)}
								{@render Toggle(
									'showSignUpLink',
									loginShowSignUpLink,
									() => (loginShowSignUpLink = !loginShowSignUpLink)
								)}
							{/snippet}
						</div>
					{:else if activeComponent === 'errors'}
						<!-- ERROR PAGES -->
						<div class="flex flex-col gap-6">
							{@render OptionsPanel(errorPickers, errorToggles)}

							<div
								class="h-[600px] overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm"
							>
								{#if activeErrorVariant === 'simple'}
									<ErrorSimple
										status={errorStatus}
										title={errorPageTitle}
										hint={errorPageHint}
										hideIcon={errorHideIcon}
										mainKlass="min-h-full!"
									/>
								{:else if activeErrorVariant === 'overlay'}
									<ErrorOverlayIcon
										status={errorStatus}
										title={errorPageTitle}
										hint={errorPageHint}
										hideIcon={errorHideIcon}
										mainKlass="min-h-full!"
									/>
								{:else if activeErrorVariant === 'card'}
									<ErrorCard
										status={errorStatus}
										title={errorPageTitle}
										hint={errorPageHint}
										hideIcon={errorHideIcon}
										mainKlass="min-h-full!"
									/>
								{:else}
									<ErrorSplit
										status={errorStatus}
										title={errorPageTitle}
										hint={errorPageHint}
										hideIcon={errorHideIcon}
										mainKlass="min-h-full!"
									/>
								{/if}
							</div>

							{#snippet errorPickers()}
								{@render PickerField(
									'variant',
									errorVariants,
									activeErrorVariant,
									(v) => (activeErrorVariant = v)
								)}
								{@render PickerField(
									'status',
									errorStatusLabels,
									errorStatusLabel,
									(v) => (errorStatusLabel = v)
								)}
							{/snippet}
							{#snippet errorToggles()}
								{@render Toggle('hideIcon', errorHideIcon, () => (errorHideIcon = !errorHideIcon))}
							{/snippet}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

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

	const catalog = [
		{
			key: 'topbar',
			label: 'Topbar',
			desc: 'Top app-bar with brand, nav, search and actions.',
			count: '4 variants',
			index: '01'
		},
		{
			key: 'sidebar',
			label: 'Collapsible Sidebar',
			desc: 'Icon-rail sidebar with grouped navigation.',
			count: '2 positions',
			index: '02'
		},
		{
			key: 'landing',
			label: 'Landing Pages',
			desc: 'Production-ready marketing sections.',
			count: '2 sections',
			index: '03'
		},
		{
			key: 'login',
			label: 'Login',
			desc: 'Simple, split and cover auth screens.',
			count: '3 variants',
			index: '04'
		}
	] as const;

	let activeSection = $state<(typeof catalog)[number]['key']>('topbar');
	let topbarVariant = $state<'default' | 'centered' | 'stacked' | 'minimal'>('default');
	let topbarTheme = $state<ETheme>(ETheme.LIGHT);
	let showLanguages = $state(true);
	let showProfileMenu = $state(true);
	let showSearchField = $state(true);

	const topbarVariants = ['default', 'centered', 'stacked', 'minimal'] as const;
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

	const sidebarPositions = ['left', 'right'] as const;
	const sidebarCollapsedModes = ['icons', 'hide'] as const;
	let sidebarPosition = $state<(typeof sidebarPositions)[number]>('left');
	let sidebarCollapsedMode = $state<(typeof sidebarCollapsedModes)[number]>('icons');
	let sidebarCollapsed = $state(false);

	const sidebarMenus: IMenu[] = [
		{ id: 'dashboard', label: 'Dashboard', href: '#', icon: HouseDoorFill, selected: true },
		{
			id: 'catalog',
			label: 'Catalog',
			icon: FolderFill,
			children: [
				{ id: 'courses', label: 'Courses', href: '#' },
				{ id: 'categories', label: 'Categories', href: '#' }
			]
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

	let hideHeroDivider = $state(false);
	let showLandingSearchButton = $state(true);

	const loginVariants = [
		{ key: 'simple', label: 'Simple' },
		{ key: 'split', label: 'Split' },
		{ key: 'cover', label: 'Cover' }
	] as const;
	let activeLogin = $state<(typeof loginVariants)[number]['key']>('simple');
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
		content="Interactive showcase for every component available in @aryagg/layout-kit."
	/>
</svelte:head>

<div class="bg-surface-tertiary text-content-primary min-h-screen">
	<div class="pointer-events-none fixed inset-x-0 top-0 h-96 overflow-hidden" aria-hidden="true">
		<div class="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"></div>
		<div class="absolute top-10 right-[10%] h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"></div>
	</div>

	<header class="border-border-primary bg-surface-primary/90 sticky top-0 z-40 border-b backdrop-blur-xl">
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
			<div class="flex min-w-0 items-center gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
					AK
				</div>
				<div class="min-w-0">
					<div class="flex items-center gap-2">
						<h1 class="truncate text-base font-bold tracking-tight">@aryagg/layout-kit</h1>
						<span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live</span>
					</div>
					<p class="text-content-tertiary truncate text-xs">Interactive component showcase</p>
				</div>
			</div>

			<div class="hidden items-center gap-2 sm:flex">
				<span class="border-border-primary bg-surface-secondary rounded-full border px-3 py-1.5 text-xs font-medium">
					{catalog.length} component groups
				</span>
				<span class="border-border-primary bg-surface-secondary rounded-full border px-3 py-1.5 text-xs font-medium">
					11 live demos
				</span>
			</div>
		</div>
	</header>

	<div class="relative mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
		<aside class="lg:sticky lg:top-28 lg:h-fit">
			<div class="mb-5">
				<p class="text-content-tertiary mb-2 text-xs font-bold uppercase tracking-[0.18em]">Component catalog</p>
				<h2 class="text-2xl font-bold tracking-tight">Explore the kit</h2>
				<p class="text-content-tertiary mt-2 text-sm leading-6">
					Switch between components, tune their props and preview every state in one place.
				</p>
			</div>

			<nav class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="Component sections">
				{#each catalog as section (section.key)}
					<button
						type="button"
						class="group border-border-primary relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 {activeSection === section.key
							? 'bg-surface-primary shadow-lg shadow-black/5 ring-1 ring-blue-500/20'
							: 'bg-surface-primary/50 hover:bg-surface-primary hover:-translate-y-0.5 hover:shadow-md'}"
						onclick={() => (activeSection = section.key)}
					>
						{#if activeSection === section.key}
							<span class="absolute inset-y-3 left-0 w-1 rounded-r-full bg-blue-600"></span>
						{/if}
						<div class="flex items-start gap-3">
							<span class="text-content-tertiary pt-0.5 text-[11px] font-bold tracking-widest">{section.index}</span>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-2">
									<span class="text-sm font-semibold">{section.label}</span>
									<span class="text-content-tertiary text-[10px] font-semibold uppercase tracking-wider">{section.count}</span>
								</div>
								<p class="text-content-tertiary mt-1 text-xs leading-5">{section.desc}</p>
							</div>
						</div>
					</button>
				{/each}
			</nav>

			<div class="border-border-primary bg-surface-primary mt-5 rounded-2xl border p-4 shadow-sm">
				<p class="text-xs font-semibold">Built for fast evaluation</p>
				<p class="text-content-tertiary mt-1 text-xs leading-5">Every control updates the preview instantly—no refresh needed.</p>
			</div>
		</aside>

		<main class="min-w-0">
			<section class="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/15 sm:px-8 sm:py-10">
				<div class="max-w-2xl">
					<div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
						Design system playground
					</div>
					<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Beautiful layouts, ready to compose.</h2>
					<p class="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
						A focused demo surface for testing responsive states, visual variants and product-ready interactions across the whole package.
					</p>
				</div>
			</section>

			<!-- TOPBAR -->
			<section class="space-y-5" class:hidden={activeSection !== 'topbar'}>
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
					<div>
						<p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Navigation</p>
						<h2 class="mt-1 text-2xl font-bold tracking-tight">Topbar</h2>
						<p class="text-content-tertiary mt-2 max-w-2xl text-sm leading-6">Responsive application header with brand, navigation, search, language switching, theme controls and profile actions.</p>
					</div>
					<span class="border-border-primary bg-surface-primary w-fit rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">4 layout variants</span>
				</div>

				<div class="border-border-primary bg-surface-primary rounded-2xl border p-4 shadow-sm sm:p-5">
					<div class="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
						<div>
							<p class="text-content-tertiary mb-2 text-[11px] font-bold uppercase tracking-wider">Layout variant</p>
							<div class="flex flex-wrap gap-2">
								{#each topbarVariants as variant (variant)}
									<button type="button" class="btn btn-sm capitalize {topbarVariant === variant ? 'btn-primary' : 'btn-outline'}" onclick={() => (topbarVariant = variant)}>{variant}</button>
								{/each}
							</div>
						</div>
						<div class="flex flex-wrap gap-x-5 gap-y-3">
							<label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" bind:checked={showSearchField} /> Search</label>
							<label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" bind:checked={showLanguages} /> Languages</label>
							<label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" bind:checked={showProfileMenu} /> Profile</label>
						</div>
					</div>
				</div>

				<div class="border-border-primary bg-surface-primary overflow-hidden rounded-3xl border shadow-xl shadow-black/5">
					<div class="border-border-primary bg-surface-secondary flex items-center justify-between border-b px-4 py-3">
						<div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-400"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div>
						<span class="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">Live preview</span>
					</div>
					<Topbar
						variant={topbarVariant}
						brand="Acme"
						logoSrc=""
						tagline="Everything you need to learn, in one place."
						menus={topbarMenus}
						activeHref="#"
						searchField={showSearchField ? { id: 'topbar-search', key: 'search', label: '', placeholder: 'Search…', type: EInputType.SEARCH } : undefined}
						languages={showLanguages ? [{ label: 'EN', value: 'en' }, { label: 'AR', value: 'ar' }] : []}
						currentLanguage="en"
						userName={showProfileMenu ? 'Jordan Lee' : ''}
						profileLabel={showProfileMenu ? 'Jordan Lee' : ''}
						profileItems={showProfileMenu ? topbarProfileItems : []}
						showThemeToggle
						bind:theme={topbarTheme}
					/>
					<div class="grid min-h-44 place-items-center bg-gradient-to-b from-transparent to-slate-500/5 p-6">
						<div class="text-center"><div class="mx-auto mb-3 h-10 w-10 rounded-xl border border-dashed border-slate-400/50"></div><p class="text-content-tertiary text-sm">Your application content continues here</p></div>
					</div>
				</div>
			</section>

			<!-- SIDEBAR -->
			<section class="space-y-5" class:hidden={activeSection !== 'sidebar'}>
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Navigation</p>
					<h2 class="mt-1 text-2xl font-bold tracking-tight">Collapsible Sidebar</h2>
					<p class="text-content-tertiary mt-2 max-w-2xl text-sm leading-6">A flexible app shell with nested groups, flyouts, dividers, disabled states and responsive collapse behavior.</p>
				</div>

				<div class="border-border-primary bg-surface-primary rounded-2xl border p-4 shadow-sm sm:p-5">
					<div class="flex flex-wrap items-center gap-x-7 gap-y-4">
						<div><p class="text-content-tertiary mb-2 text-[11px] font-bold uppercase tracking-wider">Position</p><div class="flex gap-2">{#each sidebarPositions as position (position)}<button type="button" class="btn btn-sm capitalize {sidebarPosition === position ? 'btn-primary' : 'btn-outline'}" onclick={() => (sidebarPosition = position)}>{position}</button>{/each}</div></div>
						<div><p class="text-content-tertiary mb-2 text-[11px] font-bold uppercase tracking-wider">Collapse behavior</p><div class="flex gap-2">{#each sidebarCollapsedModes as mode (mode)}<button type="button" class="btn btn-sm capitalize {sidebarCollapsedMode === mode ? 'btn-primary' : 'btn-outline'}" onclick={() => (sidebarCollapsedMode = mode)}>{mode}</button>{/each}</div></div>
						<label class="mt-auto flex cursor-pointer items-center gap-2 pb-1 text-sm"><input type="checkbox" bind:checked={sidebarCollapsed} /> Collapsed</label>
					</div>
				</div>

				<div class="border-border-primary bg-surface-primary overflow-hidden rounded-3xl border shadow-xl shadow-black/5">
					<div class="border-border-primary bg-surface-secondary flex items-center justify-between border-b px-4 py-3"><div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-400"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div><span class="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">Application shell</span></div>
					<div class="relative flex h-128 overflow-hidden" dir={sidebarPosition === 'right' ? 'rtl' : 'ltr'}>
						<CollapsibleSidebar menus={sidebarMenus} position={sidebarPosition} collapsedMode={sidebarCollapsedMode} bind:collapsed={sidebarCollapsed} logosrc="">
							{#snippet headerSlot()}<span class="text-content-primary text-sm font-bold">Acme</span>{/snippet}
						</CollapsibleSidebar>
						<div class="flex flex-1 flex-col bg-gradient-to-br from-transparent to-slate-500/5 p-6" dir="ltr">
							<div class="grid grid-cols-3 gap-3"><div class="bg-surface-secondary h-16 rounded-xl"></div><div class="bg-surface-secondary h-16 rounded-xl"></div><div class="bg-surface-secondary h-16 rounded-xl"></div></div>
							<div class="bg-surface-secondary mt-4 flex-1 rounded-2xl"></div>
						</div>
					</div>
				</div>
			</section>

			<!-- LANDING -->
			<section class="space-y-8" class:hidden={activeSection !== 'landing'}>
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Marketing</p>
					<h2 class="mt-1 text-2xl font-bold tracking-tight">Landing Pages</h2>
					<p class="text-content-tertiary mt-2 max-w-2xl text-sm leading-6">High-impact public-facing sections designed to drop into a route with minimal setup.</p>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between gap-4"><div><h3 class="font-semibold">LandingPageHero</h3><p class="text-content-tertiary mt-1 text-xs">Brand-led hero with highlighted copy and primary action.</p></div><label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" bind:checked={hideHeroDivider} /> Hide divider</label></div>
					<div class="border-border-primary bg-surface-primary overflow-hidden rounded-3xl border shadow-xl shadow-black/5"><div class="border-border-primary bg-surface-secondary flex items-center justify-between border-b px-4 py-3"><div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-400"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div><span class="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">Hero preview</span></div><div class="h-112"><LandingPageHero title="Acme" heading="Build something great" highlight="great" description="Create beautiful, responsive layouts with flexible, ready-made components." ctaText="Get Started" hideDivider={hideHeroDivider} logo="" /></div></div>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between gap-4"><div><h3 class="font-semibold">LandingPageSearch</h3><p class="text-content-tertiary mt-1 text-xs">Search-first campaign section for discovery experiences.</p></div><label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" bind:checked={showLandingSearchButton} /> Show button</label></div>
					<div class="border-border-primary bg-surface-primary overflow-hidden rounded-3xl border shadow-xl shadow-black/5"><div class="border-border-primary bg-surface-secondary flex items-center justify-between border-b px-4 py-3"><div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-400"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div><span class="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">Search preview</span></div><div class="h-96"><LandingPageSearch title="Discover Your New Home" placeholder="City, address, or ZIP" buttonText="Search" showSearch={showLandingSearchButton} onSubmit={(value) => console.log('[LandingPageSearch] submitted', value)} /></div></div>
				</div>
			</section>

			<!-- LOGIN -->
			<section class="space-y-5" class:hidden={activeSection !== 'login'}>
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
					<div><p class="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Authentication</p><h2 class="mt-1 text-2xl font-bold tracking-tight">Login</h2><p class="text-content-tertiary mt-2 max-w-2xl text-sm leading-6">Three polished authentication layouts sharing one API, so presentation can change without touching form logic.</p></div>
					<span class="border-border-primary bg-surface-primary w-fit rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">Shared props API</span>
				</div>

				<div class="border-border-primary bg-surface-primary rounded-2xl border p-4 shadow-sm sm:p-5"><p class="text-content-tertiary mb-2 text-[11px] font-bold uppercase tracking-wider">Screen variant</p><div class="flex flex-wrap gap-2">{#each loginVariants as variant (variant.key)}<button type="button" class="btn btn-sm {activeLogin === variant.key ? 'btn-primary' : 'btn-outline'}" onclick={() => (activeLogin = variant.key)}>{variant.label}</button>{/each}</div></div>

				<div class="border-border-primary bg-surface-primary overflow-hidden rounded-3xl border shadow-xl shadow-black/5">
					<div class="border-border-primary bg-surface-secondary flex items-center justify-between border-b px-4 py-3"><div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-400"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div><span class="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">Authentication preview</span></div>
					{#if activeLogin === 'simple'}
						<LoginSimple appName="Acme" title="Welcome back" subtitle="Sign in to your Acme account" loading={demoLoading} error={demoError} onSubmit={handleDemoSubmit} />
					{:else if activeLogin === 'split'}
						<LoginSplit appName="Acme" title="Welcome back" subtitle="Sign in to your Acme account" panelHeading="Build something great" panelDescription="Sign in to pick up right where you left off." loading={demoLoading} error={demoError} onSubmit={handleDemoSubmit} />
					{:else}
						<LoginCover appName="Acme" title="Welcome back" subtitle="Sign in to your Acme account" loading={demoLoading} error={demoError} onSubmit={handleDemoSubmit} />
					{/if}
				</div>
			</section>
		</main>
	</div>
</div>

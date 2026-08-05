<script lang="ts">
	import { ArrowRight, Box, Boxes, Braces, Grid, Search, Stars } from 'svelte-bootstrap-icons';

	type ComponentItem = {
		name: string;
		description: string;
		href?: string;
	};

	type ComponentGroup = {
		id: string;
		label: string;
		description: string;
		items: ComponentItem[];
	};

	const groups: ComponentGroup[] = [
		{
			id: 'atoms',
			label: 'Atoms',
			description: 'Small, focused building blocks used throughout every interface.',
			items: [
				{
					name: 'Alert',
					description: 'Contextual feedback and dismissible messages.',
					href: '#/alert'
				},
				{
					name: 'Autocomplete',
					description: 'Searchable suggestions with keyboard selection.',
					href: '#/autocomplete'
				},
				{
					name: 'Avatar',
					description: 'Initials, images, sizes and presence states.',
					href: '#/avatar'
				},
				{ name: 'Badge', description: 'Compact labels, counts and statuses.', href: '#/badge' },
				{
					name: 'Button',
					description: 'Actions with variants, icons and flexible radius.',
					href: '#/button'
				},
				{ name: 'Icon', description: 'Consistent Bootstrap icon rendering.', href: '#/icon' },
				{
					name: 'Metric Card',
					description: 'Compact metric and trend presentation.',
					href: '#/card'
				},
				{ name: 'Document Table', description: 'V3 document-focused table rows.', href: '#/table' },
				{
					name: 'Dropdown Menu',
					description: 'Nested menus, placement and custom triggers.',
					href: '#/dropdown'
				},
				{
					name: 'Folder Hierarchy',
					description: 'Expandable multi-level file navigation.',
					href: '#/folder-hierarchy'
				},
				{ name: 'Image', description: 'Responsive media, overlays and fallbacks.', href: '#/image' },
				{ name: 'Input', description: 'Text inputs with left or right icons.', href: '#/input' },
				{
					name: 'Input Field',
					description: 'Labeled form controls and field states.',
					href: '#/input'
				},
				{ name: 'No Data', description: 'Empty-state content and actions.', href: '#/no-data' },
				{
					name: 'Skeleton Loader',
					description: 'Loading placeholders for content.',
					href: '#/loader'
				},
				{ name: 'Tooltip', description: 'Positioned contextual hints.', href: '#/tooltip' }
			]
		},
		{
			id: 'molecules',
			label: 'Molecules',
			description: 'Composed controls that solve common interaction patterns.',
			items: [
				{
					name: 'Accordion',
					description: 'Expandable content sections and variants.',
					href: '#/accordion'
				},
				{ name: 'Card', description: 'Flexible content and project card layouts.', href: '#/card' },
				{
					name: 'Combobox',
					description: 'Combined text input and option selection.',
					href: '#/combobox'
				},
				{
					name: 'Date Picker',
					description: 'Calendar-based date selection.',
					href: '#/date-picker'
				},
				{
					name: 'Form',
					description: 'Structured form composition and submission.',
					href: '#/form'
				},
				{ name: 'Loader', description: 'Application loading indicator.', href: '#/loader' },
				{ name: 'Snackbar', description: 'Timed application notifications.', href: '#/snackbar' },
				{
					name: 'OTP Input',
					description: 'Multi-cell verification code input.',
					href: '#/otp-input'
				},
				{
					name: 'Rating',
					description: 'Interactive score and rating control.',
					href: '#/rating'
				}
			]
		},
		{
			id: 'organisms',
			label: 'Organisms',
			description: 'Feature-level components for richer application workflows.',
			items: [
				{
					name: 'Breadcrumb',
					description: 'Hierarchical page navigation.',
					href: '#/breadcrumb'
				},
				{
					name: 'Advanced Table',
					description: 'Filtering, views, columns and pagination.',
					href: '#/table'
				},
				{
					name: 'Advanced Folder Hierarchy',
					description: 'Dynamic grouping, filters and draggable levels.',
					href: '#/folder-hierarchy'
				},
				{ name: 'Chart', description: 'Reusable data visualization wrapper.', href: '#/chart' },
				{
					name: 'Data Table',
					description: 'Sortable and searchable tabular data.',
					href: '#/table'
				},
				{
					name: 'Confirm Dialog',
					description: 'Focused confirmation for important actions.',
					href: '#/confirm-dialog'
				},
				{
					name: 'Dialog / Modal',
					description: 'Accessible themed overlays, modals and focused workflows.',
					href: '#/dialog'
				},
				{
					name: 'Pagination',
					description: 'Responsive page and page-size navigation.',
					href: '#/tabs-pagination'
				},
				{
					name: 'Rich Text Editor',
					description: 'Formatted content authoring.',
					href: '#/rich-text-editor'
				},
				{
					name: 'Search Suggestions',
					description: 'Recent items, filtered matches, quick actions and view-all behavior.',
					href: '#/search-suggestions'
				},
				{
					name: 'Tabs',
					description: 'Underline and segmented content navigation.',
					href: '#/tabs-pagination'
				}
			]
		}
	];

	let query = $state('');
	const normalizedQuery = $derived(query.trim().toLocaleLowerCase());
	const filteredGroups = $derived(
		groups.map((group) => ({
			...group,
			items: normalizedQuery
				? group.items.filter(
						(item) =>
							item.name.toLocaleLowerCase().includes(normalizedQuery) ||
							item.description.toLocaleLowerCase().includes(normalizedQuery)
					)
				: group.items
		}))
	);
	const componentCount = groups.reduce((total, group) => total + group.items.length, 0);
	const visibleCount = $derived(
		filteredGroups.reduce((total, group) => total + group.items.length, 0)
	);
</script>

<svelte:head>
	<title>UI Kit · Component Library</title>
	<meta
		name="description"
		content="Browse the reusable atoms, molecules and organisms available in the UI Kit."
	/>
</svelte:head>

<main class="min-h-screen bg-surface-tertiary text-primary">
	<section class="border-b border-border-primary bg-surface-primary">
		<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
			<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
				<div class="max-w-3xl">
					<div
						class="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-accent"
					>
						<Stars class="size-3.5" />
						Core UI library
					</div>
					<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
						Build consistently, move faster.
					</h1>
					<p class="mt-4 max-w-2xl text-sm leading-6 text-secondary sm:text-base">
						A reusable Svelte component system built with Tailwind and designed to support the V3
						product style across projects.
					</p>
				</div>

				<div class="grid grid-cols-3 gap-2 sm:gap-3">
					<div class="rounded-xl border border-border-primary bg-surface-secondary px-4 py-3">
						<strong class="block text-xl text-accent">{componentCount}</strong>
						<span class="text-[11px] text-tertiary">Components</span>
					</div>
					<div class="rounded-xl border border-border-primary bg-surface-secondary px-4 py-3">
						<strong class="block text-xl">3</strong>
						<span class="text-[11px] text-tertiary">Levels</span>
					</div>
					<a
						href="#/theme"
						class="rounded-xl border border-border-primary bg-surface-secondary px-4 py-3 text-primary no-underline transition hover:border-accent hover:text-accent"
					>
						<Braces class="mb-1 size-5" />
						<span class="text-[11px]">Theme</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<label class="relative block w-full max-w-lg">
				<Search
					class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-tertiary"
				/>
				<span class="sr-only">Search components</span>
				<input
					bind:value={query}
					type="search"
					placeholder="Search {componentCount} components..."
					class="h-11 w-full rounded-xl border border-border-primary bg-surface-primary pr-4 pl-10 text-sm text-primary shadow-sm outline-none transition placeholder:text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15"
				/>
			</label>

			<nav class="flex items-center gap-2 overflow-x-auto" aria-label="Component groups">
				{#each groups as group (group.id)}
					<a
						href="#{group.id}"
						class="whitespace-nowrap rounded-lg border border-border-primary bg-surface-primary px-3 py-2 text-xs font-semibold text-secondary no-underline transition hover:border-accent hover:text-accent"
						>{group.label} <span class="ml-1 text-tertiary">{group.items.length}</span></a
					>
				{/each}
			</nav>
		</div>

		{#if visibleCount}
			<div class="space-y-12">
				{#each filteredGroups as group, groupIndex (group.id)}
					{#if group.items.length}
						<section id={group.id} class="scroll-mt-6">
							<div class="mb-5 flex items-start gap-3">
								<div
									class="grid size-10 shrink-0 place-items-center rounded-xl {groupIndex === 0
										? 'bg-accent/10 text-accent'
										: groupIndex === 1
											? 'bg-info/10 text-info'
											: 'bg-success/10 text-success'}"
								>
									{#if groupIndex === 0}
										<Box class="size-5" />
									{:else if groupIndex === 1}
										<Boxes class="size-5" />
									{:else}
										<Grid class="size-5" />
									{/if}
								</div>
								<div>
									<div class="flex items-center gap-2">
										<h2 class="text-xl font-bold">{group.label}</h2>
										<span
											class="rounded-full bg-surface-secondary px-2 py-0.5 text-[11px] font-semibold text-tertiary"
											>{group.items.length}</span
										>
									</div>
									<p class="mt-1 text-sm text-secondary">{group.description}</p>
								</div>
							</div>

							<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
								{#each group.items as item (item.name)}
									{#if item.href}
										<a
											href={item.href}
											class="group flex min-h-32 flex-col rounded-xl border border-border-primary bg-surface-primary p-5 text-primary no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
										>
											<div class="flex items-start justify-between gap-3">
												<h3 class="font-semibold">{item.name}</h3>
												<ArrowRight
													class="size-4 shrink-0 text-tertiary transition group-hover:translate-x-0.5 group-hover:text-accent"
												/>
											</div>
											<p class="mt-2 text-sm leading-5 text-secondary">{item.description}</p>
											<span class="mt-auto pt-4 text-[11px] font-semibold text-accent"
												>View examples</span
											>
										</a>
									{:else}
										<article
											class="flex min-h-32 flex-col rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
										>
											<div class="flex items-start justify-between gap-3">
												<h3 class="font-semibold">{item.name}</h3>
												<span
													class="rounded-full bg-surface-secondary px-2 py-1 text-[10px] font-semibold text-tertiary"
													>Library</span
												>
											</div>
											<p class="mt-2 text-sm leading-5 text-secondary">{item.description}</p>
											<span class="mt-auto pt-4 text-[11px] text-tertiary"
												>Showcase coming soon</span
											>
										</article>
									{/if}
								{/each}
							</div>
						</section>
					{/if}
				{/each}
			</div>
		{:else}
			<div
				class="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border-primary bg-surface-primary p-8 text-center"
			>
				<div>
					<Search class="mx-auto size-7 text-tertiary" />
					<h2 class="mt-4 text-lg font-semibold">No components found</h2>
					<p class="mt-1 text-sm text-secondary">Try another name or capability.</p>
					<button
						type="button"
						class="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
						onclick={() => (query = '')}>Clear search</button
					>
				</div>
			</div>
		{/if}
	</div>
</main>

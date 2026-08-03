<script lang="ts">
	import { Building, FileEarmarkText, Grid } from 'svelte-bootstrap-icons';
	import SearchSuggestions from '$lib/organisms/search-suggestions/SearchSuggestions.svelte';
	import type {
		SearchSuggestionAction,
		SearchSuggestionItem
	} from '$lib/organisms/search-suggestions/types';

	let query = $state('');
	let lastAction = $state('Nothing selected yet');

	const recentItems: SearchSuggestionItem[] = [
		{
			id: 'crossrail',
			title: 'Crossrail 2 — Tottenham Court Station',
			description: 'LDN-CRL-01 · Stage 4 · Transport for London',
			icon: Building,
			badge: 'Active',
			badgeTone: 'success'
		},
		{
			id: 'dubai-opera',
			title: 'Dubai Opera District — Tower 2',
			description: 'DXB-OPR-02 · Stage 5 · Emaar Properties',
			icon: Building,
			badge: 'Active',
			badgeTone: 'success'
		}
	];

	const items: SearchSuggestionItem[] = [
		...recentItems,
		{
			id: 'architectural-model',
			title: 'Architectural Model.rvt',
			description: 'ARC-MOD-001 · SP-INFRA · WIP',
			keywords: ['revit', 'architecture'],
			icon: FileEarmarkText
		},
		{
			id: 'structural-coordination',
			title: 'Structural Coordination.ifc',
			description: 'STR-COO-014 · SP-INFRA · Published',
			keywords: ['ifc', 'structure'],
			icon: FileEarmarkText
		}
	];

	const quickActions: SearchSuggestionAction[] = [
		{ id: 'all-projects', label: 'All projects', icon: Grid, trailingText: '47 projects' }
	];
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-8 text-primary sm:px-6">
	<div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
		<section class="space-y-5">
			<header class="space-y-2">
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
				<h1 class="text-3xl font-bold">Search suggestions</h1>
				<p class="max-w-xl text-sm leading-6 text-secondary">
					A generic search preview for recent items, filtered results, badges, quick actions, and
					view-all behavior. The consuming application owns routing and data loading.
				</p>
			</header>

			<label class="grid max-w-xl gap-2 text-sm font-semibold">
				<span>Try a query</span>
				<input
					class="h-11 rounded-lg border border-primary bg-surface-primary px-4 text-primary outline-none focus:border-accent"
					bind:value={query}
					placeholder="Try project, model, IFC..."
				/>
			</label>

			<p class="rounded-lg border border-primary bg-surface-primary p-4 text-sm text-secondary">
				<strong class="text-primary">Last interaction:</strong>
				{lastAction}
			</p>
		</section>

		<section class="self-start">
			<SearchSuggestions
				{query}
				{items}
				{recentItems}
				{quickActions}
				recentLabel="Recent projects"
				quickActionsLabel="Quick navigate"
				onSelect={(item) => (lastAction = `Selected: ${item.title}`)}
				onQuickAction={(action) => (lastAction = `Action: ${action.label}`)}
				onViewAll={(value) => (lastAction = `View all: ${value}`)}
			/>
		</section>
	</div>
</main>

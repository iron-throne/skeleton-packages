<script lang="ts">
	import Autocomplete from '$lib/atoms/autocomplete/Autocomplete.svelte';
	import Card from '$lib/atoms/card/Card.svelte';
	import { DISCIPLINE_OPTIONS, PROJECT_OPTIONS } from './constants';

	let project = $state<string | string[] | null>('crossrail-tcr');
	let discipline = $state<string | string[] | null>(['arc', 'mep']);
	let clearableProject = $state<string | string[] | null>(null);
	let simpleProject = $state<string | string[] | null>('dubai-opera-t2');
	let disabledProject = $state<string | string[] | null>('berlin-data-campus');
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-6">
		<header class="space-y-2">
			<p class="section-label">Atom</p>
			<h1>Autocomplete</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				A searchable select input inspired by Vuetify autocomplete patterns, with single selection,
				multiple chips, clearable values, disabled, loading, and no-data states.
			</p>
		</header>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Searchable select with icons">
				<Autocomplete
					label="Project"
					bind:value={project}
					options={PROJECT_OPTIONS}
					placeholder="Search projects..."
					clearable
					helperText="Choose one active project."
				/>
			</Card>

			<Card variant="panel" title="Searchable select without icons">
				<Autocomplete
					label="Disciplines"
					bind:value={discipline}
					options={DISCIPLINE_OPTIONS}
					placeholder="Search disciplines..."
					multiple
					chips
					showSearchIcon={false}
					showOptionIcons={false}
					clearable
					helperText="Select one or more disciplines."
				/>
			</Card>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Standard select with icon">
				<Autocomplete
					label="Active project"
					bind:value={simpleProject}
					options={PROJECT_OPTIONS}
					placeholder="Choose a project"
					searchable={false}
					showSearchIcon={false}
					helperText="Uses the same component without text filtering."
				/>
			</Card>

			<Card variant="panel" title="Clearable empty value">
				<Autocomplete
					label="Project package"
					bind:value={clearableProject}
					options={PROJECT_OPTIONS}
					placeholder="Start typing..."
					clearable
				/>
			</Card>

			<Card variant="panel" title="States">
				<div class="grid gap-4">
					<Autocomplete
						label="Disabled"
						bind:value={disabledProject}
						options={PROJECT_OPTIONS}
						disabled
						helperText="Locked by workflow permissions."
					/>
					<Autocomplete
						label="Loading"
						options={[]}
						placeholder="Loading options..."
						loading
						state="warning"
						helperText="Waiting for remote data."
					/>
					<Autocomplete
						label="No data"
						options={[]}
						placeholder="Search unavailable..."
						noDataText="No matching packages"
						state="error"
						helperText="No records match this search."
					/>
				</div>
			</Card>
		</section>
	</div>
</main>

<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Combobox from '$molecules/combobox/Combobox.svelte';

	const disciplines = [
		{ id: 'architecture', name: 'Architecture' },
		{ id: 'structure', name: 'Structure' },
		{ id: 'mep', name: 'MEP' },
		{ id: 'civil', name: 'Civil' }
	];

	const reviewers = [
		{ id: 'r1', name: 'Sarah Chen' },
		{ id: 'r2', name: 'Marcus Webb' },
		{ id: 'r3', name: 'Priya Nair' },
		{ id: 'r4', name: 'Tom Reilly' }
	];

	let selectedDiscipline = $state('architecture');
	let selectedReviewers = $state('r1,r3');
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Combobox</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Combined text input and option selection, single or multi-select.
			</p>
		</header>

		<Card variant="panel" title="Single select">
			<Combobox
				id="combobox-discipline"
				label="Discipline"
				bindValue="id"
				displayText={['name']}
				options={disciplines}
				selected={selectedDiscipline}
				onUpdateValue={(v) => (selectedDiscipline = v)}
			/>
			<p class="mt-3 text-xs text-secondary">Selected: {selectedDiscipline || '(none)'}</p>
		</Card>

		<Card variant="panel" title="Multi-select with free text">
			<Combobox
				id="combobox-reviewers"
				label="Reviewers"
				bindValue="id"
				displayText={['name']}
				options={reviewers}
				multiSelect
				canAddNew
				selected={selectedReviewers}
				onUpdateValue={(v) => (selectedReviewers = v)}
			/>
			<p class="mt-3 text-xs text-secondary">Selected: {selectedReviewers || '(none)'}</p>
		</Card>
	</div>
</main>

<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Accordion from '$molecules/accordion/Accordion.svelte';
	import type { IAccordionData } from '$molecules/accordion/types';

	const basicItems: IAccordionData[] = [
		{
			id: 'scope',
			title: 'Scope of works',
			content: 'Structural steel frame, MEP first-fix, and façade cladding for Levels 3-8.'
		},
		{
			id: 'schedule',
			title: 'Schedule',
			content: 'Fabrication starts week 12, on-site erection begins week 18.'
		},
		{
			id: 'risks',
			title: 'Open risks',
			content: 'Awaiting structural sign-off on revised wind-load calculations.',
			disabled: true
		}
	];

	const multipleItems: IAccordionData[] = [
		{ id: 'arch', title: 'Architecture', subtitle: '12 drawings', content: 'Floor plans, elevations and sections issued for construction.', expanded: true },
		{ id: 'struct', title: 'Structure', subtitle: '8 drawings', content: 'Steel connection details pending fabricator review.' },
		{ id: 'mep', title: 'MEP', subtitle: '15 drawings', content: 'Coordination model clash report attached.' }
	];

	let expandedSingle = $state<(number | string)[]>(['scope']);
	let expandedMultiple = $state<(number | string)[]>(['arch']);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Accordion</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Expandable content sections, single or multiple open, with disabled and mandatory states.
			</p>
		</header>

		<Card variant="panel" title="Single open (default)">
			<Accordion id="accordion-single" items={basicItems} bind:expandedIds={expandedSingle} />
		</Card>

		<Card variant="panel" title="Multiple open, first item mandatory">
			<Accordion
				id="accordion-multiple"
				items={multipleItems}
				multiple
				mandatory
				mandatoryId="arch"
				bind:expandedIds={expandedMultiple}
			/>
		</Card>
	</div>
</main>

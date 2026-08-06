<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Form from '$molecules/form/Form.svelte';
	import { EInputType, type IForm } from '@aryagg/types';

	let formModel = $state<IForm>({
		sections: [
			{
				id: 'project',
				title: 'Project details',
				fields: [
					{
						key: 'projectName',
						id: 'project-name',
						label: 'Project name',
						type: EInputType.TEXT,
						value: 'Crossrail 2 - Tottenham Court Station',
						required: true
					},
					{
						key: 'contactEmail',
						id: 'contact-email',
						label: 'Contact email',
						type: EInputType.EMAIL,
						value: '',
						required: true
					},
					{
						key: 'discipline',
						id: 'discipline',
						label: 'Discipline',
						type: EInputType.SELECT,
						value: 'architecture',
						options: [
							{ label: 'Architecture', value: 'architecture' },
							{ label: 'Structure', value: 'structure' },
							{ label: 'MEP', value: 'mep' }
						]
					}
				]
			},
			{
				id: 'preferences',
				title: 'Preferences',
				fields: [
					{
						key: 'notify',
						id: 'notify',
						label: 'Notify project team on submit',
						type: EInputType.CHECKBOX,
						value: true
					}
				]
			}
		]
	});

	let lastSubmitted = $state<Record<string, string> | null>(null);
	let submitting = $state(false);

	function handleSubmit(formData: FormData) {
		lastSubmitted = Object.fromEntries(formData.entries()) as Record<string, string>;
	}
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Form</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Structured form composition, validation and submission, built from section/field data.
			</p>
		</header>

		<Card variant="panel" title="Project intake">
			<Form form={formModel} bind:loading={submitting} onSubmit={handleSubmit} />
		</Card>

		{#if lastSubmitted}
			<Card variant="panel" title="Last submitted values">
				<pre class="overflow-auto rounded-lg bg-surface-secondary p-3 text-xs">{JSON.stringify(
						lastSubmitted,
						null,
						2
					)}</pre>
			</Card>
		{/if}
	</div>
</main>

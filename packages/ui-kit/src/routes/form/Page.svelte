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
					},
					{
						key: 'projectId',
						id: 'project-id',
						label: 'Project id',
						type: EInputType.HIDDEN,
						value: 'CRL2-TCR'
					}
				]
			},
			{
				id: 'contact',
				title: 'Contact & access',
				fields: [
					{
						key: 'phone',
						id: 'phone',
						label: 'Site phone',
						type: EInputType.TEL,
						value: '+44 20 7946 0958'
					},
					{
						key: 'projectUrl',
						id: 'project-url',
						label: 'Project portal',
						type: EInputType.URL,
						value: 'https://crossrail2.example.com'
					},
					{
						key: 'accessCode',
						id: 'access-code',
						label: 'Access code',
						type: EInputType.PASSWORD,
						value: 'CRL2-Secure!'
					},
					{
						key: 'searchDocs',
						id: 'search-docs',
						label: 'Search documents',
						type: EInputType.SEARCH,
						value: '',
						placeholder: 'Search drawings, RFIs…'
					}
				]
			},
			{
				id: 'scheduling',
				title: 'Scheduling & metrics',
				fields: [
					{
						key: 'issueDate',
						id: 'issue-date',
						label: 'Issue date',
						type: EInputType.DATE,
						value: '2026-07-07'
					},
					{
						key: 'reviewTime',
						id: 'review-time',
						label: 'Review time',
						type: EInputType.TIME,
						value: '09:30'
					},
					{
						key: 'submissionDeadline',
						id: 'submission-deadline',
						label: 'Submission deadline',
						type: EInputType.DATETIME_LOCAL,
						value: '2026-08-30T17:00'
					},
					{
						key: 'targetMonth',
						id: 'target-month',
						label: 'Target completion month',
						type: EInputType.MONTH,
						value: '2026-12'
					},
					{
						key: 'sprintWeek',
						id: 'sprint-week',
						label: 'Sprint week',
						type: EInputType.WEEK,
						value: '2026-W35'
					},
					{
						key: 'floorCount',
						id: 'floor-count',
						label: 'Floor count',
						type: EInputType.NUMBER,
						value: 6
					},
					{
						key: 'markupColor',
						id: 'markup-color',
						label: 'Markup colour',
						type: EInputType.COLOR,
						value: '#ca0613'
					},
					{
						key: 'completion',
						id: 'completion',
						label: 'Completion',
						type: EInputType.RANGE,
						value: 64,
						attributes: { min: 0, max: 100 }
					}
				]
			},
			{
				id: 'attachments',
				title: 'Attachments',
				fields: [
					{
						key: 'drawingFile',
						id: 'drawing-file',
						label: 'Upload drawing',
						type: EInputType.FILE,
						value: null,
						helperText: 'Accepted: PDF, RVT, IFC, DWG',
						attributes: { accept: '.pdf,.rvt,.ifc,.dwg' }
					},
					{
						key: 'sitePhoto',
						id: 'site-photo',
						label: 'Site photo (image submit control)',
						type: EInputType.IMAGE,
						klass: 'w-auto! h-auto! border-none! bg-transparent! p-0!',
						helperText: 'Native <input type="image"> — acts as a submit button.',
						attributes: {
							src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><rect width='28' height='28' rx='4' fill='%23ca0613'/></svg>",
							alt: 'Submit with site photo',
							width: 28,
							height: 28
						}
					}
				]
			},
			{
				id: 'notes',
				title: 'Notes',
				fields: [
					{
						key: 'notes',
						id: 'notes',
						label: 'Review notes',
						type: EInputType.TEXTAREA,
						value: 'Coordinate riser clearance before next review.'
					},
					{
						key: 'minutes',
						id: 'minutes',
						label: 'Meeting minutes',
						type: EInputType.RICHTEXT,
						value: '<p>Discussed clash detection results.</p>'
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
					},
					{
						key: 'status',
						id: 'status',
						label: 'Workflow status',
						type: EInputType.RADIO,
						value: 'review',
						options: [
							{ label: 'Draft', value: 'draft' },
							{ label: 'In review', value: 'review' },
							{ label: 'Approved', value: 'approved' }
						]
					},
					{
						key: 'building',
						id: 'building',
						label: 'Building',
						type: EInputType.SELECT_ADDNEW,
						value: 'tower-a',
						options: [
							{ label: 'Tower A', value: 'tower-a' },
							{ label: 'Tower B', value: 'tower-b' }
						]
					},
					{
						key: 'tags',
						id: 'tags',
						label: 'Tags',
						type: EInputType.MULTISELECT,
						value: ['structure'],
						options: [
							{ label: 'Architecture', value: 'architecture' },
							{ label: 'Structure', value: 'structure' },
							{ label: 'MEP', value: 'mep' }
						]
					},
					{
						key: 'disciplines',
						id: 'disciplines',
						label: 'Disciplines involved',
						type: EInputType.MULTISELECT_ADDNEW,
						value: ['architecture'],
						options: [
							{ label: 'Architecture', value: 'architecture' },
							{ label: 'Structure', value: 'structure' },
							{ label: 'MEP', value: 'mep' }
						]
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

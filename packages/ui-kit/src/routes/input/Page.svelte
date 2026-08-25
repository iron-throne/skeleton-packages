<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Input from '$organisms/input/Input.svelte';
	import { EInputType, type IFormField } from '@aryagg/types';

	let textFields = $state<IFormField[]>([
		{
			key: 'projectName',
			id: 'i-project-name',
			label: 'Project name',
			type: EInputType.TEXT,
			value: 'Tottenham Court'
		},
		{
			key: 'email',
			id: 'i-email',
			label: 'Email',
			type: EInputType.EMAIL,
			value: 'sarah.chen@example.com'
		},
		{
			key: 'password',
			id: 'i-password',
			label: 'Password',
			type: EInputType.PASSWORD,
			value: 'secret-password'
		},
		{
			key: 'search',
			id: 'i-search',
			label: 'Search',
			type: EInputType.SEARCH,
			value: '',
			placeholder: 'Search documents...'
		},
		{
			key: 'phone',
			id: 'i-phone',
			label: 'Site phone',
			type: EInputType.TEL,
			value: '+44 20 7946 0958'
		},
		{
			key: 'portal',
			id: 'i-portal',
			label: 'Project portal',
			type: EInputType.URL,
			value: 'https://crossrail2.example.com'
		},
		{
			key: 'projectId',
			id: 'i-project-id',
			label: 'Project id',
			type: EInputType.HIDDEN,
			value: 'CRL2-TCR'
		}
	]);

	let numericFields = $state<IFormField[]>([
		{ key: 'count', id: 'i-count', label: 'Document count', type: EInputType.NUMBER, value: 42 },
		{
			key: 'issueDate',
			id: 'i-issue-date',
			label: 'Issue date',
			type: EInputType.DATE,
			value: '2026-07-07'
		},
		{
			key: 'reviewTime',
			id: 'i-review-time',
			label: 'Review time',
			type: EInputType.TIME,
			value: '09:30'
		},
		{
			key: 'deadline',
			id: 'i-deadline',
			label: 'Submission deadline',
			type: EInputType.DATETIME_LOCAL,
			value: '2026-08-30T17:00'
		},
		{
			key: 'month',
			id: 'i-month',
			label: 'Target completion month',
			type: EInputType.MONTH,
			value: '2026-12'
		},
		{ key: 'week', id: 'i-week', label: 'Sprint week', type: EInputType.WEEK, value: '2026-W35' },
		{ key: 'color', id: 'i-color', label: 'Theme color', type: EInputType.COLOR, value: '#ca0613' },
		{
			key: 'completion',
			id: 'i-completion',
			label: 'Completion',
			type: EInputType.RANGE,
			value: 64,
			attributes: { min: 0, max: 100 }
		}
	]);

	let longFormFields = $state<IFormField[]>([
		{
			key: 'note',
			id: 'i-note',
			label: 'Review note',
			type: EInputType.TEXTAREA,
			value: 'Coordinate riser clearance before next review.'
		},
		{
			key: 'minutes',
			id: 'i-minutes',
			label: 'Meeting minutes',
			type: EInputType.RICHTEXT,
			value: '<p>Discussed clash detection results.</p>',
			klass: 'w-full'
		},
		{
			key: 'drawing',
			id: 'i-drawing',
			label: 'Upload document',
			type: EInputType.FILE,
			value: null,
			helperText: 'Accepted: PDF, RVT, IFC, DWG, XLSX',
			attributes: { accept: '.pdf,.rvt,.ifc,.dwg,.xlsx' }
		},
		{
			key: 'files',
			id: 'i-files',
			label: 'Multiple files',
			type: EInputType.FILE,
			value: null,
			multiple: true,
			helperText: 'Select more than one file for batch upload.'
		},
		{
			key: 'sitePhoto',
			id: 'i-site-photo',
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
	]);

	let choiceFields = $state<IFormField[]>([
		{
			key: 'discipline',
			id: 'i-discipline',
			label: 'Discipline',
			type: EInputType.SELECT,
			value: 'architecture',
			placeholder: 'Choose discipline',
			options: [
				{ label: 'Architecture', value: 'architecture' },
				{ label: 'Structure', value: 'structure' },
				{ label: 'MEP', value: 'mep' },
				{ label: 'Civil', value: 'civil' }
			]
		},
		{
			key: 'building',
			id: 'i-building',
			label: 'Building',
			type: EInputType.SELECT_ADDNEW,
			value: 'tower-a',
			options: [
				{ label: 'Tower A', value: 'tower-a' },
				{ label: 'Tower B', value: 'tower-b' }
			]
		},
		{
			key: 'status',
			id: 'i-status',
			label: 'Workflow status',
			type: EInputType.RADIO,
			value: 'review',
			options: [
				{ label: 'Draft', value: 'draft' },
				{ label: 'In Review', value: 'review' },
				{ label: 'Approved', value: 'approved' }
			]
		},
		{
			key: 'notify',
			id: 'i-notify',
			label: 'Notify project team',
			type: EInputType.CHECKBOX,
			value: true,
			helperText: 'Send an update when the document is submitted.'
		},
		{
			key: 'autoEnroll',
			id: 'i-auto-enroll',
			label: 'Auto-enroll new members',
			type: EInputType.SWITCH,
			value: false
		},
		{
			key: 'tags',
			id: 'i-tags',
			label: 'Tags',
			type: EInputType.MULTISELECT,
			value: ['structure'],
			options: [
				{ label: 'Architecture', value: 'architecture' },
				{ label: 'Structure', value: 'structure' },
				{ label: 'MEP', value: 'mep' },
				{ label: 'Civil', value: 'civil' }
			]
		},
		{
			key: 'disciplinesInvolved',
			id: 'i-disciplines',
			label: 'Disciplines involved',
			type: EInputType.MULTISELECT_ADDNEW,
			value: ['architecture'],
			options: [
				{ label: 'Architecture', value: 'architecture' },
				{ label: 'Structure', value: 'structure' },
				{ label: 'MEP', value: 'mep' }
			]
		}
	]);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Input</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				The field-driven input atom (<code>EInputType</code>/<code>IFormField</code>) that powers
				the Form molecule — every supported type, including the multiselect combobox with
				add-new-option support.
			</p>
		</header>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Text inputs">
				<div class="grid gap-4">
					{#each textFields as field, i (field.key)}
						<Input bind:field={textFields[i]} />
					{/each}
				</div>
			</Card>

			<Card variant="panel" title="Numeric and date inputs">
				<div class="grid gap-4">
					{#each numericFields as field, i (field.key)}
						<Input bind:field={numericFields[i]} />
					{/each}
				</div>
			</Card>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Long form and files">
				<div class="flex flex-col gap-4">
					{#each longFormFields as field, i (field.key)}
						<Input bind:field={longFormFields[i]} parentKlass="w-full"/>
					{/each}
				</div>
			</Card>

			<Card variant="panel" title="Choices">
				<div class="grid gap-4">
					{#each choiceFields as field, i (field.key)}
						<Input bind:field={choiceFields[i]} />
					{/each}
				</div>
			</Card>
		</section>
	</div>
</main>

<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import DatePicker from '$molecules/date-picker/DatePicker.svelte';
	import { EInputType, type IFormField } from '@aryagg/types';

	const issueField: IFormField = { key: 'issueDate', id: 'issue-date', label: 'Issue date', type: EInputType.DATE };
	const reviewField: IFormField = { key: 'reviewDate', id: 'review-date', label: 'Review date', type: EInputType.DATE };

	let issueDate = $state('07/07/2026');
	let reviewDate = $state('');
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Date Picker</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Calendar-based date selection with optional min/max range constraints.
			</p>
		</header>

		<Card variant="panel" title="Basic">
			<div class="max-w-xs">
				<DatePicker
					placeholder="Select issue date"
					selected={issueDate}
					field={issueField}
					onUpdateValue={(v) => (issueDate = v)}
				/>
			</div>
			<p class="mt-3 text-xs text-secondary">Selected: {issueDate || '(none)'}</p>
		</Card>

		<Card variant="panel" title="Constrained to next 30 days">
			<div class="max-w-xs">
				<DatePicker
					placeholder="Select review date"
					selected={reviewDate}
					field={reviewField}
					minDate={new Date().toLocaleDateString('en-US')}
					maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}
					onUpdateValue={(v) => (reviewDate = v)}
				/>
			</div>
			<p class="mt-3 text-xs text-secondary">Selected: {reviewDate || '(none)'}</p>
		</Card>
	</div>
</main>

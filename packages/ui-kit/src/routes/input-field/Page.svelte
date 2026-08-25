<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import InputField from '$atoms/input-field/InputField.svelte';
	import { Envelope, Search } from 'svelte-bootstrap-icons';
	import { DISCIPLINE_OPTIONS, STATUS_OPTIONS } from './constants';

	let textValue = $state('Tottenham Court');
	let numberValue = $state(42);
	let emailValue = $state('sarah.chen@example.com');
	let passwordValue = $state('secret-password');
	let searchValue = $state('');
	let telValue = $state('+44 20 7946 0958');
	let urlValue = $state('https://crossrail2.example.com');
	let dateValue = $state('2026-07-07');
	let timeValue = $state('09:30');
	let datetimeValue = $state('2026-08-30T17:00');
	let monthValue = $state('2026-12');
	let weekValue = $state('2026-W35');
	let textareaValue = $state('Coordinate riser clearance before next review.');
	let selectValue = $state('architecture');
	let checkboxValue = $state(true);
	let radioValue = $state('review');
	let rangeValue = $state(64);
	let colorValue = $state('#ca0613');
	let fileValue = $state<File | File[] | null>(null);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Input Field</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Labeled form controls with icons, validation states and helper text — text, number, file
				uploads, selects, checks, radio groups and ranges.
			</p>
		</header>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Text inputs">
				<div class="grid gap-4">
					<InputField
						label="Project name"
						bind:value={textValue}
						placeholder="Enter project name"
					/>
					<InputField
						label="Email"
						type="email"
						bind:value={emailValue}
						icon={Envelope}
						iconPosition="left"
					/>
					<InputField label="Password" type="password" bind:value={passwordValue} />
					<InputField
						label="Search"
						type="search"
						bind:value={searchValue}
						placeholder="Search documents..."
						icon={Search}
						iconPosition="right"
					/>
					<InputField label="Site phone" type="tel" bind:value={telValue} />
					<InputField label="Project portal" type="url" bind:value={urlValue} />
				</div>
			</Card>

			<Card variant="panel" title="Numeric and date inputs">
				<div class="grid gap-4">
					<InputField label="Document count" type="number" bind:value={numberValue} min={0} />
					<InputField label="Issue date" type="date" bind:value={dateValue} />
					<InputField label="Review time" type="time" bind:value={timeValue} />
					<InputField
						label="Submission deadline"
						type="datetime-local"
						bind:value={datetimeValue}
					/>
					<InputField label="Target completion month" type="month" bind:value={monthValue} />
					<InputField label="Sprint week" type="week" bind:value={weekValue} />
					<InputField label="Theme color" type="color" bind:value={colorValue} />
				</div>
			</Card>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Long form and files">
				<div class="grid gap-4">
					<InputField label="Review note" type="textarea" bind:value={textareaValue} />
					<InputField
						label="Upload document"
						type="file"
						bind:value={fileValue}
						accept=".pdf,.rvt,.ifc,.dwg,.xlsx"
						helperText="Accepted: PDF, RVT, IFC, DWG, XLSX"
					/>
					<InputField
						label="Multiple files"
						type="file"
						bind:value={fileValue}
						multiple
						helperText="Select more than one file for batch upload."
					/>
				</div>
			</Card>

			<Card variant="panel" title="Choices">
				<div class="grid gap-4">
					<InputField
						label="Discipline"
						type="select"
						bind:value={selectValue}
						options={DISCIPLINE_OPTIONS}
						placeholder="Choose discipline"
					/>
					<InputField
						label="Workflow status"
						type="radio"
						name="workflow-status"
						bind:value={radioValue}
						options={STATUS_OPTIONS}
					/>
					<InputField
						label="Notify project team"
						type="checkbox"
						bind:value={checkboxValue}
						helperText="Send an update when the document is submitted."
					/>
					<InputField label="Completion" type="range" bind:value={rangeValue} min={0} max={100} />
				</div>
			</Card>
		</section>

		<Card variant="panel" title="States">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<InputField
					label="Approved code"
					value="LDN-CRL-TCR"
					state="success"
					helperText="Looks good."
				/>
				<InputField label="Revision" value="P04" state="warning" helperText="Check latest issue." />
				<InputField
					label="Required field"
					value=""
					state="error"
					helperText="This field is required."
				/>
			</div>
		</Card>
	</div>
</main>

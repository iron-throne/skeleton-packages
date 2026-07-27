<main class="min-h-screen bg-surface-tertiary p-6 text-primary">
	<section class="card max-w-xl space-y-4">
		<div>
			<p class="section-label">UI Kit</p>
			<h1 class="mt-2">Component previews</h1>
		</div>

		<div class="flex flex-wrap gap-3">
			<a class="btn btn-primary w-fit" href="/card">Open card </a>
			<a class="btn btn-muted w-fit" href="/autocomplete">Open autocomplete </a>
			<a class="btn btn-secondary w-fit" href="/button">Open button </a>
			<a class="btn btn-muted w-fit" href="/image">Open image </a>
			<a class="btn btn-muted w-fit" href="/input">Open input </a>
			<a class="btn btn-muted w-fit" href="/folder-hierarchy">Open folder hierarchy</a>
			<a class="btn btn-muted w-fit" href="/table">Open table </a>
			<a class="btn btn-outline w-fit" href="/theme">Open theme colors</a>
		</div>
	</section>
</main>
<script lang="ts">
	import Accordion from '$lib/molecules/accordion/Accordion.svelte';
	import type { IAccordionData } from '$lib/molecules/accordion/types';
	import { Trash } from 'svelte-bootstrap-icons';

	const basicItems: IAccordionData[] = [
		{ id: 1, title: 'What is Skeleton UI Kit?', content: 'A shared component library used across the workspace apps.' },
		{ id: 2, title: 'How do I install it?', content: 'It is consumed as a workspace package, no separate install needed.' },
		{ id: 3, title: 'Can I customize the styles?', content: 'Yes — every part accepts a klass prop (parentklass, listKlass, detailKlass, summaryKlass, articleKlass).' }
	];

	const multipleItems: IAccordionData[] = [
		{ id: 'a', title: 'Section A', content: 'Multiple sections can be open at the same time here.' },
		{ id: 'b', title: 'Section B', content: 'Try opening this one without closing Section A.', expanded: true },
		{ id: 'c', title: 'Section C', content: 'Content for section C.' }
	];

	const mandatoryItems: IAccordionData[] = [
		{ id: 'first', title: 'Always at least one open', content: 'This one opens by default via mandatoryId.' },
		{ id: 'second', title: 'Try closing the other item', content: 'You cannot close the last remaining open item.' }
	];

	let controlledIds = $state<(number | string)[]>(['x2']);
	const controlledItems: IAccordionData[] = [
		{ id: 'x1', title: 'Item one', content: 'Controlled externally via bind:expandedIds.' },
		{ id: 'x2', title: 'Item two', content: 'Starts open because it is in controlledIds.' },
		{ id: 'x3', title: 'Item three', content: 'Toggle me from the buttons above too.' }
	];

	const disabledItems: IAccordionData[] = [
		{ id: 1, title: 'Enabled item', content: 'This one works normally.' },
		{ id: 2, title: 'Disabled item', content: 'You cannot open this one.', disabled: true },
		{ id: 3, title: 'Another enabled item', content: 'Also works normally.' }
	];

	const actionItems: IAccordionData[] = [
		{ id: 1, title: 'Row with a delete action', content: 'Click the trash icon without toggling this row.' },
		{ id: 2, title: 'Another row', content: 'The trash click also logs which item id was clicked.' }
	];
	const handleDelete = (itemId: number | string) => {
		console.log('delete clicked for item', itemId);
	};
</script>

{#snippet SectionTitle(text: string)}
	<h2 class="text-lg font-semibold text-primary mb-3">{text}</h2>
{/snippet}

<div class="min-h-screen bg-surface-tertiary p-8 space-y-10">
	<section>
		{@render SectionTitle('Basic')}
		<Accordion id="basic-accordion" items={basicItems} />
	</section>

	<section>
		{@render SectionTitle('Multiple open (multiple)')}
		<Accordion id="multiple-accordion" items={multipleItems} multiple />
	</section>

	<section>
		{@render SectionTitle('Mandatory (always one open)')}
		<Accordion id="mandatory-accordion" items={mandatoryItems} mandatory mandatoryId="first" />
	</section>

	<section>
		{@render SectionTitle('Controlled (bind:expandedIds)')}
		<div class="flex gap-2 mb-3">
			<button
				class="px-3 py-1.5 text-sm rounded-lg bg-surface-primary border border-border-primary"
				onclick={() => (controlledIds = controlledItems.map((i) => i.id))}
			>
				Open all
			</button>
			<button
				class="px-3 py-1.5 text-sm rounded-lg bg-surface-primary border border-border-primary"
				onclick={() => (controlledIds = [])}
			>
				Close all
			</button>
		</div>
		<Accordion id="controlled-accordion" items={controlledItems} multiple bind:expandedIds={controlledIds} />
		<p class="text-sm text-secondary mt-2">Open ids: {controlledIds.join(', ') || 'none'}</p>
	</section>

	<section>
		{@render SectionTitle('Variants')}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Accordion id="variant-default" items={basicItems} variant="default" />
			<Accordion id="variant-outlined" items={basicItems} variant="outlined" />
			<Accordion id="variant-inset" items={basicItems} variant="inset" />
			<Accordion id="variant-popout" items={basicItems} variant="popout" />
		</div>
	</section>

	<section>
		{@render SectionTitle('Density')}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Accordion id="density-compact" items={basicItems} density="compact" />
			<Accordion id="density-default" items={basicItems} density="default" />
			<Accordion id="density-comfortable" items={basicItems} density="comfortable" />
		</div>
	</section>

	<section>
		{@render SectionTitle('Disabled item vs. fully disabled accordion')}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Accordion id="disabled-item-accordion" items={disabledItems} />
			<Accordion id="fully-disabled-accordion" items={basicItems} disabled />
		</div>
	</section>

	<section>
		{@render SectionTitle('Right icon action (per-item id forwarded)')}
		<Accordion
			id="action-accordion"
			items={actionItems}
			rightIcon={{ expandIcon: Trash, collapseIcon: Trash, onclick: handleDelete }}
		/>
		<p class="text-sm text-secondary mt-2">Open devtools console and click the icon — it won't toggle the row.</p>
	</section>
</div>

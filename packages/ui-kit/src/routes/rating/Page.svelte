<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import { Rating } from '$molecules';
	import { ESize } from '@aryagg/types';

	let score = $state(3);
	let serviceScore = $state(4);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Rating</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Theme-aware star ratings for input, feedback summaries and read-only scores.
			</p>
		</header>

		<div class="grid gap-4 md:grid-cols-2">
			<Card variant="panel" title="Interactive">
				<Rating bind:value={score} allowClear size={ESize.LG} />
				<p class="mt-3 text-xs text-secondary">Selected value: {score} / 5</p>
			</Card>

			<Card variant="panel" title="Read-only">
				<Rating value={4} readonly size={ESize.LG} label="Customer score" />
				<p class="mt-3 text-xs text-secondary">4 out of 5 stars</p>
			</Card>

			<Card variant="panel" title="Sizes">
				<div class="flex flex-col items-start gap-3">
					<Rating value={4} readonly size={ESize.XS} label="Extra-small rating" />
					<Rating value={4} readonly size={ESize.SM} label="Small rating" />
					<Rating value={4} readonly size={ESize.MD} label="Medium rating" />
					<Rating value={4} readonly size={ESize.XL} label="Extra-large rating" />
				</div>
			</Card>

			<Card variant="panel" title="Custom scale">
				<Rating bind:value={serviceScore} length={7} size={ESize.MD} label="Service rating" />
				<p class="mt-3 text-xs text-secondary">Service score: {serviceScore} / 7</p>
			</Card>

			<Card variant="panel" title="Disabled">
				<Rating value={3} disabled size={ESize.LG} />
			</Card>

			<Card variant="panel" title="Parent color override">
				<Rating value={5} readonly size={ESize.LG} selectedKlass="text-success" />
			</Card>
		</div>
	</div>
</main>

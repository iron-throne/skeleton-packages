<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Rating from '$molecules/rating/Rating.svelte';

	let score = $state(3);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Rating</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Interactive score and rating control, with a read-only display mode.
			</p>
		</header>

		<Card variant="panel" title="Interactive">
			<Rating bind:value={score} />
			<p class="mt-3 text-xs text-secondary">Score: {score} / 5</p>
		</Card>

		<Card variant="panel" title="Read-only">
			<Rating value={4} length={5} readonly />
		</Card>

		<Card variant="panel" title="10-point scale">
			<Rating bind:value={score} length={10} />
		</Card>
	</div>
</main>

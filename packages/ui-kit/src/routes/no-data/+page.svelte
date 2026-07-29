<script lang="ts">
	import Button from '$lib/atoms/button/Button.svelte';
	import NoData from '$lib/atoms/no-data/NoData.svelte';
	import { FileEarmarkX } from 'svelte-bootstrap-icons';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="section-label">Atom</p>
			<h1>No data</h1>
		</header>
		<section class="card">
			<NoData text="No documents match the current filters." icon={FileEarmarkX}>
				<Button label="Clear filters" variant="outline" size="sm" />
			</NoData>
		</section>
	</div>
</main>

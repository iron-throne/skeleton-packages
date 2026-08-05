<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import NoData from '$atoms/no-data/NoData.svelte';
	import { ESize } from '@aryagg/types';
	import { FileEarmarkX } from 'svelte-bootstrap-icons';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>No data</h1>
		</header>
		<section class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
			<NoData text="No documents match the current filters." icon={FileEarmarkX}>
				<Button label="Clear filters" variant="outline" size={ESize.SM} />
			</NoData>
		</section>
	</div>
</main>

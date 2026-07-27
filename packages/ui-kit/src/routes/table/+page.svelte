<script lang="ts">
	import DocumentTable from '$lib/atoms/document-table/DocumentTable.svelte';
	import { DOCUMENT_ROWS } from './constants';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-7xl space-y-6">
		<header class="space-y-2">
			<p class="section-label">Atom</p>
			<h1>Document table</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				A CDE document table with search, row selection, ISO 19650 codes, status pills, and file badges.
			</p>
		</header>

		<DocumentTable rows={DOCUMENT_ROWS} total={18420} />
	</div>
</main>

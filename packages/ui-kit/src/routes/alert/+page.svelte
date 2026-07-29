<script lang="ts">
	import Alert from '$lib/atoms/alert/Alert.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Alert</h1>
		</header>
		<section class="grid gap-3">
			<Alert variant="success" title="Upload complete">All 24 documents passed validation.</Alert>
			<Alert variant="info" title="Information"
				>Metadata changes will be recorded in the audit trail.</Alert
			>
			<Alert variant="warning" title="Review required"
				>Three documents have missing suitability codes.</Alert
			>
			<Alert variant="error" title="Upload failed" dismissible
				>The server rejected two files. Try uploading them again.</Alert
			>
		</section>
	</div>
</main>

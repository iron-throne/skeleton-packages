<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import SnackBar from '$molecules/snackbar/Snackbar.svelte';
	import { snackStore } from '$lib/stores/snackbar.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>Snackbar</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Timed application notifications, driven from a global store so any component can trigger
				one. Mount <code>&lt;SnackBar /&gt;</code> once near the app root, then call
				<code>snackStore.showSuccess(...)</code> from anywhere.
			</p>
		</header>

		<Card variant="panel" title="Trigger a toast">
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					class="btn btn-primary btn-sm"
					onclick={() => snackStore.showSuccess('Document uploaded successfully.')}
				>
					Success
				</button>
				<button
					type="button"
					class="btn btn-secondary btn-sm"
					onclick={() => snackStore.showInfo('Metadata changes are recorded in the audit trail.')}
				>
					Info
				</button>
				<button
					type="button"
					class="btn btn-outline btn-sm"
					onclick={() => snackStore.showWarning('Three documents are missing suitability codes.')}
				>
					Warning
				</button>
				<button
					type="button"
					class="btn btn-outline btn-sm"
					onclick={() => snackStore.showError('The server rejected two files.')}
				>
					Error
				</button>
			</div>
		</Card>
	</div>
</main>

<SnackBar />

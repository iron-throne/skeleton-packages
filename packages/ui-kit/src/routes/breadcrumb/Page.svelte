<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Breadcrumb from '$organisms/bread-crumb/Breadcrumb.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
			<h1>Breadcrumb</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Hierarchical page navigation. Framework-agnostic — pass the current path as a
				<code>pathname</code> prop (e.g. <code>page.url.pathname</code> from <code>$app/state</code>
				in a SvelteKit host app).
			</p>
		</header>

		<Card variant="panel" title="Default">
			<Breadcrumb pathname="/projects/crossrail-2/documents" />
		</Card>

		<Card variant="panel" title="With custom segment labels">
			<Breadcrumb
				pathname="/admin/reset-password"
				labels={{ admin: 'Administration', 'reset-password': 'Reset Password' }}
			/>
		</Card>

		<Card variant="panel" title="Custom home link">
			<Breadcrumb
				pathname="/projects/crossrail-2"
				homeLabel="Dashboard"
				homeHref="#/"
				labels={{ 'crossrail-2': 'Crossrail 2' }}
			/>
		</Card>
	</div>
</main>

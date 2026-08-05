<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import Tooltip from '$atoms/tooltip/Tooltip.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Tooltip</h1>
		</header>
		<section
			class="flex min-h-64 flex-wrap items-center justify-center gap-8 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<Tooltip text="Appears above" position="top"><Button label="Top" variant="outline" /></Tooltip
			>
			<Tooltip text="Appears below" position="bottom"
				><Button label="Bottom" variant="outline" /></Tooltip
			>
			<Tooltip text="Appears left" position="left"
				><Button label="Left" variant="outline" /></Tooltip
			>
			<Tooltip text="Appears right" position="right"
				><Button label="Right" variant="outline" /></Tooltip
			>
		</section>
	</div>
</main>

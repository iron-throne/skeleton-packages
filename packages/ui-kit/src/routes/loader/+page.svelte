<script lang="ts">
	import SkeletonLoader from '$lib/atoms/skeleton-loader/SkeletonLoader.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="section-label">Atom</p>
			<h1>Loader</h1>
		</header>
		<section class="grid gap-4 md:grid-cols-2">
			<div class="card space-y-4">
				<h2 class="text-lg">Text rows</h2>
				<SkeletonLoader lines={4} />
			</div>
			<div class="card space-y-4">
				<h2 class="text-lg">Avatar and content</h2>
				<div class="flex gap-3">
					<SkeletonLoader circle lines={1} width="48px" height="48px" />
					<div class="flex-1"><SkeletonLoader lines={3} height="0.75rem" /></div>
				</div>
			</div>
			<div class="card space-y-4 md:col-span-2">
				<h2 class="text-lg">Fixed width</h2>
				<SkeletonLoader lines={2} width="60%" varied={false} height="1.25rem" />
			</div>
		</section>
	</div>
</main>

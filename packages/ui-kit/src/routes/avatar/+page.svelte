<script lang="ts">
	import Avatar from '$lib/atoms/avatar/Avatar.svelte';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="section-label">Atom</p>
			<h1>Avatar</h1>
		</header>
		<section class="card space-y-5">
			<h2 class="text-lg">Sizes</h2>
			<div class="flex items-end gap-4">
				<Avatar name="Sarah Chen" size="xs" />
				<Avatar name="Sarah Chen" size="sm" />
				<Avatar name="Sarah Chen" size="md" />
				<Avatar name="Sarah Chen" size="lg" />
				<Avatar name="Sarah Chen" size="xl" />
			</div>
			<h2 class="text-lg">Presence</h2>
			<div class="flex gap-4">
				<Avatar name="Sarah Chen" status="online" />
				<Avatar name="Marcus Weber" status="away" />
				<Avatar name="Priya Sharma" status="offline" />
				<Avatar src="https://example.invalid/avatar.jpg" name="Image fallback" />
			</div>
		</section>
	</div>
</main>

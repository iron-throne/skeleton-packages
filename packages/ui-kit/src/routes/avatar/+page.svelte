<script lang="ts">
	import Avatar from '$lib/atoms/avatar/Avatar.svelte';
	import { ESize } from '@aryagg/types';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Avatar</h1>
		</header>
		<section
			class="space-y-5 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<h2 class="text-lg">Sizes</h2>
			<div class="flex items-end gap-4">
				<Avatar name="Sarah Chen" size={ESize.XS} />
				<Avatar name="Sarah Chen" size={ESize.SM} />
				<Avatar name="Sarah Chen" size={ESize.MD} />
				<Avatar name="Sarah Chen" size={ESize.LG} />
				<Avatar name="Sarah Chen" size={ESize.XL} />
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

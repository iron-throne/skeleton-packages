<script lang="ts">
	import Badge from '$lib/atoms/badge/Badge.svelte';
	import { ESize } from '@aryagg/types';
	import { CheckCircle } from 'svelte-bootstrap-icons';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Badge</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				V3-compatible status pills with semantic colors, appearances, sizes, icons, dots, and direct
				visual overrides.
			</p>
		</header>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">V3 project card</p>
				<h2 class="mt-2 text-lg">Exact project statuses</h2>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="success" appearance="solid" size={ESize.SM} uppercase>Active</Badge>
				<Badge variant="blue">Stage 4</Badge>
				<Badge variant="red">142 issues</Badge>
				<Badge variant="green">94% ISO</Badge>
			</div>
		</section>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Colors</p>
				<h2 class="mt-2 text-lg">V3 semantic palette</h2>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge>Default</Badge>
				<Badge variant="accent">Accent</Badge>
				<Badge variant="blue">Blue</Badge>
				<Badge variant="green">Green</Badge>
				<Badge variant="amber">Amber</Badge>
				<Badge variant="red">Red</Badge>
				<Badge variant="violet">Violet</Badge>
			</div>
		</section>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Composition</p>
				<h2 class="mt-2 text-lg">Appearances and content</h2>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="green" dot>Live</Badge>
				<Badge variant="success" appearance="solid" icon={CheckCircle}>Approved</Badge>
				<Badge variant="amber" appearance="outline">Pending</Badge>
				<Badge
					backgroundColor="#2f2459"
					textColor="#f4efff"
					borderColor="#9d8ddb"
					borderRadius="4px"
				>
					Custom
				</Badge>
			</div>
		</section>
	</div>
</main>

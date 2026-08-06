<script lang="ts">
	import Icon from '$atoms/icon/Icon.svelte';
	import {
		Bell,
		Building,
		FileEarmarkText,
		Folder2,
		Gear,
		Person,
		Search,
		Star
	} from 'svelte-bootstrap-icons';
	const icons = [
		['Search', Search],
		['Bell', Bell],
		['Folder', Folder2],
		['File', FileEarmarkText],
		['Building', Building],
		['Person', Person],
		['Settings', Gear],
		['Star', Star]
	] as const;
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary p-6 text-primary">
	<div class="mx-auto max-w-3xl space-y-6">
		<header>
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Icon</h1>
		</header>
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each icons as item (item[0])}
				<div
					class="flex items-center gap-3 rounded-xl border border-border-primary bg-surface-primary p-4 shadow-sm"
				>
					<Icon icon={item[1]} klass="size-5 text-accent" />
					<span class="text-sm text-secondary">{item[0]}</span>
				</div>
			{/each}
		</section>
	</div>
</main>

<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import Dialog from '$organisms/dialog/Dialog.svelte';
	import { ESize } from '@aryagg/types';
	import { ExclamationTriangle, InfoCircle, PencilSquare } from 'svelte-bootstrap-icons';

	let standardOpen = $state(false);
	let infoOpen = $state(false);
	let dangerOpen = $state(false);
</script>

<svelte:head><title>Dialog / Modal · UI Kit</title></svelte:head>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
			<h1>Dialog / Modal</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				One reusable component for dialogs and modal workflows, with configurable headers,
				content, footers, sizes and semantic states.
			</p>
		</header>

		<section class="grid gap-4 sm:grid-cols-3">
			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<PencilSquare class="size-5 text-accent" />
				<h2 class="mt-4 text-base font-semibold">Standard</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">General forms and focused workflows.</p>
				<Button class="mt-5" label="Open dialog" onclick={() => (standardOpen = true)} />
			</article>

			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<InfoCircle class="size-5 text-info" />
				<h2 class="mt-4 text-base font-semibold">Information</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">
					Context and important supporting details.
				</p>
				<Button
					class="mt-5"
					label="Open information"
					variant="info"
					onclick={() => (infoOpen = true)}
				/>
			</article>

			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<ExclamationTriangle class="size-5 text-error" />
				<h2 class="mt-4 text-base font-semibold">Destructive</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">Confirm an irreversible or risky action.</p>
				<Button
					class="mt-5"
					label="Delete project"
					variant="danger"
					onclick={() => (dangerOpen = true)}
				/>
			</article>
		</section>
	</div>
</main>

<Dialog
	bind:open={standardOpen}
	title="Edit project"
	description="Update the project information below."
	icon={PencilSquare}
	size={ESize.MD}
>
	<div class="grid gap-4">
		<label class="grid gap-1.5">
			<span class="text-xs font-semibold text-secondary">Project name</span>
			<input
				class="h-10 rounded-lg border border-border-primary bg-surface-secondary px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
				value="Crossrail 2"
			/>
		</label>
		<label class="grid gap-1.5">
			<span class="text-xs font-semibold text-secondary">Description</span>
			<textarea
				class="min-h-24 rounded-lg border border-border-primary bg-surface-secondary p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
				>Infrastructure coordination project.</textarea
			>
		</label>
	</div>

	{#snippet footer()}
		<Button label="Cancel" variant="outline" onclick={() => (standardOpen = false)} />
		<Button label="Save changes" onclick={() => (standardOpen = false)} />
	{/snippet}
</Dialog>

<Dialog
	bind:open={infoOpen}
	title="Document information"
	description="This revision is currently visible to all project members."
	icon={InfoCircle}
	variant="info"
	size={ESize.SM}
>
	<p>
		Publishing another revision will archive this version while preserving its complete audit
		history.
	</p>

	{#snippet footer()}
		<Button label="Got it" variant="info" onclick={() => (infoOpen = false)} />
	{/snippet}
</Dialog>
<Dialog
	bind:open={dangerOpen}
	title="Delete this project?"
	description="This action cannot be undone."
	icon={ExclamationTriangle}
	variant="danger"
	size={ESize.SM}
	closeOnBackdrop={false}
>
	<p>
		All project documents, spaces and saved views will be permanently removed. Type confirmation can
		be composed here when required.
	</p>

	{#snippet footer()}
		<Button label="Cancel" variant="outline" onclick={() => (dangerOpen = false)} />
		<Button label="Delete project" variant="danger" onclick={() => (dangerOpen = false)} />
	{/snippet}
</Dialog>

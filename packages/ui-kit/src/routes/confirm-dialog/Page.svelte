<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import ConfirmDialog from '$organisms/modals/ConfirmDialog.svelte';
	import {
		CheckCircleFill,
		ExclamationTriangleFill,
		InfoCircleFill,
		TrashFill
	} from 'svelte-bootstrap-icons';

	let warningOpen = $state(false);
	let dangerOpen = $state(false);
	let infoOpen = $state(false);
	let successPopupOpen = $state(false);
	let infoPopupOpen = $state(false);
	let deleting = $state(false);

	async function confirmDelete() {
		deleting = true;
		await new Promise((resolve) => setTimeout(resolve, 700));
		deleting = false;
	}
</script>

<svelte:head>
	<title>Confirm Dialog · UI Kit</title>
</svelte:head>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
			<h1>Confirm Dialog</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Focused confirmation for important actions, with semantic variants and asynchronous
				loading support.
			</p>
		</header>

		<section class="grid gap-4 sm:grid-cols-3">
			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<ExclamationTriangleFill class="size-5 text-warning" />
				<h2 class="mt-4 text-base font-semibold">Warning</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">
					Ask before replacing or changing existing information.
				</p>
				<Button
					class="mt-5"
					label="Replace file"
					variant="secondary"
					onclick={() => (warningOpen = true)}
				/>
			</article>

			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<TrashFill class="size-5 text-error" />
				<h2 class="mt-4 text-base font-semibold">Danger</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">
					Confirm a destructive action and show its loading state.
				</p>
				<Button
					class="mt-5"
					label="Delete project"
					variant="danger"
					onclick={() => (dangerOpen = true)}
				/>
			</article>

			<article class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<InfoCircleFill class="size-5 text-info" />
				<h2 class="mt-4 text-base font-semibold">Information</h2>
				<p class="mt-1 min-h-10 text-sm text-secondary">
					Confirm a normal action without destructive emphasis.
				</p>
				<Button
					class="mt-5"
					label="Publish revision"
					variant="info"
					onclick={() => (infoOpen = true)}
				/>
			</article>
		</section>

		<section class="space-y-4">
			<div>
				<h2 class="text-lg font-semibold">Popups without actions</h2>
				<p class="mt-1 text-sm text-secondary">
					Use <code>showActions={false}</code> for feedback that does not need a decision.
				</p>
			</div>
			<div class="flex flex-wrap gap-3 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
				<Button
					label="Show success popup"
					variant="success"
					onclick={() => (successPopupOpen = true)}
				/>
				<Button
					label="Show information popup"
					variant="info"
					onclick={() => (infoPopupOpen = true)}
				/>
			</div>
		</section>
	</div>
</main>

<ConfirmDialog
	bind:open={warningOpen}
	icon={ExclamationTriangleFill}
	message="A file with this name already exists. Do you want to replace it?"
	confirmLabel="Replace file"
	variant="warning"
/>

<ConfirmDialog
	bind:open={dangerOpen}
	icon={TrashFill}
	message="Delete this project and all of its documents? This action cannot be undone."
	confirmLabel="Delete project"
	variant="danger"
	loading={deleting}
	onconfirm={confirmDelete}
/>

<ConfirmDialog
	bind:open={infoOpen}
	icon={InfoCircleFill}
	message="Publish this revision for every member of the project?"
	confirmLabel="Publish"
	variant="info"
/>

<ConfirmDialog
	bind:open={successPopupOpen}
	icon={CheckCircleFill}
	message="Your changes were saved successfully."
	variant="success"
	showActions={false}
/>

<ConfirmDialog
	bind:open={infoPopupOpen}
	icon={InfoCircleFill}
	message="This document is already using the latest available revision."
	variant="info"
	showActions={false}
/>

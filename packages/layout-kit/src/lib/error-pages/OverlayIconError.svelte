<script lang="ts">
	import { page } from '$app/state';
	import { LightbulbOff, ArrowClockwise, ArrowLeft } from 'svelte-bootstrap-icons';
	import { errorTitle, errorHint } from '@aryagg/utils';
	import { resolve } from '$app/paths';
	import type { HttpStatus, IconType } from '@aryagg/types';
	import { Icon } from '@aryagg/ui-kit';
	import type { Snippet } from 'svelte';

	let {
		status = $bindable(page.status),
		message = $bindable(page.error?.message ?? 'An unexpected error occurred'),
		title = $bindable(errorTitle(status)),
		hint = $bindable(errorHint(status, message)),

		hideIcon = false,
		icon = LightbulbOff,
		mainKlass = '',
		containerKlass = '',
		iconKlass = '',
		footerSlot
	} = $props<{
		status?: HttpStatus;
		message?: string;
		title?: string;
		hint?: string;

		hideIcon?: boolean;
		icon?: IconType;
		mainKlass?: string;
		containerKlass?: string;
		iconKlass?: string;
		footerSlot?: Snippet;
	}>();
</script>

<svelte:head>
	<title>Error {status}</title>
</svelte:head>

<main class="bg-surface-primary relative flex min-h-screen flex-col overflow-hidden {mainKlass}">
	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(14rem,40vw,32rem)] leading-none font-bold text-error/10 select-none"
	>
		{status}
	</div>

	<div class="relative flex flex-1 items-center justify-center px-8 pb-16">
		<div class="flex flex-col items-center gap-4 text-center {containerKlass}">
			<!-- Icon -->
			{#if !hideIcon}
				<div
					class="mb-2 flex size-20 items-center justify-center rounded-full bg-error text-on-error"
				>
					<Icon {icon} klass="size-10 {iconKlass}" />
				</div>
			{/if}

			<!-- Title -->
			<h1 class="text-content-secondary text-lg font-bold tracking-widest uppercase">
				{title}
			</h1>

			<!-- Hint -->
			<p class="font-light italic">
				{hint}
			</p>

			<!-- CTA -->
			{#if footerSlot}
				{@render footerSlot()}
			{:else}
				<div class="mt-10 flex items-center gap-8">
					<a href={resolve('/')} class="btn btn-primary">
						GO TO HOME
						<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
					</a>

					<button onclick={() => history.back()} class="btn btn-secondary">
						Go back
						<ArrowLeft class="size-4" />
					</button>

					<button onclick={() => location.reload()} class="btn btn-outline">
						<ArrowClockwise class="size-4" />
						Refresh
					</button>
				</div>
			{/if}
		</div>
	</div>
</main>

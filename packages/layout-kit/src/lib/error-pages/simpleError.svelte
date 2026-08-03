<script lang="ts">
	import { page } from '$app/state';
	import { LightbulbOff } from 'svelte-bootstrap-icons';
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
		footerSlot,
		leftSlot
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
		leftSlot?: Snippet;
	}>();
</script>

<svelte:head>
	<title>Error {status}</title>
</svelte:head>

<main class="bg-surface-primary flex min-h-screen flex-col {mainKlass}">
	<!-- Main content -->
	<div class="flex flex-1 items-center justify-center px-8 pb-16">
		<div class="flex flex-col items-center gap-16 md:flex-row md:gap-24 {containerKlass}">
			<!-- Left: Icon in circle -->
			{#if leftSlot}
				{@render leftSlot()}
			{:else if !hideIcon}
				<div class="shrink-0">
					<div class="bg-error text-on-error flex size-72 items-center justify-center rounded-full">
						<div class="text-on-error animate-bounce opacity-90 duration-300">
							<Icon {icon} klass="size-[140px] {iconKlass}" />
						</div>
					</div>
				</div>
			{/if}

			<!-- Right: Text content -->
			<div class="flex flex-col items-center gap-4">
				<!-- Big status number -->
				<p class="text-error text-[clamp(6rem,15vw,11rem)] leading-none select-none">
					{status}
				</p>

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

						<button onclick={() => history.back()} class="btn btn-secondary"> Go back </button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>

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

<main class="bg-surface-primary flex min-h-screen flex-wrap {mainKlass}">
	<!-- Accent panel -->
	<div class="bg-error relative hidden w-full items-center justify-center sm:flex sm:w-2/5">
		{#if !hideIcon}
			<div class="text-on-error flex flex-col items-center gap-4 p-10">
				<Icon {icon} klass="size-20 {iconKlass}" />
				<span class="text-on-error/40 text-[7rem] leading-none font-black select-none">
					{status}
				</span>
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="flex w-full flex-1 items-center justify-center px-8 py-16 sm:w-3/5">
		<div class="flex w-full max-w-sm flex-col gap-4 {containerKlass}">
			<span class="text-error text-5xl font-bold sm:hidden">{status}</span>

			<h1 class="text-primary text-2xl font-bold">
				{title}
			</h1>

			<p class="text-secondary text-sm">
				{hint}
			</p>

			<!-- CTA -->
			{#if footerSlot}
				{@render footerSlot()}
			{:else}
				<div class="mt-6 flex items-center gap-4">
					<a href={resolve('/',{})} class="btn btn-primary">
						GO TO HOME
						<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
					</a>

					<button onclick={() => history.back()} class="btn btn-secondary"> Go back </button>
				</div>
			{/if}
		</div>
	</div>
</main>

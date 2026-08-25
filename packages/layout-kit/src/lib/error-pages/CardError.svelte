<script lang="ts">
	import { ArrowClockwise, ArrowLeft, LightbulbOff } from 'svelte-bootstrap-icons';
	import { errorTitle, errorHint } from '@aryagg/utils';
	import { EHttpStatus, type IconType } from '@aryagg/types';
	import { Icon } from '@aryagg/ui-kit';
	import type { Snippet } from 'svelte';

	let {
		status = $bindable(EHttpStatus.INTERNAL_SERVER_ERROR),
		message = $bindable('An unexpected error occurred'),
		title = $bindable(errorTitle(status)),
		hint = $bindable(errorHint(status, message)),

		hideIcon = false,
		icon = LightbulbOff,
		homeHref = '/',
		mainKlass = '',
		containerKlass = '',
		iconKlass = '',
		footerSlot
	} = $props<{
		status?: EHttpStatus;
		message?: string;
		title?: string;
		hint?: string;

		hideIcon?: boolean;
		icon?: IconType;
		homeHref?: string;
		mainKlass?: string;
		containerKlass?: string;
		iconKlass?: string;
		footerSlot?: Snippet;
	}>();
</script>

<svelte:head>
	<title>Error {status}</title>
</svelte:head>

<main
	class="bg-surface-secondary flex min-h-screen items-center justify-center px-4 py-16 {mainKlass}"
>
	<div
		class="w-full max-w-md overflow-hidden rounded-2xl border border-border-primary bg-surface-primary shadow-lg {containerKlass}"
	>
		<div class="bg-error h-1.5 w-full"></div>

		<div class="flex flex-col items-center gap-4 px-8 py-10 text-center">
			<!-- Icon -->
			{#if !hideIcon}
				<div class="bg-error/10 text-error flex size-16 items-center justify-center rounded-full">
					<Icon {icon} klass="size-8 {iconKlass}" />
				</div>
			{/if}

			<!-- Status badge -->
			<span
				class="bg-surface-tertiary text-tertiary rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase"
			>
				Error {status}
			</span>

			<!-- Title -->
			<h1 class="text-primary text-lg font-bold">
				{title}
			</h1>

			<!-- Hint -->
			<p class="text-secondary text-sm">
				{hint}
			</p>

			<!-- CTA -->
			{#if footerSlot}
				{@render footerSlot()}
			{:else}
				<div class="mt-4 flex w-full flex-col gap-2">
					<a href={homeHref} class="btn btn-primary w-full"> GO TO HOME </a>
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

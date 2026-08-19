<script lang="ts">
	import { onDestroy } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { snackStore } from '$lib/stores/snackbar.svelte';
	import { Icon } from '$lib/atoms';
	import { ESnackType } from '@aryagg/types';
	import {
		CheckCircleFill,
		ExclamationTriangleFill,
		XCircleFill,
		InfoCircleFill,
		XLg
	} from 'svelte-bootstrap-icons';

	const snackbarConfig = {
		[ESnackType.SUCCESS]: {
			title: 'Success',
			icon: CheckCircleFill,
			container: 'bg-success text-on-success',
			soft: 'bg-on-success/15 text-on-success',
			border: 'border-on-success/20',
			track: 'bg-on-success/20',
			progress: 'bg-on-success'
		},
		[ESnackType.DANGER]: {
			title: 'Something went wrong',
			icon: XCircleFill,
			container: 'bg-error text-on-error',
			soft: 'bg-on-error/15 text-on-error',
			border: 'border-on-error/20',
			track: 'bg-on-error/20',
			progress: 'bg-on-error'
		},
		[ESnackType.WARNING]: {
			title: 'Attention needed',
			icon: ExclamationTriangleFill,
			container: 'bg-warning text-on-warning',
			soft: 'bg-on-warning/15 text-on-warning',
			border: 'border-on-warning/20',
			track: 'bg-on-warning/20',
			progress: 'bg-on-warning'
		},
		[ESnackType.INFO]: {
			title: 'For your information',
			icon: InfoCircleFill,
			container: 'bg-info text-on-info',
			soft: 'bg-on-info/15 text-on-info',
			border: 'border-on-info/20',
			track: 'bg-on-info/20',
			progress: 'bg-on-info'
		}
	};

	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const currentConfig = $derived(
		snackStore.current ? snackbarConfig[snackStore.current.type] : snackbarConfig[ESnackType.INFO]
	);
	const timeout = $derived(snackStore.current?.timeOut ?? 5000);

	onDestroy(() => {
		if (timeoutId) clearTimeout(timeoutId);
	});

	$effect(() => {
		if (!snackStore.current) return;
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => snackStore.close(), timeout);
	});
</script>

{#if snackStore.current}
	<div
		role={snackStore.current.type === ESnackType.DANGER ? 'alert' : 'status'}
		aria-live={snackStore.current.type === ESnackType.DANGER ? 'assertive' : 'polite'}
		transition:fly={{ y: 16, duration: 240, easing: cubicOut }}
		class="fixed right-4 bottom-4 z-[1000] w-[min(400px,calc(100vw-2rem))] sm:right-6 sm:bottom-6"
	>
		<div
			data-alert={snackStore.current.type}
			class="relative overflow-hidden rounded-2xl border shadow-xl {currentConfig.container} {currentConfig.border}"
		>
			<div class="flex items-start gap-3 p-4 pr-3">
				<!-- Icon -->
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-xl {currentConfig.soft}"
				>
					<Icon icon={currentConfig.icon} />
				</div>

				<!-- Content -->
				<div class="min-w-0 flex-1 py-0.5">
					<p class="text-sm leading-5 font-semibold">
						{currentConfig.title}
					</p>

					<p class="mt-1 text-sm leading-5 opacity-90">
						{snackStore.current.message}
					</p>
				</div>

				<!-- Close -->
				<button
					type="button"
					onclick={() => snackStore.close()}
					aria-label="Dismiss notification"
					class="flex size-9 shrink-0 items-center justify-center rounded-xl {currentConfig.soft} transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
				>
					<Icon icon={XLg} />
				</button>
			</div>

			<!-- Timeout indicator -->
			<div class="h-1 w-full {currentConfig.track}">
				<div
					class="snackbar-progress h-full origin-left {currentConfig.progress}"
					style:animation-duration={`${timeout}ms`}
				></div>
			</div>
		</div>
	</div>
{/if}

<style>
	.snackbar-progress {
		animation-name: snackbar-countdown;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	@keyframes snackbar-countdown {
		from {
			transform: scaleX(1);
		}

		to {
			transform: scaleX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.snackbar-progress {
			animation: none;
		}
	}
</style>

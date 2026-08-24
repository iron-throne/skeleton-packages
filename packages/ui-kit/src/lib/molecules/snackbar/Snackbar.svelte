<script lang="ts">
	import { onDestroy } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	import { snackStore } from '$lib/stores/snackbar.svelte';
	import { Icon } from '$lib/atoms';
	import { ESnackType } from '@aryagg/types';

	import { CheckLg, ExclamationLg, InfoLg, XLg } from 'svelte-bootstrap-icons';

	const snackbarConfig = {
		[ESnackType.SUCCESS]: {
			icon: CheckLg,
			iconClass: 'bg-success text-on-success',
			borderClass: 'border-success/30',
			actionClass: 'text-success hover:bg-success/10',
			timerClass: 'bg-success'
		},
		[ESnackType.DANGER]: {
			icon: XLg,
			iconClass: 'bg-error text-on-error',
			borderClass: 'border-error/30',
			actionClass: 'text-error hover:bg-error/10',
			timerClass: 'bg-error'
		},
		[ESnackType.WARNING]: {
			icon: ExclamationLg,
			iconClass: 'bg-warning text-on-warning',
			borderClass: 'border-warning/30',
			actionClass: 'text-warning hover:bg-warning/10',
			timerClass: 'bg-warning'
		},
		[ESnackType.INFO]: {
			icon: InfoLg,
			iconClass: 'bg-info text-on-info',
			borderClass: 'border-info/30',
			actionClass: 'text-info hover:bg-info/10',
			timerClass: 'bg-info'
		}
	};

	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const config = $derived(
		snackStore.current ? snackbarConfig[snackStore.current.type] : snackbarConfig[ESnackType.INFO]
	);

	const timeout = $derived(snackStore.current?.timeOut ?? 8000);

	onDestroy(() => {
		if (timeoutId) clearTimeout(timeoutId);
	});

	$effect(() => {
		if (!snackStore.current) return;

		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			snackStore.close();
		}, timeout);
	});
</script>

{#if snackStore.current}
	<div
		role={snackStore.current.type === ESnackType.DANGER ? 'alert' : 'status'}
		aria-live={snackStore.current.type === ESnackType.DANGER ? 'assertive' : 'polite'}
		transition:fly={{
			y: 20,
			duration: 220,
			easing: cubicOut
		}}
		class="fixed bottom-12 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
	>
		<div
			class="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-on-accent px-3 py-3 shadow-lg {config.borderClass}"
		>
			<!-- Status icon -->
			<div class="flex size-9 shrink-0 items-center justify-center rounded-lg {config.iconClass}">
				<Icon icon={config.icon} />
			</div>

			<!-- Message -->
			<p class="min-w-0 flex-1 text-sm leading-5 font-medium text-brand-secondary">
				{snackStore.current.message}
			</p>

			<!-- Close -->
			<button
				type="button"
				onclick={() => snackStore.close()}
				aria-label="Close notification"
				class="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors {config.actionClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
			>
				<Icon icon={XLg} />
			</button>

			<!-- Timer -->
			<div
				class="snackbar-timer absolute bottom-0 left-0 h-[2px] {config.timerClass}"
				style:animation-duration={`${timeout}ms`}
			></div>
		</div>
	</div>
{/if}

<style>
	.snackbar-timer {
		width: 100%;
		transform-origin: left;
		animation-name: snackbar-timer;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	@keyframes snackbar-timer {
		from {
			transform: scaleX(1);
		}

		to {
			transform: scaleX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.snackbar-timer {
			animation: none;
		}
	}
</style>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';
	import { ESnackType } from '@aryagg/types';
	import { snackStore } from '$lib/stores/snackbar.svelte';

	const alertIcon: Record<ESnackType, string> = {
		[ESnackType.SUCCESS]: '✓',
		[ESnackType.DANGER]: '⚠',
		[ESnackType.WARNING]: '✕',
		[ESnackType.INFO]: 'ℹ'
	};

	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	onDestroy(() => {
		if (timeoutId) clearTimeout(timeoutId);
	});

	$effect(() => {
		if (snackStore.current) {
			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(() => snackStore.close(), snackStore.current.timeOut ?? 3000);
		}
	});
</script>

{#if snackStore.current}
	{@const duration = snackStore.current.timeOut ?? 3000}

	<div
		role="alert"
		transition:fly={{ y: 16, duration: 280, easing: cubicOut }}
		class="fixed bottom-6 left-1/2 z-1000 w-88 max-w-[calc(100vw-2rem)] -translate-x-1/2"
	>
		<div
			data-alert={snackStore.current.type}
			class="relative overflow-hidden rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm"
		>
			<div class="flex items-center gap-3">
				<i> {alertIcon[snackStore.current.type]}</i>

				<p class="flex-1 min-w-0 text-[13px] font-medium leading-5" >
					{snackStore.current.message}
				</p>

				<button
					type="button"
					onclick={() => snackStore.close()}
					aria-label="Dismiss"
					class="inline-flex shrink-0 items-center justify-center rounded-md p-1 opacity-60 transition-all duration-150 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
				>
					<i class="bi bi-x text-lg leading-none"></i>
				</button>
			</div>

			<div
				class="absolute bottom-0 left-0 h-0.5 bg-current opacity-25"
				style="
					width:100%;
					animation:snack-shrink {duration}ms linear forwards;
				"
			></div>
		</div>
	</div>
{/if}

<style>
	@keyframes snack-shrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
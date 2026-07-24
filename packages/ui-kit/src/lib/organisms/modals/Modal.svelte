<script lang="ts">
	import { ESize } from '@aryagg/types';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet, SvelteComponent } from 'svelte';
	import { XLg } from 'svelte-bootstrap-icons';
	import { Icon } from '$lib/atoms';
	import { SIZE_CLASS } from '$lib/constants';

	let {
		open = $bindable(false),
		title = '',
		icon = null,
		size = ESize.MD,
		closeOnBackdrop = true,
		closeOnEsc = true,
		hideClose = false,
		children,
		titleSlot,
		footerSlot,
		panelKlass,
		backdropKlass,
		parentKlass,
		bodyKlass,
		footerKlass
	}: {
		open: boolean;
		title?: string;
		icon?: string | (new (...args: any[]) => SvelteComponent) | null;
		size?: ESize;
		closeOnBackdrop?: boolean;
		closeOnEsc?: boolean;
		hideClose?: boolean;
		children: Snippet;
		titleSlot?: Snippet;
		footerSlot?: Snippet;
		parentKlass?: string;
		backdropKlass?: string;
		panelKlass?: string;
		bodyKlass?: string;
		footerKlass?: string;
	} = $props();



	const handleBackdrop = () => {
		if (closeOnBackdrop) close();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (closeOnEsc && e.key === 'Escape') close();
	};
	const close = () => {
		open = false;
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
		class="fixed inset-0 z-200 flex items-center justify-center p-4 {parentKlass}"
		transition:fade={{ duration: 180 }}
	>
		<!-- Dim layer -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/50 {backdropKlass}" onclick={handleBackdrop}></div>

		<!-- Panel -->
		<div
			class="relative w-full {SIZE_CLASS[
				size
			]} bg-surface-primary rounded-2xl shadow-2xl border border-border-primary flex flex-col max-h-[90vh] {panelKlass}"
			transition:scale={{ duration: 220, easing: cubicOut, start: 0.95 }}
		>
			<!-- Header -->
			{#if titleSlot}
				{@render titleSlot()}
			{:else if title}
				<div
					class="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0"
				>
					<div class="flex gap-3 items-center">
						{#if icon}
							<span
								class="p-2 bg-accent/20 rounded-full flex justify-center items-center text-accent"
							>
								<Icon {icon} />
							</span>
						{/if}
						<h2 class="text-base font-semibold text-accent">
							{title}
						</h2>
					</div>
					{@render CloseBtn()}
				</div>
			{/if}
			{#if !title && !hideClose}
				<!-- No title: show close button in absolute corner -->
				{@render CloseBtn('absolute top-3 right-3 z-10')}
			{/if}

			<!-- Body -->
			<div class="flex-1 overflow-y-auto px-6 py-5 text-sm text-content-primary {bodyKlass}">
				{@render children()}
			</div>

			<!-- Footer (optional) -->
			{#if footerSlot}
				<div
					class="px-6 py-4 border-t border-border-primary shrink-0 flex items-center justify-end gap-3 {footerKlass}"
				>
					{@render footerSlot()}
				</div>
			{/if}
		</div>
	</div>
{/if}

{#snippet CloseBtn(klass: string = '')}
	<button
		onclick={close}
		class="absolute top-3 right-3 p-1.5 border-0 rounded-full text-content-tertiary hover:text-content-primary opacity-60 hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-accent/20 {klass}"
		aria-label="Close modal"
	>
		<XLg width={16} height={16} />
	</button>
{/snippet}

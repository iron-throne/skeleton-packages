<script lang="ts">
	import Icon from '$lib/atoms/icon/Icon.svelte';
	import type { Snippet, SvelteComponent } from 'svelte';
	import Modal from './Modal.svelte';
	import { ExclamationTriangleFill } from 'svelte-bootstrap-icons';

	type Variant = 'danger' | 'warning' | 'info';

	let {
		open = $bindable(false),
		icon = ExclamationTriangleFill,
		message = '',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'danger',
		loading = false,
		parentKlass,
		msgKlass,
		onconfirm,
		oncancel,
		confirmFooterSlot
	}: {
		open: boolean;
		icon?: string | (new (...args: any[]) => SvelteComponent) | null;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: Variant;
		loading?: boolean;
		parentKlass?: string;
		msgKlass?: string;

		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
		confirmFooterSlot?: Snippet;
	} = $props();

	const btnClass: Record<Variant, string> = {
		danger: 'bg-error text-white hover:bg-error/90',
		warning: 'bg-warning text-content-primary hover:bg-warning/90',
		info: 'bg-accent text-white hover:bg-accent/90'
	};

	const handleConfirm = async ()=> {
		await onconfirm?.();
		open = false;
	}

	const handleCancel =() => {
		oncancel?.();
		open = false;
	}
</script>

<Modal
	bind:open
	size="sm"
	closeOnBackdrop={!loading}
	closeOnEsc={!loading}
	footerKlass="border-t-0"
>
	<div class="flex flex-col gap-2 {parentKlass}">
		{#if variant === 'danger' || variant === 'warning'}
			<div class="flex justify-center">
				<span
					class="size-22 rounded-full flex items-center justify-center
                    {variant === 'danger'
						? 'bg-error/10 text-error'
						: 'bg-warning/10 text-warning'}"
				>
					<Icon {icon} klass="size-14" />
				</span>
			</div>
		{/if}
		<p class="text-sm text-content-secondary text-center leading-relaxed {msgKlass}">{message}</p>
	</div>

	{#snippet footerSlot()}
		{#if confirmFooterSlot}
			{@render confirmFooterSlot()}
		{:else}
			<div class="flex justify-center w-full gap-4">
				<button
					onclick={handleCancel}
					disabled={loading}
					class="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50 min-w-[40%]"
				>
					{cancelLabel}
				</button>
				<button
					onclick={handleConfirm}
					disabled={loading}
					class="btn px-4 py-2 text-sm disabled:opacity-50 {btnClass[variant]} min-w-[40%]"
				>
					{#if loading}
						<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
						></span>
					{/if}
					{confirmLabel}
				</button>
			</div>
		{/if}
	{/snippet}
</Modal>

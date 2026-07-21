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
		variant = 'warning',
		loading = false,
		isAbsoluteIcon = false,
		parentKlass,
		msgKlass,
		onconfirm,
		oncancel,
		confirmFooterSlot,
		iconSlot
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
		isAbsoluteIcon?: boolean;

		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
		confirmFooterSlot?: Snippet;
		iconSlot?: Snippet;
	} = $props();

	const btnClass: Record<Variant, string> = {
		danger: 'bg-error text-white hover:bg-error/90',
		warning: 'bg-warning text-content-primary hover:bg-warning/90',
		info: 'bg-accent text-white hover:bg-accent/90'
	};

	const handleConfirm = async () => {
		await onconfirm?.();
		open = false;
	};

	const handleCancel = () => {
		oncancel?.();
		open = false;
	};
</script>

<Modal
	bind:open
	size="sm"
	closeOnBackdrop={!loading}
	closeOnEsc={!loading}
	footerKlass="border-t-0"
>
	<div class="flex flex-col gap-2 {parentKlass}">
		{#if iconSlot}
			{@render iconSlot()}
		{:else if isAbsoluteIcon}
			<div
				class="absolute -top-12 left-1/2 size-24 -translate-x-1/2 rounded-full border-4 shadow-md z-20 {variant ===
				'danger'
					? 'border-error bg-error'
					: variant === 'warning'
						? 'border-warning bg-warning'
						: 'border-info bg-info'}"
			>
				{@render ConfirmIcon()}
			</div>
		{:else}
			{@render ConfirmIcon()}
		{/if}
		<p
			class="text-sm text-content-secondary text-center leading-relaxed {isAbsoluteIcon &&
				'pt-15'} {msgKlass}"
		>
			{message}
		</p>
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

{#snippet ConfirmIcon()}
	<div class="flex justify-center">
		<span
			class="size-22 rounded-full flex items-center justify-center
					{variant === 'danger'
				? 'bg-error text-on-error'
				: variant === 'warning'
					? 'bg-warning text-on-warning'
					: 'bg-info text-on-info'}"
		>
			<Icon {icon} klass="size-14" />
		</span>
	</div>
{/snippet}

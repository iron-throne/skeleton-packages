<script lang="ts">
    import Modal from './Modal.svelte';
    import { ExclamationTriangleFill } from 'svelte-bootstrap-icons';

    type Variant = 'danger' | 'warning' | 'info';

    let {
        open = $bindable(false),
        title = 'Are you sure?',
        message = '',
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        variant = 'danger',
        loading = false,
        onconfirm,
        oncancel,
    }: {
        open: boolean;
        title?: string;
        message?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: Variant;
        loading?: boolean;
        onconfirm?: () => void | Promise<void>;
        oncancel?: () => void;
    } = $props();

    const btnClass: Record<Variant, string> = {
        danger:  'bg-error text-white hover:bg-error/90',
        warning: 'bg-warning text-content-primary hover:bg-warning/90',
        info:    'bg-accent text-white hover:bg-accent/90',
    };

    async function handleConfirm() {
        await onconfirm?.();
        open = false;
    }

    function handleCancel() {
        oncancel?.();
        open = false;
    }
</script>

<Modal bind:open {title} size="sm" closeOnBackdrop={!loading} closeOnEsc={!loading}>
    <div class="flex flex-col gap-4">
        {#if variant === 'danger' || variant === 'warning'}
            <div class="flex justify-center">
                <span class="w-12 h-12 rounded-full flex items-center justify-center
                    {variant === 'danger' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}">
                    <ExclamationTriangleFill width={24} height={24} />
                </span>
            </div>
        {/if}
        <p class="text-sm text-content-secondary text-center leading-relaxed">{message}</p>
    </div>

    {#snippet footer({ close })}
        <button
            onclick={handleCancel}
            disabled={loading}
            class="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50"
        >
            {cancelLabel}
        </button>
        <button
            onclick={handleConfirm}
            disabled={loading}
            class="btn px-4 py-2 text-sm disabled:opacity-50 {btnClass[variant]}"
        >
            {#if loading}
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {/if}
            {confirmLabel}
        </button>
    {/snippet}
</Modal>

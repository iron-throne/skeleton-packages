<script lang="ts">
    import type { Snippet } from 'svelte';
    import {
        CheckCircleFill,
        ExclamationTriangleFill,
        XCircleFill,
        InfoCircleFill,
        XLg,
    } from 'svelte-bootstrap-icons';

    type AlertVariant = 'success' | 'warning' | 'error' | 'info';

    let {
        variant = 'info',
        title = '',
        dismissible = false,
        children,
    }: {
        variant?: AlertVariant;
        title?: string;
        dismissible?: boolean;
        children: Snippet;
    } = $props();

    let visible = $state(true);

    const styles: Record<AlertVariant, { wrapper: string; icon: string }> = {
        success: { wrapper: 'bg-success/10 border-success/30 text-success',     icon: 'text-success' },
        warning: { wrapper: 'bg-warning/10 border-warning/30 text-content-primary', icon: 'text-warning' },
        error:   { wrapper: 'bg-error/10   border-error/30   text-error',        icon: 'text-error' },
        info:    { wrapper: 'bg-info/10    border-info/30    text-info',          icon: 'text-info' },
    };

    const icons: Record<AlertVariant, any> = {
        success: CheckCircleFill,
        warning: ExclamationTriangleFill,
        error:   XCircleFill,
        info:    InfoCircleFill,
    };

    const s = $derived(styles[variant]);
    const Icon = $derived(icons[variant]);
</script>

{#if visible}
    <div
        role="alert"
        class="flex gap-3 rounded-lg border px-4 py-3 text-sm {s.wrapper}"
    >
        <!-- Icon -->
        <span class="mt-0.5 shrink-0 {s.icon}">
            <Icon width={16} height={16} />
        </span>

        <!-- Body -->
        <div class="flex-1 min-w-0">
            {#if title}
                <p class="font-semibold mb-0.5">{title}</p>
            {/if}
            <div class="leading-relaxed opacity-90">
                {@render children()}
            </div>
        </div>

        <!-- Dismiss -->
        {#if dismissible}
            <button
                onclick={() => (visible = false)}
                class="shrink-0 opacity-60 hover:opacity-100 transition mt-0.5"
                aria-label="Dismiss"
            >
                <XLg width={14} height={14} />
            </button>
        {/if}
    </div>
{/if}

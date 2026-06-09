<script lang="ts">
    import type { Snippet } from 'svelte';

    type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    type BadgeSize    = 'sm' | 'md';

    let {
        variant = 'default',
        size = 'md',
        dot = false,
        children,
    }: {
        variant?: BadgeVariant;
        size?: BadgeSize;
        /** Show a coloured dot instead of text */
        dot?: boolean;
        children?: Snippet;
    } = $props();

    const variantClass: Record<BadgeVariant, string> = {
        default: 'bg-surface-tertiary  text-content-secondary',
        accent:  'bg-accent/15         text-accent',
        success: 'bg-success/15        text-success',
        warning: 'bg-warning/20        text-content-primary',
        error:   'bg-error/15          text-error',
        info:    'bg-info/15           text-info',
    };

    const dotColor: Record<BadgeVariant, string> = {
        default: 'bg-content-tertiary',
        accent:  'bg-accent',
        success: 'bg-success',
        warning: 'bg-warning',
        error:   'bg-error',
        info:    'bg-info',
    };

    const sizeClass: Record<BadgeSize, string> = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2   py-0.5 text-xs',
    };
</script>

{#if dot}
    <span
        class="inline-block w-2 h-2 rounded-full {dotColor[variant]}"
        aria-hidden="true"
    ></span>
{:else}
    <span
        class="inline-flex items-center gap-1 rounded-full font-medium leading-none
               {variantClass[variant]} {sizeClass[size]}"
    >
        {#if children}
            {@render children()}
        {/if}
    </span>
{/if}

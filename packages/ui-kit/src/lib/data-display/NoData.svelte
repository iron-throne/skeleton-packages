<script lang="ts">
    import type { Snippet } from 'svelte';
    import { InboxFill } from 'svelte-bootstrap-icons';

    let {
        text = 'No data found.',
        icon,
        children,
    }: {
        text?: string;
        /** Custom icon component (svelte-bootstrap-icons or any Svelte component) */
        icon?: any;
        /** Optional extra content rendered below the message */
        children?: Snippet;
    } = $props();

    const IconComponent = $derived(icon ?? InboxFill);
</script>

<div class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
    <span class="text-content-tertiary">
        <IconComponent width={36} height={36} />
    </span>
    <p class="text-sm text-content-tertiary italic">{text}</p>
    {#if children}
        <div class="mt-1">
            {@render children()}
        </div>
    {/if}
</div>

<script lang="ts">
    import type { Snippet } from 'svelte';
    import { InboxFill } from 'svelte-bootstrap-icons';

    let {
        text = 'No data found.',
        icon,
        klass,
        children,
    }: {
        text?: string;
        klass?: string;
        /** Custom icon component (svelte-bootstrap-icons or any Svelte component) */
        icon?: any;
        /** Optional extra content rendered below the message */
        children?: Snippet;
    } = $props();

    const IconComponent = $derived(icon ?? InboxFill);
</script>

<div class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center text-content-tertiary {klass}">
    <span class="">
        <IconComponent width={36} height={36} />
    </span>
    <p class="text-sm italic">{text}</p>
    {#if children}
        <div class="mt-1">
            {@render children()}
        </div>
    {/if}
</div>

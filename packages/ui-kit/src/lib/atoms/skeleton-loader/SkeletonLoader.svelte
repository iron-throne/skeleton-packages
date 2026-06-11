<script lang="ts">
    let {
        lines = 3,
        height = '1rem',
        width = '100%',
        /** Render as a circle (e.g. for avatars) */
        circle = false,
        /** Vary line widths for a more natural look */
        varied = true,
        class: klass = '',
    }: {
        lines?: number;
        height?: string;
        width?: string;
        circle?: boolean;
        varied?: boolean;
        class?: string;
    } = $props();

    // Pre-computed width percentages so they're stable across renders
    const widths = [100, 85, 92, 70, 88, 78, 95, 75];
</script>

<div class="flex flex-col gap-2 {klass}" aria-hidden="true">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array(lines) as _, i (i)}
        {@const w = circle
            ? height
            : varied && lines > 1 && i === lines - 1
                ? `${widths[i % widths.length] || 80 * 0.6}%`
                : varied
                    ? `${widths[i % widths.length]}%`
                    : width}
        <div
            style="width:{w}; height:{height};"
            class="rounded-md bg-surface-secondary animate-pulse
                   {circle ? 'rounded-full' : 'rounded-md'}"
        ></div>
    {/each}
</div>

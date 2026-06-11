<script lang="ts">
    import { page } from '$app/state';
    import { ChevronRight, HouseFill } from 'svelte-bootstrap-icons';
	import { resolve } from '$app/paths';

    /**
     * Optional map of path segment → display label.
     * e.g. { admin: 'Administration', 'reset-password': 'Reset Password' }
     */
    let {
        labels = {},
        homeLabel = 'Home',
        homeHref = "/",
    }: {
        labels?: Record<string, string>;
        homeLabel?: string;
        homeHref?: string;
    } = $props();

    interface Crumb { label: string; href: string; current: boolean }

    const crumbs = $derived.by((): Crumb[] => {
        const segments = page.url.pathname
            .split('/')
            .filter(Boolean)
            // Strip SvelteKit route group brackets e.g. (auth), (protected)
            .filter((s) => !/^\(.*\)$/.test(s));

        return segments.map((seg, i) => {
            const href = '/' + segments.slice(0, i + 1).join('/');
            const label =
                labels[seg] ??
                seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return { label, href, current: i === segments.length - 1 };
        });
    });
</script>

{#if crumbs.length > 0}
    <nav aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-1 text-sm">

            <!-- Home -->
            <li>
                <a
                    href={resolve(homeHref, {})}
                    class="flex items-center gap-1 text-content-tertiary hover:text-content-primary transition-colors"
                    aria-label={homeLabel}
                >
                    <HouseFill width={13} height={13} />
                </a>
            </li>

            {#each crumbs as crumb, cInd (cInd)}
                <li class="flex items-center gap-1">
                    <ChevronRight width={10} height={10} class="text-content-tertiary shrink-0" />
                    {#if crumb.current}
                        <span
                            aria-current="page"
                            class="font-medium text-content-primary truncate max-w-40"
                        >
                            {crumb.label}
                        </span>
                    {:else}
                        <a
                            href={resolve(crumb.href, {})}
                            class="text-content-tertiary hover:text-content-primary transition-colors truncate max-w-40"
                        >
                            {crumb.label}
                        </a>
                    {/if}
                </li>
            {/each}

        </ol>
    </nav>
{/if}

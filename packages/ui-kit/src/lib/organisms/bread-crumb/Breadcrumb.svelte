<script lang="ts">
	import { ChevronRight, HouseFill } from 'svelte-bootstrap-icons';

	/**
	 * Optional map of path segment → display label.
	 * e.g. { admin: 'Administration', 'reset-password': 'Reset Password' }
	 */
	let {
		pathname,
		labels = {},
		homeLabel = 'Home',
		homeHref = '/',
		classes = {}
	}: {
		/** Current route path, e.g. `page.url.pathname` from `$app/state` in the host app. */
		pathname: string;
		labels?: Record<string, string>;
		homeLabel?: string;
		homeHref?: string;
		classes?: {
			nav?: string;
			list?: string;
			item?: string;
			homeLink?: string;
			homeIcon?: string;
			separator?: string;
			link?: string;
			current?: string;
		};
	} = $props();

	const cx = (...parts: (string | undefined | false | null)[]) => parts.filter(Boolean).join(' ');

	interface Crumb {
		label: string;
		href: string;
		current: boolean;
	}

	const crumbs = $derived.by((): Crumb[] => {
		const segments = pathname
			.split('/')
			.filter(Boolean)
			// Strip SvelteKit route group brackets e.g. (auth), (protected)
			.filter((s) => !/^\(.*\)$/.test(s));

		return segments.map((seg, i) => {
			const href = '/' + segments.slice(0, i + 1).join('/');
			const label = labels[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
			return { label, href, current: i === segments.length - 1 };
		});
	});
</script>

{#if crumbs.length > 0}
	<nav aria-label="Breadcrumb" class={classes.nav || undefined}>
		<ol class={cx('flex flex-wrap items-center gap-1 text-sm', classes.list)}>
			<!-- Home -->
			<li class={classes.item || undefined}>
				<a
					href={homeHref}
					class={cx(
						'flex items-center gap-1 text-content-tertiary hover:text-content-primary transition-colors',
						classes.homeLink
					)}
					aria-label={homeLabel}
				>
					<HouseFill width={13} height={13} class={classes.homeIcon} />
				</a>
			</li>

			{#each crumbs as crumb, cInd (cInd)}
				<li class={cx('flex items-center gap-1', classes.item)}>
					<ChevronRight
						width={10}
						height={10}
						class={cx('text-content-tertiary shrink-0', classes.separator)}
					/>
					{#if crumb.current}
						<span
							aria-current="page"
							class={cx('font-medium text-content-primary truncate max-w-40', classes.current)}
						>
							{crumb.label}
						</span>
					{:else}
						<a
							href={crumb.href}
							class={cx(
								'text-content-tertiary hover:text-content-primary transition-colors truncate max-w-40',
								classes.link
							)}
						>
							{crumb.label}
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}

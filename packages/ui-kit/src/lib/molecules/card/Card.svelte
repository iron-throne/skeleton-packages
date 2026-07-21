<script lang="ts">
	import type { Snippet } from 'svelte';
	import SkeletonLoader from '$lib/atoms/skeleton-loader/SkeletonLoader.svelte';
	import type { CardVariant, CardPadding } from './types';

	let {
		variant = 'outlined',
		padding = 'md',
		title = '',
		subtitle = '',
		hoverable = false,
		selected = false,
		disabled = false,
		loading = false,
		href,
		target,
		onClick,
		class: klass = '',
		media,
		header,
		actions,
		footer,
		children
	}: {
		variant?: CardVariant;
		padding?: CardPadding;
		title?: string;
		subtitle?: string;
		/** Lift the card on hover even without onClick/href */
		hoverable?: boolean;
		/** Accent border/ring, e.g. for a chosen plan or checked list card */
		selected?: boolean;
		disabled?: boolean;
		/** Replaces header + body with skeleton placeholders */
		loading?: boolean;
		href?: string;
		target?: string;
		onClick?: (e: MouseEvent) => void | Promise<void>;
		class?: string;
		/** Edge-to-edge region above the header, e.g. a banner image */
		media?: Snippet;
		/** Replaces the default title/subtitle markup entirely */
		header?: Snippet;
		/** Right-aligned controls next to the title (icon buttons, menus, badges) */
		actions?: Snippet;
		/** Bottom region, separated by a border, e.g. actions/buttons */
		footer?: Snippet;
		children?: Snippet;
	} = $props();

	const variantClass: Record<CardVariant, string> = {
		outlined: 'bg-surface-primary border border-border-primary shadow-sm',
		elevated: 'bg-surface-primary border border-transparent shadow-lg',
		flat: 'bg-surface-secondary border border-transparent',
		ghost: 'bg-transparent border border-transparent'
	};

	const paddingClass: Record<CardPadding, string> = {
		none: 'p-0',
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-7'
	};

	const paddingXClass: Record<CardPadding, string> = {
		none: 'px-0',
		sm: 'px-3',
		md: 'px-5',
		lg: 'px-7'
	};

	const interactive = $derived(!disabled && !!(onClick || href));
	const hasHeader = $derived(!!(header || title || subtitle || actions));

	function handleClick(e: MouseEvent) {
		if (disabled || loading) {
			e.preventDefault();
			return;
		}
		onClick?.(e);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!interactive || href) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.(e as unknown as MouseEvent);
		}
	}
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	target={href ? target : undefined}
	rel={href && target === '_blank' ? 'noopener noreferrer' : undefined}
	role={!href && interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
	aria-disabled={disabled || undefined}
	onclick={interactive ? handleClick : undefined}
	onkeydown={interactive ? handleKeydown : undefined}
	class="block rounded-2xl overflow-hidden transition-all duration-200 text-primary no-underline hover:no-underline hover:opacity-100
		{variantClass[variant]}
		{interactive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50' : ''}
		{(hoverable || interactive) && !disabled ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
		{selected ? 'border-accent! ring-2 ring-accent/30' : ''}
		{disabled ? 'opacity-50 grayscale-[0.4] pointer-events-none' : ''}
		{klass}"
>
	{#if media}
		<div class="w-full">
			{@render media()}
		</div>
	{/if}

	{#if loading}
		<div class="{paddingClass[padding]} flex flex-col gap-4">
			<SkeletonLoader lines={1} height="0.875rem" width="45%" varied={false} />
			<SkeletonLoader lines={3} />
		</div>
	{:else}
		{#if hasHeader}
			<div class="{paddingClass[padding]} {children ? 'pb-0' : ''}">
				{#if header}
					{@render header()}
				{:else}
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							{#if title}
								<p class="text-sm font-semibold text-primary truncate">{title}</p>
							{/if}
							{#if subtitle}
								<p class="text-xs text-tertiary mt-0.5">{subtitle}</p>
							{/if}
						</div>
						{#if actions}
							<div class="shrink-0 flex items-center gap-2">
								{@render actions()}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		{#if children}
			<div class="{paddingClass[padding]} {hasHeader ? 'pt-4' : ''}">
				{@render children()}
			</div>
		{/if}
	{/if}

	{#if footer && !loading}
		<div
			class="{paddingXClass[padding]} py-4 border-t border-border-primary flex items-center gap-3"
		>
			{@render footer()}
		</div>
	{/if}
</svelte:element>

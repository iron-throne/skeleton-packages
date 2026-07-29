<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		CARD_ICON_CLASS,
		CARD_PADDING_CLASS,
		CARD_TONE_CLASS,
		CARD_TREND_CLASS,
		CARD_TREND_SYMBOL,
		CARD_VARIANT_CLASS
	} from './constants';
	import type { CardPadding, CardTone, CardTrend, CardVariant } from './types';

	let {
		variant = 'default',
		padding = 'md',
		tone = 'neutral',
		title = '',
		subtitle = '',
		eyebrow = '',
		value = '',
		trend = 'flat',
		trendLabel = '',
		badge = '',
		href = '',
		selected = false,
		interactive = false,
		icon,
		chartValues = [],
		ariaLabel = '',
		class: klass = '',
		children,
		media,
		actions,
		footer
	}: {
		variant?: CardVariant;
		padding?: CardPadding;
		tone?: CardTone;
		title?: string;
		subtitle?: string;
		eyebrow?: string;
		value?: string | number;
		trend?: CardTrend;
		trendLabel?: string;
		badge?: string;
		href?: string;
		selected?: boolean;
		interactive?: boolean;
		icon?: any;
		chartValues?: number[];
		ariaLabel?: string;
		class?: string;
		children?: Snippet;
		media?: Snippet;
		actions?: Snippet;
		footer?: Snippet;
	} = $props();

	const rootClass = $derived(
		[
			CARD_VARIANT_CLASS[variant],
			CARD_PADDING_CLASS[padding],
			href ? 'block no-underline text-primary hover:text-primary hover:font-normal' : '',
			interactive || href ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md' : '',
			selected ? 'ring-2 ring-accent/40 border-accent/50' : '',
			klass
		]
			.filter(Boolean)
			.join(' ')
	);

	const hasHeader = $derived(!!eyebrow || !!title || !!subtitle || !!icon || !!badge || !!actions);
     

	const chart = $derived.by(() => {
		if (chartValues.length < 2) return null;

		const min = Math.min(...chartValues);
		const max = Math.max(...chartValues);
		const range = max - min || 1;
		const points = chartValues.map((item, index) => {
			const x = (index / (chartValues.length - 1)) * 100;
			const y = 30 - ((item - min) / range) * 28 + 1;
			return `${x},${y}`;
		});

		return {
			line: points.join(' '),
			area: `0,32 ${points.join(' ')} 100,32`
		};
	});
</script>

{#if href}
	<a class={rootClass} {href} aria-label={ariaLabel || title}>
		{@render CardContent()}
	</a>
{:else}
	<div class={rootClass} aria-label={ariaLabel || undefined}>
		{@render CardContent()}
	</div>

{/if}

{#snippet CardContent()}
	{#if variant === 'metric'}
		<div
			class="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
		></div>
	{/if}

	<div class="relative">
		{#if media}
			<div class="-mx-4 -mt-4 mb-4 overflow-hidden">
				{@render media()}
			</div>
		{/if}

		{#if hasHeader}
			<div class="flex items-start gap-3">
				<div class="min-w-0 flex-1">
					{#if eyebrow}
						<div class="text-[11px] font-semibold uppercase tracking-[0.07em] text-tertiary">
							{eyebrow}
						</div>
					{/if}

					{#if title}
						<h3 class="mt-1 truncate text-sm font-semibold text-primary">{title}</h3>
					{/if}

					{#if subtitle}
						<p class="mt-1 text-xs leading-5 text-secondary">{subtitle}</p>
					{/if}
				</div>

				{#if badge}
					<span
						class="inline-flex shrink-0 items-center rounded-full border border-border-primary bg-surface-tertiary px-2 py-0.5 text-[10px] font-medium text-secondary"
					>
						{badge}
					</span>
				{/if}

				{#if icon}
					{@const Icon = icon}
					<span class="grid size-9 shrink-0 place-items-center rounded-lg {CARD_ICON_CLASS[tone]}">
						<Icon width={16} height={16} />
					</span>
				{/if}

				{#if actions}
					<div class="shrink-0">
						{@render actions()}
					</div>
				{/if}
			</div>
		{/if}

		{#if value !== ''}
			<div class="mt-2 text-2xl font-semibold tracking-tight text-primary">{value}</div>
		{/if}

		{#if trendLabel}
			<div class="mt-1 flex items-center gap-1 text-[11px] {CARD_TREND_CLASS[trend]}">
				<!-- <span aria-hidden="true">{CARD_TREND_SYMBOL[trend]}</span> -->
				<span>{trendLabel}</span>
			</div>
		{/if}

		{#if chart}
			<svg viewBox="0 0 100 32" class="mt-3 h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
				<polygon points={chart.area} fill="currentColor" class={CARD_TONE_CLASS[tone]} opacity="0.12" />
				<polyline
					points={chart.line}
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					class={CARD_TONE_CLASS[tone]}
				/>
			</svg>
		{/if}

		{#if children}
			<div class={hasHeader || value !== '' || trendLabel || chart ? 'mt-4' : ''}>
				{@render children()}
			</div>
		{/if}

		{#if footer}
			<div class="mt-4 border-t border-border-primary pt-3">
				{@render footer()}
			</div>
		{/if}
	</div>
{/snippet}

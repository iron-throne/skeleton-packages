<script lang="ts">
	import { Icon } from '$lib/atoms';
	import { ESize } from '@aryagg/types';
	import type { ITab } from '@aryagg/types';
	import type { Snippet } from 'svelte';
	import type { TabsSize, TabsVariant, TabsRadius } from './types';

	let {
		tabs,
		active = $bindable(),
		children,
		disabled = false,
		size = ESize.MD,
		variant = 'surface',
		radius = 'full',
		parentKlass,
		tabKlass
	}: {
		tabs: ITab[];
		active: string;
		disabled?: boolean;
		size?: TabsSize;
		variant?: TabsVariant;
		radius?: TabsRadius;
		parentKlass?: string;
		tabKlass?: string;
		children?: Snippet;
	} = $props();

	// Initialise to first enabled tab if not set
	$effect.pre(() => {
		if (!active) active = tabs.find((t) => !t.disabled)?.id ?? '';
	});

	const sizeClass: Record<TabsSize, string> = {
		[ESize.XS]: 'px-2.5 py-1 text-[10px] gap-1',
		[ESize.SM]: 'px-3 py-1 text-[11px] gap-1',
		[ESize.MD]: 'px-4 py-1.5 text-xs gap-1.5',
		[ESize.LG]: 'px-5 py-2 text-sm gap-1.5',
		[ESize.XL]: 'px-6 py-2.5 text-base gap-2'
	};

	const iconSizeClass: Record<TabsSize, string> = {
		[ESize.XS]: 'size-3',
		[ESize.SM]: 'size-3.5',
		[ESize.MD]: 'size-4',
		[ESize.LG]: 'size-4.5',
		[ESize.XL]: 'size-5'
	};

	const radiusClass: Record<TabsRadius, string> = {
		none: 'rounded-none',
		small: 'rounded-md',
		medium: 'rounded-lg',
		large: 'rounded-xl',
		full: 'rounded-full'
	};

	const containerVariantClass: Record<TabsVariant, string> = {
		surface: 'bg-surface-primary shadow',
		classic: 'bg-transparent border border-border-primary'
	};

	const activeVariantClass: Record<TabsVariant, string> = {
		surface: 'bg-primary text-surface-primary shadow-sm',
		classic: 'bg-accent text-surface-primary shadow-sm'
	};

	const inactiveClass = 'text-secondary hover:text-primary border-0 bg-transparent';
</script>

<div>
	<!-- ITab bar -->
	<div
		role="tablist"
		aria-disabled={disabled || undefined}
		class="flex w-fit p-1 {radiusClass[radius]} {containerVariantClass[
			variant
		]} {parentKlass} {disabled ? 'opacity-50 grayscale-[0.3] pointer-events-none' : ''}"
	>
		{#each tabs as tab (tab.id)}
			<button
				role="tab"
				aria-selected={active === tab.id}
				aria-disabled={disabled || tab.disabled}
				onclick={() => {
					if (!disabled && !tab.disabled) active = tab.id;
				}}
				class="inline-flex items-center font-medium transition-colors duration-300 ease-in-out {radiusClass[
					radius
				]} {sizeClass[size]} {tabKlass} {tab.id === active
					? activeVariantClass[variant]
					: inactiveClass}"
			>
				<Icon icon={tab.icon} klass="{iconSizeClass[size]} shrink-0" />
				{tab.label}
				{#if tab.badge != null}
					<span
						class="rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold
                        {tab.id === active ? activeVariantClass[variant] : inactiveClass}"
					>
						{tab.badge}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- ITab panel -->
	{#if children}
		<div role="tabpanel" class="mt-4">
			{@render children()}
		</div>
	{/if}
</div>

<script lang="ts">
	import Icon from '$lib/atoms/icon/Icon.svelte';
	import { ESize } from '@aryagg/types';
	import type { TabItem, TabsProps } from './types';

	let {
		tabs,
		active = $bindable(''),
		children,
		disabled = false,
		size = ESize.MD,
		variant = 'underline',
		radius = 'small',
		borderRadius = '',
		containerBorderRadius = '',
		showIcons = true,
		iconPosition = 'left',
		class: className = '',
		tabClass = '',
		panelClass = '',
		onChange
	}: TabsProps = $props();

	const tabSizeClass: Partial<Record<ESize, string>> = {
		[ESize.XS]: 'h-7 px-[9px] text-[10px]',
		[ESize.SM]: 'h-8 px-3 text-[11px]',
		[ESize.MD]: 'h-[38px] px-4 text-[13px]',
		[ESize.LG]: 'h-[42px] px-[18px] text-sm',
		[ESize.XL]: 'h-[46px] px-5 text-[15px]'
	};
	const sizeClass = $derived(tabSizeClass[size] ?? tabSizeClass[ESize.MD]);
	const radiusClass = $derived(
		{
			none: 'rounded-none',
			small: 'rounded-[5px]',
			medium: 'rounded-lg',
			large: 'rounded-xl',
			full: 'rounded-full'
		}[radius]
	);
	const segmented = $derived(variant === 'segmented' || variant === 'surface');
	const listClass = $derived(
		segmented
			? 'w-fit gap-px rounded-md border border-border-primary bg-surface-secondary p-[3px]'
			: 'w-full border-b border-border-primary'
	);

	$effect.pre(() => {
		if (!active) active = tabs.find((tab) => !tab.disabled)?.id ?? '';
	});

	function selectTab(tab: TabItem) {
		if (disabled || tab.disabled || tab.id === active) return;
		active = tab.id;
		onChange?.(tab);
	}
</script>

<div
	class="text-primary {className}"
	style:border-radius={containerBorderRadius || undefined}
>
	<div
		role="tablist"
		aria-disabled={disabled || undefined}
		class="flex max-w-full items-center overflow-x-auto {listClass}"
		style:border-radius={segmented && containerBorderRadius ? containerBorderRadius : undefined}
	>
		{#each tabs as tab (tab.id)}
			{@const selected = tab.id === active}
			<button
				type="button"
				role="tab"
				aria-selected={selected}
				aria-disabled={disabled || tab.disabled}
				disabled={disabled || tab.disabled}
				class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap border-0 bg-transparent font-medium text-tertiary transition-all duration-150 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45
					{segmented
					? `h-[30px] px-3.5 text-xs ${selected ? 'bg-surface-primary font-bold text-accent shadow-sm' : ''}`
					: `-mb-px border-b-2 border-transparent ${sizeClass} ${selected ? 'border-b-accent font-bold text-accent' : ''}`}
					{radiusClass} {tabClass}"
				style:border-radius={borderRadius || undefined}
				onclick={() => selectTab(tab)} 
			>
				{#if showIcons && iconPosition === 'left' && (tab.icon || tab.selectedIcon)}
					<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="h-3.5 w-3.5" />
				{/if}
				<span>{tab.label}</span>
				{#if tab.badge !== undefined}
					<small
						class="min-w-[18px] rounded-full px-[5px] py-px text-[10px] font-bold {selected
							? 'bg-accent/15 text-accent'
							: 'bg-surface-tertiary text-tertiary'}"
					>
						{tab.badge}
					</small>
				{/if}
				{#if showIcons && iconPosition === 'right' && (tab.icon || tab.selectedIcon)}
					<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="h-3.5 w-3.5" />
				{/if}
			</button>
		{/each}
	</div>
	{#if children}
		<div role="tabpanel" class="pt-4 {panelClass}">{@render children()}</div>
	{/if}
</div>

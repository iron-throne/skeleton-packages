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
		tabStyle: customTabStyle = '',
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
	const contained = $derived(variant === 'segmented' || variant === 'surface');
	const listClass = $derived.by(() => {
		if (variant === 'segmented') {
			return 'w-fit gap-1 rounded-md border border-border-primary bg-surface-secondary p-[3px]';
		}
		if (variant === 'surface') {
			return 'w-fit gap-1 rounded-md bg-surface-secondary p-1';
		}
		if (variant === 'classic') {
			return 'w-full items-end gap-1 border-b border-border-primary';
		}
		return 'w-full border-b border-border-primary';
	});

	function tabVariantClass(selected: boolean) {
		if (variant === 'segmented') {
			return `h-[30px] border border-transparent px-3.5 text-xs ${
				selected
					? 'border-accent! font-bold shadow-sm'
					: ''
			}`;
		}
		if (variant === 'surface') {
			return `h-[30px] px-3.5 text-xs ${
				selected
					? 'font-bold shadow-sm'
					: ''
			}`;
		}
		if (variant === 'classic') {
			return `${sizeClass} border border-border-primary ${
				selected
					? '-mb-px border-b-surface-primary! bg-surface-primary! font-bold text-accent!'
					: 'bg-surface-secondary! text-secondary!'
			}`;
		}
		return `-mb-px border-x-0 border-t-0 border-b-2 border-transparent bg-transparent! ${sizeClass} ${
			selected ? 'border-b-accent! font-bold text-accent!' : 'text-tertiary!'
		}`;
	}

	function getTabStyle(tab: TabItem, selected: boolean) {
		const values = [borderRadius && `border-radius:${borderRadius}`];
		const parentStyle =
			typeof customTabStyle === 'function' ? customTabStyle(tab, selected) : customTabStyle;
		values.push(parentStyle);

		return values.filter(Boolean).join(';');
	}

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
		style:border-radius={contained && containerBorderRadius ? containerBorderRadius : undefined}
	>
		{#each tabs as tab (tab.id)}
			{@const selected = tab.id === active}
			<button
				type="button"
				role="tab"
				aria-selected={selected}
				aria-disabled={disabled || tab.disabled}
				disabled={disabled || tab.disabled}
				data-variant={variant}
				class="tabs__tab inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45
					{tabVariantClass(selected)} {radiusClass} {tabClass}"
				style={getTabStyle(tab, selected)}
				onclick={() => selectTab(tab)}
			>
				{#if showIcons && iconPosition === 'left' && (tab.icon || tab.selectedIcon)}
					<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="h-3.5 w-3.5" />
				{/if}
				<span>{tab.label}</span>
				{#if tab.badge !== undefined}
					<small
						class="min-w-[18px] rounded-full px-[5px] py-px text-[10px] font-bold {selected &&
						variant === 'segmented'
							? 'bg-on-accent/20 text-on-accent'
							: selected
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

<style>
	.tabs__tab {
		--button-bg: transparent;
		--button-shadow: none;
	}

	.tabs__tab[data-variant='segmented'] {
		--button-color: var(--text-secondary);
		--button-hover-bg: var(--surface-primary);
		--button-hover-color: var(--text-primary);
	}

	.tabs__tab[data-variant='segmented'][aria-selected='true'] {
		--button-bg: var(--semantic-accent);
		--button-color: var(--on-accent);
		--button-hover-bg: var(--semantic-accent);
		--button-hover-color: var(--on-accent);
		--button-shadow: var(--shadow-sm);
	}

	.tabs__tab[data-variant='surface'] {
		--button-color: var(--text-secondary);
	}

	.tabs__tab[data-variant='surface'][aria-selected='true'] {
		--button-bg: var(--surface-primary);
		--button-color: var(--semantic-accent);
		--button-shadow: var(--shadow-sm);
	}
</style>

<script lang="ts">
	import Icon from '../../atoms/icon/Icon.svelte';
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
		showIcons = true,
		iconPosition = 'left',
		klass = '',
		tabKlass = '',
		panelKlass = '',
		parentKlass = '',
		onChange,
		activeKlass = ''
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
				selected ? `border-accent! font-bold shadow-sm ${activeKlass}` : ''
			}`;
		}
		if (variant === 'surface') {
			return `h-[30px] px-3.5 text-xs ${selected ? `font-bold shadow-sm ${activeKlass}` : ''}`;
		}
		if (variant === 'classic') {
			return `${sizeClass} border border-border-primary ${
				selected
					? `-mb-px border-b-surface-primary! bg-surface-primary! font-bold text-accent! ${activeKlass}`
					: 'bg-surface-secondary! text-secondary!'
			}`;
		}
		return `-mb-px border-x-0 border-t-0 border-b-2 border-transparent bg-transparent! ${sizeClass} ${
			selected ? 'border-b-accent! font-bold text-accent!' : 'text-tertiary!'
		}`;
	}

	$effect.pre(() => {
		const activeExists = tabs.some((tab) => tab.id === active);
		if (!active || !activeExists) {
			active = tabs.find((tab) => !tab.disabled)?.id ?? '';
		}
	});

	function selectTab(tab: TabItem) {
		if (disabled || tab.disabled || tab.id === active) return;
		active = tab.id;
		onChange?.(tab);
	}
</script>

{#snippet tabIcon(tab: TabItem, selected: boolean)}
	<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="size-3.5" />
{/snippet}

<div class="text-primary {klass}">
	<div
		role="tablist"
		aria-disabled={disabled || undefined}
		class="flex max-w-full items-center overflow-x-auto {listClass} {parentKlass}"
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
					{tabVariantClass(selected)} {radiusClass} {tabKlass}"
				onclick={() => selectTab(tab)}
			>
				{#if showIcons && iconPosition === 'left' && (tab.icon || tab.selectedIcon)}
					{@render tabIcon(tab, selected)}
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
					{@render tabIcon(tab, selected)}
				{/if}
			</button>
		{/each}
	</div>
	{#if children}
		<div role="tabpanel" class="pt-4 {panelKlass}">{@render children()}</div>
	{/if}
</div>

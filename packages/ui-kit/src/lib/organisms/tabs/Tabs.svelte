<script lang="ts">
	import Icon from '$lib/atoms/icon/Icon.svelte';
	import type { TabItem, TabsProps } from './types';

	let {
		tabs,
		active = $bindable(''),
		children,
		disabled = false,
		size = 'md',
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
	class="ui-tabs ui-tabs--{variant} ui-tabs--{size} ui-tabs-radius--{radius} {className}"
	style:--tabs-radius={borderRadius || undefined}
	style:--tabs-container-radius={containerBorderRadius || undefined}
>
	<div role="tablist" aria-disabled={disabled || undefined} class="ui-tabs__list">
		{#each tabs as tab (tab.id)}
			{@const selected = tab.id === active}
			<button
				type="button"
				role="tab"
				aria-selected={selected}
				aria-disabled={disabled || tab.disabled}
				disabled={disabled || tab.disabled}
				class:ui-tabs__tab--active={selected}
				class="ui-tabs__tab {tabClass}"
				onclick={() => selectTab(tab)}
			>
				{#if showIcons && iconPosition === 'left' && (tab.icon || tab.selectedIcon)}
					<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="ui-tabs__icon" />
				{/if}
				<span>{tab.label}</span>
				{#if tab.badge !== undefined}<small class="ui-tabs__badge">{tab.badge}</small>{/if}
				{#if showIcons && iconPosition === 'right' && (tab.icon || tab.selectedIcon)}
					<Icon icon={selected ? (tab.selectedIcon ?? tab.icon) : tab.icon} klass="ui-tabs__icon" />
				{/if}
			</button>
		{/each}
	</div>
	{#if children}
		<div role="tabpanel" class="ui-tabs__panel {panelClass}">{@render children()}</div>
	{/if}
</div>

<style>
	.ui-tabs {
		width: 100%;
		color: var(--text-primary);
		font-family: var(--font-body);
	}
	.ui-tabs__list {
		display: flex;
		align-items: center;
		width: fit-content;
		max-width: 100%;
		overflow-x: auto;
	}
	.ui-tabs__tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border: 0;
		background: transparent;
		color: var(--text-tertiary);
		font-family: inherit;
		font-weight: 500;
		white-space: nowrap;
		transition: all 0.12s;
		border-radius: var(--tabs-radius);
	}
	.ui-tabs__tab:hover:not(:disabled) {
		color: var(--text-primary);
	}
	.ui-tabs__tab:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
	.ui-tabs--xs .ui-tabs__tab {
		height: 28px;
		padding: 0 9px;
		font-size: 10px;
	}
	.ui-tabs--sm .ui-tabs__tab {
		height: 32px;
		padding: 0 12px;
		font-size: 11px;
	}
	.ui-tabs--md .ui-tabs__tab {
		height: 38px;
		padding: 0 16px;
		font-size: 13px;
	}
	.ui-tabs--lg .ui-tabs__tab {
		height: 42px;
		padding: 0 18px;
		font-size: 14px;
	}
	.ui-tabs--xl .ui-tabs__tab {
		height: 46px;
		padding: 0 20px;
		font-size: 15px;
	}
	.ui-tabs--underline .ui-tabs__list,
	.ui-tabs--classic .ui-tabs__list {
		width: 100%;
		border-bottom: 1px solid var(--border-primary);
	}
	.ui-tabs--underline .ui-tabs__tab,
	.ui-tabs--classic .ui-tabs__tab {
		margin-bottom: -1px;
		border-bottom: 2px solid transparent;
	}
	.ui-tabs--underline .ui-tabs__tab--active,
	.ui-tabs--classic .ui-tabs__tab--active {
		border-bottom-color: var(--semantic-accent, #0891b2);
		color: var(--semantic-accent, #0891b2);
		font-weight: 700;
	}
	.ui-tabs--segmented .ui-tabs__list,
	.ui-tabs--surface .ui-tabs__list {
		gap: 1px;
		padding: 3px;
		border: 1px solid var(--border-primary);
		border-radius: var(--tabs-container-radius, 6px);
		background: var(--surface-secondary);
	}
	.ui-tabs--segmented .ui-tabs__tab,
	.ui-tabs--surface .ui-tabs__tab {
		height: 30px;
		padding: 0 14px;
		border-radius: var(--tabs-radius, 5px);
		font-size: 12px;
	}
	.ui-tabs--segmented .ui-tabs__tab--active,
	.ui-tabs--surface .ui-tabs__tab--active {
		background: var(--surface-primary);
		color: var(--semantic-accent, #0891b2);
		font-weight: 700;
		box-shadow: var(--shadow-sm);
	}
	.ui-tabs-radius--none {
		--tabs-radius: 0;
	}
	.ui-tabs-radius--small {
		--tabs-radius: 5px;
	}
	.ui-tabs-radius--medium {
		--tabs-radius: 8px;
	}
	.ui-tabs-radius--large {
		--tabs-radius: 12px;
	}
	.ui-tabs-radius--full {
		--tabs-radius: 999px;
	}
	:global(.ui-tabs__icon) {
		width: 14px;
		height: 14px;
	}
	.ui-tabs__badge {
		min-width: 18px;
		padding: 1px 5px;
		border-radius: 99px;
		background: var(--surface-tertiary);
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 700;
	}
	.ui-tabs__tab--active .ui-tabs__badge {
		background: color-mix(in srgb, var(--semantic-accent, #0891b2) 14%, transparent);
		color: var(--semantic-accent, #0891b2);
	}
	.ui-tabs__panel {
		padding-top: 16px;
	}
</style>

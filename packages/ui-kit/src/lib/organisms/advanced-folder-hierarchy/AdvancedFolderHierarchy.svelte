<script lang="ts">
	import {
		ChevronDown,
		ChevronRight,
		Grid,
		Hexagon,
		Plus,
		Search,
		X
	} from 'svelte-bootstrap-icons';
	import Icon from '$lib/atoms/icon/Icon.svelte';
	import type {
		AdvancedFolderHierarchyGroupField,
		AdvancedFolderHierarchyNode,
		AdvancedFolderHierarchyProps,
		AdvancedFolderHierarchyRecord
	} from './types';

	let {
		title = 'My Spaces',
		items = [],
		records = [],
		filters = [],
		activeFilter = $bindable(''),
		initialVisibleFilterIds = [],
		maxVisibleFilters = 3,
		groupFields = [],
		selectedId = $bindable(''),
		expandedIds = $bindable([]),
		searchPlaceholder = 'Filter navigation...',
		primaryActionLabel = 'New space',
		secondaryActionLabel = 'New',
		footerLabel = 'All projects',
		footerCount,
		class: className = '',
		titleIcon = Hexagon,
		HeaderActions,
		onFilterChange,
		onSelect,
		onPrimaryAction,
		onCreateSpace,
		onSecondaryAction,
		onExpandedChange,
		onFooterClick
	}: AdvancedFolderHierarchyProps = $props();

	let query = $state('');
	let visibleFilterIds = $state<string[]>([]);
	let filtersInitialized = $state(false);
	let builderOpen = $state(false);
	let spaceName = $state('New space');
	let orderedFields = $state<AdvancedFolderHierarchyGroupField[]>([]);
	let fieldsInitialized = $state(false);
	let levels = $state(1);
	let draggedFieldId = $state('');
	let closedIds = $state<string[]>([]);

	$effect(() => {
		if (filtersInitialized || !filters.length) return;
		const hasDisplayConfiguration = filters.some((filter) => filter.display !== undefined);
		visibleFilterIds =
			initialVisibleFilterIds.length > 0
				? initialVisibleFilterIds.filter((id) => filters.some((filter) => filter.id === id))
				: hasDisplayConfiguration
					? filters.filter((filter) => filter.display === true).map((filter) => filter.id)
					: filters.slice(0, maxVisibleFilters).map((filter) => filter.id);
		filtersInitialized = true;
	});

	$effect(() => {
		if (fieldsInitialized || !groupFields.length) return;
		orderedFields = groupFields.map((field) => ({ ...field }));
		const enabledCount = orderedFields.filter((field) => field.enabled).length;
		levels = Math.max(1, enabledCount || 1);
		fieldsInitialized = true;
	});

	const visibleFilters = $derived(
		filters.filter((filter) => visibleFilterIds.includes(filter.id) || activeFilter === filter.id)
	);
	function matches(node: AdvancedFolderHierarchyNode, search: string): boolean {
		return [node.name, ...(node.keywords ?? [])].some((value) =>
			value.toLocaleLowerCase().includes(search)
		);
	}

	function filterNodes(
		nodes: AdvancedFolderHierarchyNode[],
		search: string
	): AdvancedFolderHierarchyNode[] {
		if (!search) return nodes;
		return nodes.flatMap((node) => {
			const children = filterNodes(node.children ?? [], search);
			return matches(node, search) || children.length ? [{ ...node, children }] : [];
		});
	}

	function groupRecords(
		source: AdvancedFolderHierarchyRecord[],
		keys: string[],
		depth = 0,
		parentId = 'group'
	): AdvancedFolderHierarchyNode[] {
		if (depth >= keys.length) {
			return source.map((record) => ({
				id: `file-${record.id}`,
				name: record.name,
				meta: record.code,
				color: '#64748b',
				keywords: [record.code ?? '']
			}));
		}

		const fieldId = keys[depth];
		const field = groupFields.find((candidate) => candidate.id === fieldId);
		const recordKey = field?.key ?? fieldId;
		const groups = new Map<string, AdvancedFolderHierarchyRecord[]>();
		for (const record of source) {
			const rawValue = record[recordKey];
			const value = String(rawValue ?? 'Unassigned');
			groups.set(value, [...(groups.get(value) ?? []), record]);
		}

		return [...groups.entries()].map(([value, groupedRecords], index) => {
			const id = `${parentId}-${fieldId}-${value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
			return {
				id,
				name: value,
				count: groupedRecords.length,
				color: field?.valueColors?.[value] ?? field?.defaultColor ?? '#246da5',
				defaultOpen: index === 0,
				children: groupRecords(groupedRecords, keys, depth + 1, id)
			};
		});
	}

	const hierarchyItems = $derived.by(() => {
		if (!records.length) return items;
		const selectedFilter = filters.find((filter) => filter.id === activeFilter);
		const configuredKeys =
			selectedFilter?.groupBy ??
			groupFields.filter((field) => field.enabled).map((field) => field.id);
		const levelCount = Math.min(
			selectedFilter?.levels ?? configuredKeys.length,
			configuredKeys.length
		);
		return groupRecords(records, configuredKeys.slice(0, levelCount));
	});

	const visibleItems = $derived(filterNodes(hierarchyItems, query.trim().toLocaleLowerCase()));

	function chooseFilter(filter: (typeof filters)[number]) {
		activeFilter = filter.id;
		onFilterChange?.(activeFilter, filter);
	}

	function openBuilder() {
		builderOpen = true;
		onSecondaryAction?.();
	}

	function toggleGroupField(id: string) {
		orderedFields = orderedFields.map((field) =>
			field.id === id && !field.locked ? { ...field, enabled: !field.enabled } : field
		);
		const enabledCount = orderedFields.filter((field) => field.enabled).length;
		levels = Math.min(Math.max(1, levels), Math.max(1, enabledCount));
	}

	function moveField(targetId: string) {
		if (!draggedFieldId || draggedFieldId === targetId) return;
		const sourceIndex = orderedFields.findIndex((field) => field.id === draggedFieldId);
		const targetIndex = orderedFields.findIndex((field) => field.id === targetId);
		if (sourceIndex < 0 || targetIndex < 0) return;
		const reordered = [...orderedFields];
		const [moved] = reordered.splice(sourceIndex, 1);
		reordered.splice(targetIndex, 0, moved);
		orderedFields = reordered;
	}

	function createSpace() {
		const enabled = orderedFields.filter((field) => field.enabled).map((field) => field.id);
		if (!enabled.length) return;
		onCreateSpace?.({
			name: spaceName.trim() || 'New space',
			groupBy: enabled.slice(0, levels),
			levels
		});
		builderOpen = false;
	}

	function toggle(node: AdvancedFolderHierarchyNode) {
		if (!node.children?.length) return;
		const currentlyOpen =
			expandedIds.includes(node.id) || (node.defaultOpen && !closedIds.includes(node.id));
		if (currentlyOpen) {
			expandedIds = expandedIds.filter((id) => id !== node.id);
			closedIds = [...closedIds, node.id];
		} else {
			expandedIds = [...expandedIds, node.id];
			closedIds = closedIds.filter((id) => id !== node.id);
		}
		onExpandedChange?.(expandedIds);
	}

	function selectNode(node: AdvancedFolderHierarchyNode) {
		if (node.disabled) return;
		selectedId = node.id;
		onSelect?.(node);
	}
</script>

<aside class="advanced-folder {className}">
	<header class="advanced-folder__header">
		<div class="advanced-folder__title">
			<Icon icon={titleIcon} klass="advanced-folder__title-icon" />
			<strong>{builderOpen ? 'New Saved Space' : title}</strong>
		</div>
		{#if builderOpen}
			<button
				type="button"
				class="advanced-folder__builder-close"
				aria-label="Close space builder"
				onclick={() => (builderOpen = false)}><X width={15} height={15} /></button
			>
		{:else if HeaderActions}
			<div class="advanced-folder__header-actions">
				{@render HeaderActions()}
			</div>
		{/if}
	</header>

	{#if builderOpen}
		<div class="advanced-folder__builder">
			<label class="advanced-folder__builder-label">
				<span>Space name</span>
				<input bind:value={spaceName} />
			</label>

			<div class="advanced-folder__builder-copy">
				<strong>Group by (drag to reorder)</strong>
				<p>
					Choose which tags group your projects, and in what order. Untick a field to skip it
					entirely.
				</p>
			</div>

			<div class="advanced-folder__group-fields">
				{#each orderedFields as field (field.id)}
					{@const enabledOrder =
						orderedFields
							.filter((candidate) => candidate.enabled)
							.findIndex((candidate) => candidate.id === field.id) + 1}
					<div
						role="listitem"
						class:advanced-folder__group-field--disabled={!field.enabled}
						class="advanced-folder__group-field"
						draggable="true"
						ondragstart={() => (draggedFieldId = field.id)}
						ondragover={(event) => event.preventDefault()}
						ondrop={() => moveField(field.id)}
						ondragend={() => (draggedFieldId = '')}
					>
						<span class="advanced-folder__drag" aria-hidden="true">⠿</span>
						<span class="advanced-folder__order">{field.enabled ? enabledOrder : '−'}</span>
						<input
							type="checkbox"
							checked={field.enabled}
							disabled={field.locked}
							aria-label={`Use ${field.label}`}
							onchange={() => toggleGroupField(field.id)}
						/>
						<strong>{field.label}</strong>
						{#if field.example}<small>{field.example}</small>{/if}
					</div>
				{/each}
			</div>

			<p class="advanced-folder__hierarchy-note">
				Hierarchy builds top → bottom through checked fields, then stops.
			</p>

			<div class="advanced-folder__levels">
				<div>
					<strong>Levels to show</strong>
					<p>Hierarchy terminates at this level</p>
				</div>
				<button type="button" disabled={levels <= 1} onclick={() => (levels -= 1)}>−</button>
				<strong>{levels}</strong>
				<button
					type="button"
					disabled={levels >= Math.max(1, orderedFields.filter((field) => field.enabled).length)}
					onclick={() => (levels += 1)}>+</button
				>
			</div>

			<div class="advanced-folder__builder-actions">
				<button type="button" onclick={() => (builderOpen = false)}>Cancel</button>
				<button
					type="button"
					class="advanced-folder__create"
					disabled={!orderedFields.some((field) => field.enabled)}
					onclick={createSpace}>Create space</button
				>
			</div>
		</div>
	{:else}
		<div class="advanced-folder__filters">
			{#each visibleFilters as filter (filter.id)}
				<button
					type="button"
					class:advanced-folder__filter--active={activeFilter === filter.id}
					class="advanced-folder__filter"
					aria-pressed={activeFilter === filter.id}
					onclick={() => chooseFilter(filter)}>{filter.label}</button
				>
			{/each}
			<button type="button" class="advanced-folder__primary-action" onclick={onPrimaryAction}>
				{primaryActionLabel}
			</button>
			<button type="button" class="advanced-folder__secondary-action" onclick={openBuilder}>
				<Plus width={13} height={13} />
				{secondaryActionLabel}
			</button>
		</div>

		<div class="advanced-folder__search-wrap">
			<label class="advanced-folder__search">
				<Search width={14} height={14} />
				<input type="search" bind:value={query} placeholder={searchPlaceholder} />
			</label>
		</div>

		<nav class="advanced-folder__tree" aria-label={title}>
			{#if visibleItems.length}
				{#each visibleItems as node (node.id)}
					{@render TreeNode(node, 0)}
				{/each}
			{:else}
				<p class="advanced-folder__empty">No matching spaces</p>
			{/if}
		</nav>

		<button type="button" class="advanced-folder__footer" onclick={onFooterClick}>
			<span><Grid width={13} height={13} /> {footerLabel}</span>
			{#if footerCount !== undefined}<small>{footerCount}</small>{/if}
		</button>
	{/if}
</aside>

{#snippet TreeNode(node: AdvancedFolderHierarchyNode, depth: number)}
	{@const expandable = Boolean(node.children?.length)}
	{@const open =
		expandedIds.includes(node.id) ||
		(node.defaultOpen && !closedIds.includes(node.id)) ||
		Boolean(query)}
	<div class="advanced-folder__branch">
		<div
			role="treeitem"
			tabindex={node.disabled ? undefined : 0}
			aria-selected={selectedId === node.id}
			aria-expanded={expandable ? open : undefined}
			aria-disabled={node.disabled}
			class:advanced-folder__row--selected={selectedId === node.id}
			class="advanced-folder__row"
			style:padding-left={`${12 + depth * 22}px`}
			onclick={() => {
				selectNode(node);
				if (expandable) toggle(node);
			}}
			onkeydown={(event) => {
				if ((event.key === 'Enter' || event.key === ' ') && !node.disabled) {
					event.preventDefault();
					selectNode(node);
					if (expandable) toggle(node);
				}
			}}
		>
			<button
				type="button"
				class="advanced-folder__toggle"
				disabled={!expandable}
				aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
				onclick={(event) => {
					event.stopPropagation();
					toggle(node);
				}}
			>
				{#if expandable}
					{#if open}<ChevronDown width={12} height={12} />{:else}<ChevronRight
							width={12}
							height={12}
						/>{/if}
				{/if}
			</button>

			{#if node.icon}
				<Icon icon={node.icon} klass="advanced-folder__node-icon" />
			{:else}
				<span
					class="advanced-folder__marker"
					style:background-color={node.color ?? 'var(--semantic-accent, #0891b2)'}
				></span>
			{/if}
			<span class="advanced-folder__name">{node.name}</span>
			{#if node.meta}<small class="advanced-folder__meta">{node.meta}</small>{/if}
			{#if node.count !== undefined}<span class="advanced-folder__count">{node.count}</span>{/if}
		</div>

		{#if expandable && open}
			<div role="group">
				{#each node.children ?? [] as child (child.id)}
					{@render TreeNode(child, depth + 1)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<style>
	.advanced-folder {
		display: flex;
		width: 100%;
		min-width: 260px;
		height: 100%;
		min-height: 420px;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-family: var(--font-sans);
		box-shadow: var(--shadow-sm);
	}
	.advanced-folder__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 49px;
		padding: 0 12px;
		border-bottom: 1px solid var(--border-primary);
	}
	.advanced-folder__title,
	.advanced-folder__header-actions,
	.advanced-folder__footer > span {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.advanced-folder__title {
		font-size: 13px;
	}
	:global(.advanced-folder__title-icon) {
		width: 15px;
		height: 15px;
		color: var(--semantic-accent, #0891b2);
	}
	.advanced-folder__header-actions button {
		display: grid;
		width: 28px;
		height: 28px;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 5px;
		background: transparent;
		color: var(--text-tertiary);
	}
	.advanced-folder__header-actions button:hover {
		background: var(--surface-secondary);
		color: var(--text-primary);
	}
	.advanced-folder__builder-close {
		display: grid;
		width: 28px;
		height: 28px;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 5px;
		background: transparent;
		color: var(--text-tertiary);
	}
	.advanced-folder__builder-close:hover {
		background: var(--surface-secondary);
	}
	.advanced-folder__filters {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 10px 9px 8px;
		border-bottom: 1px solid var(--border-primary);
	}
	.advanced-folder__filter,
	.advanced-folder__primary-action,
	.advanced-folder__secondary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-height: 27px;
		padding: 3px 11px;
		border-radius: 999px;
		font-size: 11.5px;
		font-weight: 600;
		white-space: nowrap;
	}
	.advanced-folder__filter {
		border: 1px solid var(--border-primary);
		background: var(--surface-secondary);
		color: var(--text-secondary);
	}
	.advanced-folder__filter--active {
		border-color: var(--semantic-accent, #0891b2);
		background: var(--semantic-accent, #0891b2);
		color: var(--on-accent, #ffffff);
	}
	.advanced-folder__primary-action {
		border: 1px solid var(--semantic-accent, #0891b2);
		background: var(--semantic-accent, #0891b2);
		color: var(--on-accent, #ffffff);
	}
	.advanced-folder__secondary-action {
		border: 1px dashed var(--border-secondary);
		background: transparent;
		color: var(--text-secondary);
	}
	.advanced-folder__builder {
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		gap: 14px;
		padding: 14px 15px 13px;
		overflow-y: auto;
	}
	.advanced-folder__builder-label {
		display: grid;
		gap: 6px;
	}
	.advanced-folder__builder-label > span,
	.advanced-folder__builder-copy > strong {
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.advanced-folder__builder-label input {
		width: 100%;
		height: 36px;
		padding: 0 11px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-secondary);
		color: var(--text-primary);
		font-size: 12.5px;
		outline: none;
	}
	.advanced-folder__builder-label input:focus {
		border-color: var(--semantic-accent, #0891b2);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--semantic-accent, #0891b2) 18%, transparent);
	}
	.advanced-folder__builder-copy p {
		margin: 6px 0 0;
		color: var(--text-tertiary);
		font-size: 11px;
		line-height: 1.45;
	}
	.advanced-folder__group-fields {
		display: grid;
		gap: 5px;
	}
	.advanced-folder__group-field {
		display: grid;
		grid-template-columns: 13px 20px 16px minmax(60px, auto) minmax(0, 1fr);
		align-items: center;
		gap: 6px;
		min-height: 37px;
		padding: 4px 7px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-secondary);
		color: var(--text-primary);
		cursor: grab;
	}
	.advanced-folder__group-field:active {
		cursor: grabbing;
	}
	.advanced-folder__group-field--disabled {
		opacity: 0.48;
	}
	.advanced-folder__drag {
		color: var(--text-tertiary);
		font-size: 13px;
	}
	.advanced-folder__order {
		display: grid;
		width: 19px;
		height: 19px;
		place-items: center;
		border-radius: 50%;
		background: var(--semantic-accent, #0891b2);
		color: var(--on-accent, #fff);
		font-size: 10px;
		font-weight: 700;
	}
	.advanced-folder__group-field--disabled .advanced-folder__order {
		background: var(--text-tertiary);
	}
	.advanced-folder__group-field input {
		width: 15px;
		height: 15px;
		accent-color: var(--semantic-accent, #0891b2);
	}
	.advanced-folder__group-field strong {
		font-size: 11.5px;
		white-space: nowrap;
	}
	.advanced-folder__group-field small {
		overflow: hidden;
		color: var(--text-tertiary);
		font-size: 9px;
		text-align: right;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.advanced-folder__hierarchy-note {
		margin: -9px 0 0 3px;
		padding-left: 9px;
		border-left: 2px dashed var(--border-primary);
		color: var(--text-tertiary);
		font-size: 10px;
		font-style: italic;
		line-height: 1.4;
	}
	.advanced-folder__levels {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border: 1px solid var(--border-primary);
		border-radius: 7px;
		background: var(--surface-secondary);
	}
	.advanced-folder__levels > div {
		min-width: 0;
		flex: 1;
	}
	.advanced-folder__levels > div strong {
		font-size: 11.5px;
	}
	.advanced-folder__levels p {
		margin: 2px 0 0;
		color: var(--text-tertiary);
		font-size: 9.5px;
	}
	.advanced-folder__levels > button {
		display: grid;
		width: 23px;
		height: 23px;
		place-items: center;
		padding: 0;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-secondary);
	}
	.advanced-folder__levels > button:disabled {
		opacity: 0.4;
	}
	.advanced-folder__levels > strong {
		color: var(--semantic-accent, #0891b2);
		font-size: 13px;
	}
	.advanced-folder__builder-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-top: auto;
	}
	.advanced-folder__builder-actions button {
		min-height: 35px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-size: 12px;
		font-weight: 600;
	}
	.advanced-folder__builder-actions .advanced-folder__create {
		border-color: var(--semantic-accent, #0891b2);
		background: var(--semantic-accent, #0891b2);
		color: var(--on-accent, #fff);
	}
	.advanced-folder__builder-actions .advanced-folder__create:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.advanced-folder__search-wrap {
		padding: 10px 9px;
		border-bottom: 1px solid var(--border-primary);
	}
	.advanced-folder__search {
		position: relative;
		display: flex;
		align-items: center;
		color: var(--text-tertiary);
	}
	.advanced-folder__search > :global(svg) {
		position: absolute;
		left: 13px;
	}
	.advanced-folder__search input {
		width: 100%;
		height: 36px;
		padding: 0 12px 0 35px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-secondary);
		color: var(--text-primary);
		font-size: 12.5px;
		outline: none;
	}
	.advanced-folder__search input:focus {
		border-color: var(--semantic-accent, #0891b2);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--semantic-accent, #0891b2) 18%, transparent);
	}
	.advanced-folder__tree {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: 6px 0;
	}
	.advanced-folder__row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding-right: 10px;
		color: var(--text-secondary);
		font-size: 12px;
		cursor: pointer;
	}
	.advanced-folder__row:hover,
	.advanced-folder__row--selected {
		background: var(--surface-secondary);
		color: var(--text-primary);
	}
	.advanced-folder__row[aria-disabled='true'] {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.advanced-folder__toggle {
		display: grid;
		width: 12px;
		height: 20px;
		flex-shrink: 0;
		place-items: center;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text-tertiary);
	}
	.advanced-folder__toggle:disabled {
		pointer-events: none;
	}
	.advanced-folder__marker {
		width: 7px;
		height: 7px;
		flex-shrink: 0;
		border-radius: 1px;
	}
	:global(.advanced-folder__node-icon) {
		width: 13px;
		height: 13px;
		color: var(--text-tertiary);
	}
	.advanced-folder__name {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.advanced-folder__meta {
		max-width: 76px;
		overflow: hidden;
		color: var(--text-tertiary);
		font-family: var(--font-mono, monospace);
		font-size: 8.5px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.advanced-folder__count {
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 9.5px;
	}
	.advanced-folder__empty {
		padding: 24px 12px;
		color: var(--text-tertiary);
		font-size: 12px;
		text-align: center;
	}
	.advanced-folder__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 42px;
		padding: 0 12px;
		border: 0;
		border-top: 1px solid var(--border-primary);
		background: var(--surface-primary);
		color: var(--text-secondary);
		font-size: 12px;
		text-align: left;
	}
	.advanced-folder__footer:hover {
		background: var(--surface-secondary);
		color: var(--text-primary);
	}
	.advanced-folder__footer small {
		color: var(--text-tertiary);
		font-size: 10px;
	}
</style>

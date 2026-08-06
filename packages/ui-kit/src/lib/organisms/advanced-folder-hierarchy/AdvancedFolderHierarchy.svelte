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
	import Icon from '../../atoms/icon/Icon.svelte';
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

<aside
	class="flex h-full min-h-[420px] w-full min-w-[260px] flex-col overflow-hidden rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] font-[var(--font-sans)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] {className}"
>
	<header
		class="flex min-h-[49px] items-center justify-between border-b border-[var(--border-primary)] px-3"
	>
		<div class="flex items-center gap-2 text-[13px]">
			<Icon icon={titleIcon} klass="size-[15px] text-[var(--semantic-accent)]" />
			<strong>{builderOpen ? 'New Saved Space' : title}</strong>
		</div>
		{#if builderOpen}
			<button
				type="button"
				class="!grid !size-7 !min-h-0 !place-items-center !rounded-[5px] !border-0 !bg-transparent !p-0 !text-[var(--text-tertiary)] !shadow-none hover:!bg-[var(--surface-secondary)] active:!scale-100"
				aria-label="Close space builder"
				onclick={() => (builderOpen = false)}><X width={15} height={15} /></button
			>
		{:else if HeaderActions}
			<div
				class="flex items-center gap-2 [&_button]:!grid [&_button]:!size-7 [&_button]:!place-items-center [&_button]:!rounded-[5px] [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!p-0 [&_button]:!text-[var(--text-tertiary)] [&_button:hover]:!bg-[var(--surface-secondary)]"
			>
				{@render HeaderActions()}
			</div>
		{/if}
	</header>

	{#if builderOpen}
		<div class="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[15px] pt-3.5 pb-[13px]">
			<label class="!mb-0 grid gap-1.5">
				<span class="text-[10px] font-bold tracking-[.06em] text-[var(--text-tertiary)] uppercase"
					>Space name</span
				>
				<input
					bind:value={spaceName}
					class="!h-9 w-full rounded-md border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-[11px] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--semantic-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--semantic-accent)_18%,transparent)]"
				/>
			</label>

			<div>
				<strong class="text-[10px] font-bold tracking-[.06em] text-[var(--text-tertiary)] uppercase"
					>Group by (drag to reorder)</strong
				>
				<p>
					Choose which tags group your projects, and in what order. Untick a field to skip it
					entirely.
				</p>
			</div>

			<div class="grid gap-[5px]">
				{#each orderedFields as field (field.id)}
					{@const enabledOrder =
						orderedFields
							.filter((candidate) => candidate.enabled)
							.findIndex((candidate) => candidate.id === field.id) + 1}
					<div
						role="listitem"
						class="grid min-h-[37px] cursor-grab grid-cols-[13px_20px_16px_minmax(60px,auto)_minmax(0,1fr)] items-center gap-1.5 rounded-md border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-[7px] py-1 text-[var(--text-primary)] active:cursor-grabbing {field.enabled
							? ''
							: 'opacity-50'}"
						draggable="true"
						ondragstart={() => (draggedFieldId = field.id)}
						ondragover={(event) => event.preventDefault()}
						ondrop={() => moveField(field.id)}
						ondragend={() => (draggedFieldId = '')}
					>
						<span class="text-[13px] text-[var(--text-tertiary)]" aria-hidden="true">⠿</span>
						<span
							class="grid size-[19px] place-items-center rounded-full bg-[var(--semantic-accent)] text-[10px] font-bold text-[var(--on-accent)]"
							>{field.enabled ? enabledOrder : '−'}</span
						>
						<input
							type="checkbox"
							checked={field.enabled}
							disabled={field.locked}
							aria-label={`Use ${field.label}`}
							onchange={() => toggleGroupField(field.id)}
						/>
						<strong class="whitespace-nowrap text-[11.5px]">{field.label}</strong>
						{#if field.example}<small
								class="overflow-hidden text-end text-[9px] text-ellipsis whitespace-nowrap text-[var(--text-tertiary)]"
								>{field.example}</small
							>{/if}
					</div>
				{/each}
			</div>

			<p
				class="-mt-[9px] ms-[3px] border-s-2 border-dashed border-[var(--border-primary)] ps-[9px] text-[10px] leading-[1.4] italic text-[var(--text-tertiary)]"
			>
				Hierarchy builds top → bottom through checked fields, then stops.
			</p>

			<div
				class="flex items-center gap-2.5 rounded-[7px] border border-[var(--border-primary)] bg-[var(--surface-secondary)] p-2.5 [&>button]:!grid [&>button]:!size-[23px] [&>button]:!min-h-0 [&>button]:!place-items-center [&>button]:!rounded-[5px] [&>button]:!border [&>button]:!border-[var(--border-primary)] [&>button]:!bg-[var(--surface-primary)] [&>button]:!p-0 [&>button]:!shadow-none [&>button:disabled]:!opacity-40"
			>
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

			<div
				class="mt-auto grid grid-cols-2 gap-2 [&>button]:!min-h-[35px] [&>button]:!rounded-md [&>button]:!border [&>button]:!border-[var(--border-primary)] [&>button]:!bg-[var(--surface-primary)] [&>button]:!text-xs [&>button]:!font-semibold [&>button]:!shadow-none"
			>
				<button type="button" onclick={() => (builderOpen = false)}>Cancel</button>
				<button
					type="button"
					class="!border-[var(--semantic-accent)] !bg-[var(--semantic-accent)] !text-[var(--on-accent)] disabled:!cursor-not-allowed disabled:!opacity-50"
					disabled={!orderedFields.some((field) => field.enabled)}
					onclick={createSpace}>Create space</button
				>
			</div>
		</div>
	{:else}
		<div
			class="relative flex flex-wrap gap-1.5 border-b border-[var(--border-primary)] px-[9px] pt-2.5 pb-2"
		>
			{#each visibleFilters as filter (filter.id)}
				<button
					type="button"
					class="!inline-flex !min-h-[27px] !rounded-full !px-[11px] !py-[3px] !text-[11.5px] !font-semibold !shadow-none {activeFilter ===
					filter.id
						? '!border-[var(--semantic-accent)] !bg-[var(--semantic-accent)] !text-[var(--on-accent)]'
						: '!border-[var(--border-primary)] !bg-[var(--surface-secondary)] !text-[var(--text-secondary)]'}"
					aria-pressed={activeFilter === filter.id}
					onclick={() => chooseFilter(filter)}>{filter.label}</button
				>
			{/each}
			<button
				type="button"
				class="!min-h-[27px] !rounded-full !border-[var(--semantic-accent)] !bg-[var(--semantic-accent)] !px-[11px] !py-[3px] !text-[11.5px] !text-[var(--on-accent)] !shadow-none"
				onclick={onPrimaryAction}
			>
				{primaryActionLabel}
			</button>
			<button
				type="button"
				class="!min-h-[27px] !rounded-full !border-dashed !border-[var(--border-secondary)] !bg-transparent !px-[11px] !py-[3px] !text-[11.5px] !text-[var(--text-secondary)] !shadow-none"
				onclick={openBuilder}
			>
				<Plus width={13} height={13} />
				{secondaryActionLabel}
			</button>
		</div>

		<div class="border-b border-[var(--border-primary)] px-[9px] py-2.5">
			<label class="!mb-0 relative flex items-center text-[var(--text-tertiary)]">
				<Search class="absolute start-[13px]" width={14} height={14} />
				<input
					class="!h-9 w-full rounded-md border border-[var(--border-primary)] bg-[var(--surface-secondary)] pe-3 ps-[35px] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--semantic-accent)]"
					type="search"
					bind:value={query}
					placeholder={searchPlaceholder}
				/>
			</label>
		</div>

		<nav class="min-h-0 flex-1 overflow-y-auto py-1.5" aria-label={title}>
			{#if visibleItems.length}
				{#each visibleItems as node (node.id)}
					{@render TreeNode(node, 0)}
				{/each}
			{:else}
				<p class="px-3 py-6 text-center text-xs text-[var(--text-tertiary)]">No matching spaces</p>
			{/if}
		</nav>

		<button
			type="button"
			class="!flex !min-h-[42px] !items-center !justify-between !rounded-none !border-0 !border-t !border-[var(--border-primary)] !bg-[var(--surface-primary)] !px-3 !py-0 !text-xs !text-[var(--text-secondary)] !shadow-none hover:!bg-[var(--surface-secondary)]"
			onclick={onFooterClick}
		>
			<span class="flex items-center gap-2"><Grid width={13} height={13} /> {footerLabel}</span>
			{#if footerCount !== undefined}<small class="text-[10px] text-[var(--text-tertiary)]"
					>{footerCount}</small
				>{/if}
		</button>
	{/if}
</aside>

{#snippet TreeNode(node: AdvancedFolderHierarchyNode, depth: number)}
	{@const expandable = Boolean(node.children?.length)}
	{@const open =
		expandedIds.includes(node.id) ||
		(node.defaultOpen && !closedIds.includes(node.id)) ||
		Boolean(query)}
	<div>
		<div
			role="treeitem"
			tabindex={node.disabled ? undefined : 0}
			aria-selected={selectedId === node.id}
			aria-expanded={expandable ? open : undefined}
			aria-disabled={node.disabled}
			class="flex min-h-9 cursor-pointer items-center gap-2 pe-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 {selectedId ===
			node.id
				? 'bg-[var(--surface-secondary)] text-[var(--text-primary)]'
				: ''}"
			style:padding-inline-start={`${12 + depth * 22}px`}
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
				class="!grid !h-5 !w-3 !min-h-0 !shrink-0 !place-items-center !border-0 !bg-transparent !p-0 !text-[var(--text-tertiary)] !shadow-none disabled:!pointer-events-none"
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
				<Icon icon={node.icon} klass="size-[13px] text-[var(--text-tertiary)]" />
			{:else}
				<span
					class="size-[7px] shrink-0 rounded-[1px]"
					style:background-color={node.color ?? 'var(--semantic-accent, #0891b2)'}
				></span>
			{/if}
			<span class="min-w-0 flex-1 overflow-hidden font-semibold text-ellipsis whitespace-nowrap"
				>{node.name}</span
			>
			{#if node.meta}<small
					class="max-w-[76px] overflow-hidden font-[var(--font-mono,monospace)] text-[8.5px] text-ellipsis whitespace-nowrap text-[var(--text-tertiary)]"
					>{node.meta}</small
				>{/if}
			{#if node.count !== undefined}<span
					class="font-[var(--font-mono)] text-[9.5px] text-[var(--text-tertiary)]"
					>{node.count}</span
				>{/if}
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

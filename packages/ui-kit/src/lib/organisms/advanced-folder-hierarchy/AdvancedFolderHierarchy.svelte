<script lang="ts">
	import {
		ChevronDown,
		ChevronRight,
		Briefcase,
		Hexagon,
		Layers,
		Plus,
		Search,
		Sliders,
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
		titleIcon = Layers,
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
	let builderOpen = $state(false);
	let spaceName = $state('New space');
	let orderedFields = $state<AdvancedFolderHierarchyGroupField[]>([]);
	let fieldsInitialized = $state(false);
	let levels = $state(1);
	let draggedFieldId = $state('');
	let closedIds = $state<string[]>([]);

	const visibleFilterIds = $derived.by(() => {
		const hasDisplayConfiguration = filters.some((filter) => filter.display !== undefined);
		return initialVisibleFilterIds.length > 0
			? initialVisibleFilterIds.filter((id) => filters.some((filter) => filter.id === id))
			: hasDisplayConfiguration
				? filters.filter((filter) => filter.display === true).map((filter) => filter.id)
				: filters.slice(0, maxVisibleFilters).map((filter) => filter.id);
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
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
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
				defaultOpen: depth === 0 && index === 0,
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
	class="flex h-full min-h-[420px] w-full min-w-[260px] flex-col overflow-hidden rounded-[22px] border border-white/65 bg-[color-mix(in_srgb,var(--surface-primary)_88%,transparent)] p-3 font-(family-name:--font-body) text-[var(--text-primary)] shadow-[0_18px_55px_rgb(15_23_42_/_0.16)] backdrop-blur-[24px] {className}"
>
	<header class="flex min-h-[46px] items-center justify-between gap-2 px-1 pb-3">
		<div class="flex min-w-0 flex-1 items-center gap-2.5 text-[15px]">
			<span
				class="grid size-[35px] shrink-0 place-items-center rounded-xl ![background:var(--xylo-gradient,var(--semantic-accent))] text-white shadow-[0_6px_16px_rgb(219_69_157_/_0.3)]"
			>
				<Icon icon={titleIcon} klass="size-[17px]" />
			</span>
			<strong class="truncate font-(family-name:--font-heading) font-bold tracking-[-0.2px]"
				>{builderOpen ? 'New saved space' : title}</strong
			>
		</div>
		{#if builderOpen}
			<button
				type="button"
				class="!grid !size-9 !place-items-center !rounded-xl !border-0 !bg-[color-mix(in_srgb,var(--semantic-accent)_8%,transparent)] !p-0 !text-[var(--semantic-accent)] !shadow-none"
				aria-label="Grouping settings"><Sliders width={16} height={16} /></button
			>
			<button
				type="button"
				class="!grid !size-9 !min-h-0 !place-items-center !rounded-xl !border-0 !bg-transparent !p-0 !text-[var(--text-tertiary)] !shadow-none hover:!bg-[var(--surface-secondary)] active:!scale-100"
				aria-label="Close space builder"
				onclick={() => (builderOpen = false)}><X width={15} height={15} /></button
			>
		{:else}
			<button
				type="button"
				class="!ms-auto !grid !size-9 !place-items-center !rounded-xl !border-0 !bg-transparent !p-0 !text-[var(--text-tertiary)] !shadow-none hover:!bg-[color-mix(in_srgb,var(--semantic-accent)_8%,transparent)] hover:!text-[var(--semantic-accent)]"
				aria-label="Grouping settings"
				onclick={openBuilder}><Sliders width={16} height={16} /></button
			>
			{#if HeaderActions}
				<div
					class="flex items-center gap-1 [&_button]:!grid [&_button]:!size-9 [&_button]:!place-items-center [&_button]:!rounded-xl [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!p-0 [&_button]:!text-[var(--text-tertiary)] [&_button:hover]:!bg-[var(--surface-secondary)]"
				>
					{@render HeaderActions()}
				</div>
			{/if}
		{/if}
	</header>

	{#if builderOpen}
		<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pt-1 pb-1">
			<label class="!mb-0 grid gap-1.5">
				<span
					class="font-(family-name:--font-body) text-[10px] font-bold tracking-[.06em] text-[var(--text-tertiary)] uppercase"
					>Space name</span
				>
				<input
					bind:value={spaceName}
					class="!h-10 w-full rounded-xl border border-[var(--border-primary)] bg-white/70 px-3 text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--semantic-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--semantic-accent)_18%,transparent)]"
				/>
			</label>

			<div>
				<strong
					class="font-(family-name:--font-body) text-[10px] font-bold tracking-[.06em] text-[var(--text-tertiary)] uppercase"
					>Group by <span class="normal-case tracking-normal">drag to reorder</span></strong
				>
				<p class="!mt-1 !mb-0 !text-[11px] !leading-[1.5] text-[var(--text-tertiary)]">
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
						class="grid min-h-[42px] cursor-grab grid-cols-[13px_20px_18px_minmax(60px,auto)_minmax(0,1fr)] items-center gap-1.5 rounded-[14px] border border-[var(--border-primary)] bg-white/70 px-2.5 py-1.5 text-[var(--text-primary)] shadow-[0_2px_8px_rgb(15_23_42_/_0.03)] active:cursor-grabbing {field.enabled
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
							class="grid size-[19px] place-items-center rounded-full bg-[var(--semantic-accent)] font-(family-name:--font-heading) text-[10px] font-bold text-[var(--on-accent)]"
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
				class="flex items-center gap-2.5 rounded-[14px] bg-[color-mix(in_srgb,var(--semantic-accent)_7%,transparent)] p-3.5 [&>button]:!grid [&>button]:!size-[30px] [&>button]:!min-h-0 [&>button]:!place-items-center [&>button]:!rounded-[10px] [&>button]:!border [&>button]:!border-[var(--border-primary)] [&>button]:!bg-white/70 [&>button]:!p-0 [&>button]:!shadow-none [&>button:disabled]:!opacity-40"
			>
				<div class="min-w-0 flex-1">
					<strong class="font-(family-name:--font-body) text-xs font-semibold"
						>Levels to show</strong
					>
					<p class="!mt-0.5 !mb-0 !text-[11px] !leading-[1.5] text-[var(--text-tertiary)]">
						Like Word's TOC — the tree stops at this level
					</p>
				</div>
				<button type="button" disabled={levels <= 1} onclick={() => (levels -= 1)}>−</button>
				<strong class="min-w-3 text-center font-(family-name:--font-heading) text-base tabular-nums"
					>{levels}</strong
				>
				<button
					type="button"
					disabled={levels >= Math.max(1, orderedFields.filter((field) => field.enabled).length)}
					onclick={() => (levels += 1)}>+</button
				>
			</div>

			<div
				class="flex justify-end gap-2 [&>button]:!min-h-[38px] [&>button]:!rounded-full [&>button]:!border [&>button]:!px-4 [&>button]:!text-xs [&>button]:!font-semibold [&>button]:!shadow-none [&>button]:transition-colors [&>button]:duration-150 [&>button]:focus-visible:outline-2 [&>button]:focus-visible:outline-offset-2 [&>button]:focus-visible:outline-[var(--semantic-accent)]"
			>
				<button
					type="button"
					class="!border-[var(--border-primary)] !bg-[var(--surface-primary)] !text-[var(--text-secondary)] hover:!bg-[var(--surface-secondary)]"
					onclick={() => (builderOpen = false)}>Cancel</button
				>
				<button
					type="button"
					class="!border-transparent ![background:var(--xylo-gradient,var(--semantic-accent))] !text-white shadow-[var(--xylo-primary-shadow)] enabled:hover:!brightness-105 disabled:!cursor-not-allowed disabled:!opacity-50"
					disabled={!orderedFields.some((field) => field.enabled)}
					onclick={createSpace}>Create space</button
				>
			</div>
		</div>
		<button
			type="button"
			class="!flex !min-h-[42px] !items-center !justify-between !rounded-none !border-0 !border-t !border-[var(--border-primary)] !bg-transparent !px-2 !py-0 !text-xs !text-[var(--semantic-accent)] !shadow-none hover:!bg-transparent"
			onclick={onFooterClick}
		>
			<span class="flex items-center gap-2"><Briefcase width={13} height={13} /> {footerLabel}</span
			>
			{#if footerCount !== undefined}<small class="text-[10px] text-[var(--text-tertiary)]"
					>{footerCount}</small
				>{/if}
		</button>
	{:else}
		<div class="relative flex flex-wrap gap-1.5 px-1 pb-3">
			{#each visibleFilters as filter (filter.id)}
				<button
					type="button"
					class="!inline-flex !min-h-[27px] !rounded-full !px-[11px] !py-[3px] !font-(family-name:--font-body) !text-[11.5px] !font-semibold !shadow-none {activeFilter ===
					filter.id
						? '!border-transparent ![background:var(--xylo-gradient,var(--semantic-accent))] !text-white shadow-[0_6px_14px_rgb(219_69_157_/_0.3)]'
						: '!border-[var(--border-primary)] !bg-white/65 !text-[var(--text-secondary)]'}"
					aria-pressed={activeFilter === filter.id}
					onclick={() => chooseFilter(filter)}>{filter.label}</button
				>
			{/each}
			{#if primaryActionLabel}<button
					type="button"
					class="!min-h-[27px] !rounded-full !border-[var(--semantic-accent)] !bg-[var(--semantic-accent)] !px-[11px] !py-[3px] !text-[11.5px] !text-[var(--on-accent)] !shadow-none"
					onclick={onPrimaryAction}
				>
					{primaryActionLabel}
				</button>{/if}
			<button
				type="button"
				class="!min-h-[27px] !rounded-full !border-dashed !border-[var(--border-secondary)] !bg-transparent !px-[11px] !py-[3px] !text-[11.5px] !text-[var(--text-secondary)] !shadow-none"
				onclick={openBuilder}
			>
				<Plus width={13} height={13} />
				{secondaryActionLabel}
			</button>
		</div>

		<div class="px-1 pb-2">
			<label class="!mb-0 relative flex items-center text-[var(--text-tertiary)]">
				<Search class="absolute start-[13px]" width={14} height={14} />
				<input
					class="!h-10 w-full rounded-full border-0 bg-[rgb(20_22_39_/_0.04)] pe-3 ps-[35px] text-[12.5px] font-normal text-[var(--text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--semantic-accent)_15%,transparent)]"
					type="search"
					bind:value={query}
					placeholder={searchPlaceholder}
				/>
			</label>
		</div>

		<nav class="min-h-0 flex-1 overflow-y-auto px-0.5 py-1" aria-label={title}>
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
			class="!flex !min-h-[42px] !items-center !justify-between !rounded-none !border-0 !border-t !border-[var(--border-primary)] !bg-transparent !px-2 !py-0 !text-xs !text-[var(--semantic-accent)] !shadow-none hover:!bg-transparent"
			onclick={onFooterClick}
		>
			<span class="flex items-center gap-2"><Briefcase width={13} height={13} /> {footerLabel}</span
			>
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
			class="flex min-h-9 cursor-pointer items-center gap-2 rounded-xl pe-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--semantic-accent)_7%,transparent)] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 {selectedId ===
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
					class="size-[8px] shrink-0 rounded-full"
					style:background-color={node.color ?? 'var(--semantic-accent, #0891b2)'}
				></span>
			{/if}
			<span
				class="min-w-0 flex-1 overflow-hidden  text-ellipsis whitespace-nowrap {expandable
					? '[font-weight:600]'
					: '[font-weight:450]'}">{node.name}</span
			>
			{#if node.meta}<small
					class="max-w-[76px] overflow-hidden font-(family-name:--font-heading) text-[10.5px] font-semibold text-ellipsis whitespace-nowrap text-[var(--text-tertiary)]"
					>{node.meta}</small
				>{/if}
			{#if node.count !== undefined}<span
					class="min-w-5 rounded-full bg-[rgb(20_22_39_/_0.06)] px-1.5 py-0.5 text-center font-(family-name:--font-body) text-[9.5px] text-[var(--text-secondary)] [font-weight:800]"
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

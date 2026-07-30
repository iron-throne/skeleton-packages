<script lang="ts">
	import { untrack } from 'svelte';
	import {
		ArrowDown,
		ArrowDownUp,
		ArrowUp,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Columns,
		Search,
		X
	} from 'svelte-bootstrap-icons';
	import type {
		AdvancedTableColumn,
		AdvancedTableFilterGroup,
		AdvancedTableProps,
		AdvancedTableRow,
		AdvancedTableView
	} from './types';

	let {
		rows,
		columns,
		filterGroups = [],
		views = [],
		defaultViewId,
		defaultSortKey,
		defaultSortDirection = 'asc',
		searchPlaceholder = 'Search documents...',
		filterTitle = 'Filter',
		emptyText = 'No matching records found.',
		pageSize = $bindable(10),
		pageSizeOptions = [10, 25, 50],
		selectable = true,
		selectedIds = $bindable([]),
		class: className = '',
		CustomCell,
		RowActions,
		onSelectionChange,
		onViewChange
	}: AdvancedTableProps = $props();

	const initialView = untrack(
		() => views.find((view) => view.id === defaultViewId) ?? views.find((view) => view.default)
	);
	let activeViewId = $state(initialView?.id ?? '');
	let visibleColumnKeys = $state<string[]>(
		untrack(() => initialView?.columns ?? columns.map((column) => column.key))
	);
	let activeGroupKey = $state(untrack(() => filterGroups[0]?.key ?? ''));
	let activeFilters = $state<Record<string, string[]>>({});
	let query = $state('');
	let sortKey = $state<string | null>(untrack(() => defaultSortKey ?? null));
	let sortDirection = $state<'asc' | 'desc'>(untrack(() => defaultSortDirection));
	let currentPage = $state(1);
	let filtersCollapsed = $state(false);
	let columnsOpen = $state(false);
	let viewsOpen = $state(false);

	const activeGroup = $derived(filterGroups.find((group) => group.key === activeGroupKey));
	const visibleColumns = $derived(
		columns.filter((column) => visibleColumnKeys.includes(column.key))
	);
	const activeFilterItems = $derived(
		filterGroups.flatMap((group) =>
			(activeFilters[group.key] ?? []).map((value) => ({
				group,
				option: group.options.find((option) => option.value === value)
			}))
		)
	);

	function comparable(value: unknown) {
		if (value instanceof Date) return value.getTime();
		if (typeof value === 'number') return value;
		return String(value ?? '').toLocaleLowerCase();
	}

	function rowMatchesGroup(row: AdvancedTableRow, group: AdvancedTableFilterGroup) {
		const selected = activeFilters[group.key] ?? [];
		if (!selected.length) return true;
		const rawValue = group.getValue?.(row) ?? row[group.key];
		const values = Array.isArray(rawValue) ? rawValue : [rawValue];
		return values.some((value) => selected.includes(String(value)));
	}

	const filteredRows = $derived.by(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase();
		return rows.filter((row) => {
			const matchesSearch =
				!normalizedQuery ||
				columns
					.filter((column) => column.searchable !== false)
					.some((column) =>
						String(row[column.key] ?? '')
							.toLocaleLowerCase()
							.includes(normalizedQuery)
					);
			return matchesSearch && filterGroups.every((group) => rowMatchesGroup(row, group));
		});
	});

	const sortedRows = $derived.by(() => {
		if (!sortKey) return filteredRows;
		const column = columns.find((candidate) => candidate.key === sortKey);
		if (!column) return filteredRows;
		return [...filteredRows].sort((a, b) => {
			const aValue = comparable(column.compareValue?.(a) ?? a[column.key]);
			const bValue = comparable(column.compareValue?.(b) ?? b[column.key]);
			const result =
				typeof aValue === 'number' && typeof bValue === 'number'
					? aValue - bValue
					: String(aValue).localeCompare(String(bValue), undefined, {
							numeric: true,
							sensitivity: 'base'
						});
			return sortDirection === 'asc' ? result : -result;
		});
	});

	const totalPages = $derived(Math.max(1, Math.ceil(sortedRows.length / pageSize)));
	const pageRows = $derived(sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	const pageSelected = $derived(
		pageRows.length > 0 && pageRows.every((row) => selectedIds.includes(row.id))
	);

	$effect(() => {
		query;
		activeFilters;
		pageSize;
		currentPage = 1;
	});

	$effect(() => {
		if (currentPage > totalPages) currentPage = totalPages;
	});

	function toggleFilter(groupKey: string, value: string) {
		const current = activeFilters[groupKey] ?? [];
		activeFilters = {
			...activeFilters,
			[groupKey]: current.includes(value)
				? current.filter((item) => item !== value)
				: [...current, value]
		};
	}

	function clearFilters() {
		activeFilters = {};
	}

	function toggleColumn(key: string) {
		if (visibleColumnKeys.includes(key)) {
			if (visibleColumnKeys.length === 1) return;
			visibleColumnKeys = visibleColumnKeys.filter((item) => item !== key);
		} else {
			visibleColumnKeys = [...visibleColumnKeys, key];
		}
		activeViewId = '';
	}

	function applyView(view: AdvancedTableView) {
		activeViewId = view.id;
		visibleColumnKeys = view.columns.filter((key) => columns.some((column) => column.key === key));
		viewsOpen = false;
		onViewChange?.(view);
	}

	function toggleSort(column: AdvancedTableColumn) {
		if (!column.sortable) return;
		if (sortKey === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = column.key;
			sortDirection = 'asc';
		}
	}

	function updateSelection(next: string[]) {
		selectedIds = next;
		onSelectionChange?.(next);
	}

	function toggleRow(id: string) {
		updateSelection(
			selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]
		);
	}

	function togglePage() {
		const pageIds = pageRows.map((row) => row.id);
		updateSelection(
			pageSelected
				? selectedIds.filter((id) => !pageIds.includes(id))
				: [...new Set([...selectedIds, ...pageIds])]
		);
	}
</script>

<div class="advanced-table {filtersCollapsed ? 'advanced-table--collapsed' : ''} {className}">
	{#if filterGroups.length}
		<aside class="advanced-table__filters">
			<div class="advanced-table__filter-header">
				<strong>{filterTitle}</strong>
				<button
					type="button"
					class="advanced-table__icon-button"
					aria-label={filtersCollapsed ? 'Expand filters' : 'Collapse filters'}
					onclick={() => (filtersCollapsed = !filtersCollapsed)}
				>
					{#if filtersCollapsed}<ChevronRight width={14} height={14} />{:else}<ChevronLeft
							width={14}
							height={14}
						/>{/if}
				</button>
			</div>

			{#if !filtersCollapsed}
				<label class="advanced-table__group-label" for="advanced-filter-group">Group by</label>
				<select
					id="advanced-filter-group"
					class="advanced-table__group-select"
					bind:value={activeGroupKey}
				>
					{#each filterGroups as group (group.key)}
						<option value={group.key}>{group.label}</option>
					{/each}
				</select>

				<div class="advanced-table__filter-list">
					{#each activeGroup?.options ?? [] as option (option.value)}
						{@const active = (activeFilters[activeGroupKey] ?? []).includes(option.value)}
						<button
							type="button"
							class:advanced-table__filter-item--active={active}
							class="advanced-table__filter-item"
							aria-pressed={active}
							onclick={() => toggleFilter(activeGroupKey, option.value)}
						>
							{#if option.badge}
								<span class="advanced-table__file-badge">{option.badge}</span>
							{:else if option.color}
								<span class="advanced-table__filter-dot" style:background-color={option.color}
								></span>
							{/if}
							<span>{option.label}</span>
							{#if option.count !== undefined}
								<span class="advanced-table__filter-count">{option.count}</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</aside>
	{/if}

	<section class="advanced-table__main">
		{#if activeFilterItems.length}
			<div class="advanced-table__active-filters">
				{#each activeFilterItems as item (`${item.group.key}-${item.option?.value}`)}
					{#if item.option}
						<button
							type="button"
							class="advanced-table__filter-chip"
							onclick={() => toggleFilter(item.group.key, item.option!.value)}
						>
							<span>{item.group.label}: {item.option.label}</span><X width={11} height={11} />
						</button>
					{/if}
				{/each}
				<button type="button" class="advanced-table__clear" onclick={clearFilters}>Clear</button>
			</div>
		{/if}

		<div class="advanced-table__toolbar">
			<label class="advanced-table__search">
				<Search width={14} height={14} />
				<input type="search" bind:value={query} placeholder={searchPlaceholder} />
			</label>

			<div class="advanced-table__toolbar-actions">
				<div class="advanced-table__popover-wrap">
					<button
						type="button"
						class="advanced-table__toolbar-button"
						aria-expanded={columnsOpen}
						onclick={() => {
							columnsOpen = !columnsOpen;
							viewsOpen = false;
						}}
					>
						<Columns width={14} height={14} /> Columns <ChevronDown width={11} height={11} />
					</button>
					{#if columnsOpen}
						<div class="advanced-table__popover advanced-table__columns-popover">
							<p>Visible columns</p>
							<div class="advanced-table__column-options">
								{#each columns as column (column.key)}
									<button
										type="button"
										class:advanced-table__column-chip--active={visibleColumnKeys.includes(
											column.key
										)}
										class="advanced-table__column-chip"
										aria-pressed={visibleColumnKeys.includes(column.key)}
										onclick={() => toggleColumn(column.key)}>{column.label}</button
									>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				{#if views.length}
					<div class="advanced-table__popover-wrap">
						<button
							type="button"
							class="advanced-table__toolbar-button"
							aria-expanded={viewsOpen}
							onclick={() => {
								viewsOpen = !viewsOpen;
								columnsOpen = false;
							}}
						>
							View <ChevronDown width={11} height={11} />
						</button>
						{#if viewsOpen}
							<div class="advanced-table__popover advanced-table__views-popover">
								<p>Saved views</p>
								{#each views as view (view.id)}
									<button
										type="button"
										class:advanced-table__view--active={activeViewId === view.id}
										class="advanced-table__view"
										onclick={() => applyView(view)}
									>
										<span>{view.name}</span>
										{#if view.default}<small>Default</small>{/if}
										{#if view.personal}<small>Personal</small>{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<span class="advanced-table__result-count">{sortedRows.length.toLocaleString()} items</span>
			</div>
		</div>

		<div class="advanced-table__card">
			<div class="advanced-table__scroll">
				<table>
					<thead>
						<tr>
							{#if selectable}
								<th class="advanced-table__select-cell">
									<input
										type="checkbox"
										checked={pageSelected}
										aria-label="Select all rows on this page"
										onchange={togglePage}
									/>
								</th>
							{/if}
							{#each visibleColumns as column (column.key)}
								<th
									style:width={column.width}
									class:advanced-table__sortable={column.sortable}
									class:advanced-table__align-center={column.align === 'center'}
									class:advanced-table__align-right={column.align === 'right'}
									onclick={() => toggleSort(column)}
								>
									<span>
										{column.label}
										{#if column.sortable}
											{#if sortKey === column.key}
												{#if sortDirection === 'asc'}<ArrowUp
														width={11}
														height={11}
													/>{:else}<ArrowDown width={11} height={11} />{/if}
											{:else}
												<ArrowDownUp width={10} height={10} />
											{/if}
										{/if}
									</span>
								</th>
							{/each}
							{#if RowActions}<th class="advanced-table__actions-heading">Actions</th>{/if}
						</tr>
					</thead>
					<tbody>
						{#if pageRows.length === 0}
							<tr>
								<td
									class="advanced-table__empty"
									colspan={visibleColumns.length + (selectable ? 1 : 0) + (RowActions ? 1 : 0)}
									>{emptyText}</td
								>
							</tr>
						{:else}
							{#each pageRows as row (row.id)}
								<tr class:advanced-table__row--selected={selectedIds.includes(row.id)}>
									{#if selectable}
										<td class="advanced-table__select-cell">
											<input
												type="checkbox"
												checked={selectedIds.includes(row.id)}
												aria-label="Select row"
												onchange={() => toggleRow(row.id)}
											/>
										</td>
									{/if}
									{#each visibleColumns as column (column.key)}
										<td
											class:advanced-table__align-center={column.align === 'center'}
											class:advanced-table__align-right={column.align === 'right'}
										>
											{#if CustomCell}
												{@render CustomCell(row, column)}
											{:else}
												{String(row[column.key] ?? '')}
											{/if}
										</td>
									{/each}
									{#if RowActions}
										<td class="advanced-table__row-actions">{@render RowActions(row)}</td>
									{/if}
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			<div class="advanced-table__pagination">
				<span>
					{sortedRows.length
						? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedRows.length)}`
						: '0'} of {sortedRows.length.toLocaleString()}
				</span>
				<label>
					Rows
					<select bind:value={pageSize}>
						{#each pageSizeOptions as size (size)}
							<option value={size}>{size}</option>
						{/each}
					</select>
				</label>
				<div class="advanced-table__page-buttons">
					<button
						type="button"
						aria-label="Previous page"
						disabled={currentPage === 1}
						onclick={() => (currentPage -= 1)}><ChevronLeft width={13} height={13} /></button
					>
					<span>{currentPage} / {totalPages}</span>
					<button
						type="button"
						aria-label="Next page"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage += 1)}><ChevronRight width={13} height={13} /></button
					>
				</div>
			</div>
		</div>
	</section>
</div>

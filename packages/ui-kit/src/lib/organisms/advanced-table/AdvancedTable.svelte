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

<style>
	.advanced-table {
		display: flex;
		align-items: stretch;
		min-width: 0;
		color: var(--text-primary);
		font-family: var(--font-sans);
	}
	.advanced-table__filters {
		flex: 0 0 218px;
		border: 1px solid var(--border-primary);
		border-right: 0;
		border-radius: 8px 0 0 8px;
		background: var(--surface-primary);
	}
	.advanced-table--collapsed .advanced-table__filters {
		flex-basis: 46px;
	}
	.advanced-table__filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 43px;
		padding: 0 10px 0 14px;
		border-bottom: 1px solid var(--border-primary);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.advanced-table__icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		padding: 0;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-secondary);
	}
	.advanced-table__group-label {
		display: block;
		margin: 12px 12px 5px;
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
	}
	.advanced-table__group-select {
		width: calc(100% - 24px);
		height: 30px;
		margin: 0 12px 9px;
		padding: 0 8px;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-size: 12px;
	}
	.advanced-table__filter-list {
		padding: 0 8px 10px;
	}
	.advanced-table__filter-item {
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr) auto;
		align-items: center;
		width: 100%;
		min-height: 30px;
		padding: 3px 7px;
		border: 0;
		border-radius: 5px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		text-align: left;
	}
	.advanced-table__filter-item:hover {
		background: var(--surface-secondary);
	}
	.advanced-table__filter-item--active {
		background: var(--color-primary-soft);
		color: var(--color-primary);
		font-weight: 600;
	}
	.advanced-table__file-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 16px;
		border-radius: 3px;
		background: var(--surface-tertiary);
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
	}
	.advanced-table__filter-dot {
		width: 8px;
		height: 8px;
		margin-left: 8px;
		border-radius: 50%;
	}
	.advanced-table__filter-count {
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 10px;
	}
	.advanced-table__main {
		min-width: 0;
		flex: 1;
	}
	.advanced-table__active-filters {
		display: flex;
		align-items: center;
		gap: 5px;
		min-height: 36px;
		padding: 5px 10px;
		overflow-x: auto;
		border: 1px solid var(--border-primary);
		border-bottom: 0;
		border-radius: 0 8px 0 0;
		background: var(--surface-secondary);
	}
	.advanced-table__filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-height: 23px;
		padding: 2px 7px;
		border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
		border-radius: 999px;
		background: var(--color-primary-soft);
		color: var(--color-primary);
		font-size: 10.5px;
		white-space: nowrap;
	}
	.advanced-table__clear {
		margin-left: auto;
		border: 0;
		background: transparent;
		color: var(--text-tertiary);
		font-size: 11px;
	}
	.advanced-table__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-height: 52px;
		padding: 9px 12px;
		border: 1px solid var(--border-primary);
		border-bottom: 0;
		background: var(--surface-primary);
	}
	.advanced-table__active-filters + .advanced-table__toolbar {
		border-top: 0;
	}
	.advanced-table__search {
		position: relative;
		display: flex;
		align-items: center;
		width: min(310px, 100%);
		color: var(--text-tertiary);
	}
	.advanced-table__search > :global(svg) {
		position: absolute;
		left: 10px;
	}
	.advanced-table__search input {
		width: 100%;
		height: 32px;
		padding: 0 10px 0 31px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-size: 12.5px;
	}
	.advanced-table__toolbar-actions {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.advanced-table__toolbar-button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 32px;
		padding: 0 10px;
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		background: var(--surface-primary);
		color: var(--text-secondary);
		font-size: 12.5px;
		white-space: nowrap;
	}
	.advanced-table__result-count {
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: 11px;
		white-space: nowrap;
	}
	.advanced-table__popover-wrap {
		position: relative;
	}
	.advanced-table__popover {
		position: absolute;
		z-index: 30;
		top: calc(100% + 5px);
		right: 0;
		padding: 10px;
		border: 1px solid var(--border-primary);
		border-radius: 7px;
		background: var(--surface-primary);
		box-shadow: var(--shadow-lg);
	}
	.advanced-table__popover > p {
		margin: 0 0 8px;
		color: var(--text-tertiary);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
	}
	.advanced-table__columns-popover {
		width: 280px;
	}
	.advanced-table__column-options {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.advanced-table__column-chip {
		min-height: 26px;
		padding: 3px 9px;
		border: 1px solid var(--border-primary);
		border-radius: 999px;
		background: var(--surface-secondary);
		color: var(--text-secondary);
		font-size: 11px;
	}
	.advanced-table__column-chip--active {
		border-color: var(--color-primary);
		background: var(--color-primary-soft);
		color: var(--color-primary);
	}
	.advanced-table__views-popover {
		width: 230px;
	}
	.advanced-table__view {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 31px;
		padding: 5px 7px;
		border: 0;
		border-radius: 5px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 12px;
		text-align: left;
	}
	.advanced-table__view:hover,
	.advanced-table__view--active {
		background: var(--color-primary-soft);
		color: var(--color-primary);
	}
	.advanced-table__view small {
		margin-left: auto;
		color: var(--text-tertiary);
		font-size: 9px;
		text-transform: uppercase;
	}
	.advanced-table__card {
		overflow: hidden;
		border: 1px solid var(--border-primary);
		border-radius: 0 0 8px 0;
		background: var(--surface-primary);
		box-shadow: var(--shadow-sm);
	}
	.advanced-table__scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}
	th {
		height: 36px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--border-primary);
		background: var(--surface-secondary);
		color: var(--text-tertiary);
		font-size: 10.5px;
		font-weight: 700;
		text-align: left;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}
	th > span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.advanced-table__sortable {
		cursor: pointer;
		user-select: none;
	}
	td {
		padding: 10px 12px;
		border-bottom: 1px solid var(--border-primary);
		color: var(--text-secondary);
		vertical-align: middle;
		white-space: nowrap;
	}
	tbody tr:hover {
		background: var(--surface-secondary);
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	.advanced-table__row--selected {
		background: var(--color-primary-soft);
	}
	.advanced-table__select-cell {
		width: 40px;
		padding-right: 6px !important;
		padding-left: 12px !important;
		text-align: center !important;
	}
	input[type='checkbox'] {
		width: 14px;
		height: 14px;
		accent-color: var(--color-primary);
	}
	.advanced-table__align-center {
		text-align: center !important;
	}
	.advanced-table__align-right,
	.advanced-table__actions-heading,
	.advanced-table__row-actions {
		text-align: right !important;
	}
	.advanced-table__empty {
		height: 120px;
		color: var(--text-tertiary) !important;
		text-align: center;
	}
	.advanced-table__pagination {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 18px;
		min-height: 45px;
		padding: 7px 12px;
		border-top: 1px solid var(--border-primary);
		color: var(--text-tertiary);
		font-size: 11px;
	}
	.advanced-table__pagination label,
	.advanced-table__page-buttons {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.advanced-table__pagination select {
		height: 28px;
		padding: 0 7px;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-secondary);
	}
	.advanced-table__page-buttons button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-secondary);
	}
	.advanced-table__page-buttons button:disabled {
		opacity: 0.4;
	}
	@media (max-width: 800px) {
		.advanced-table {
			flex-direction: column;
		}
		.advanced-table__filters,
		.advanced-table--collapsed .advanced-table__filters {
			flex-basis: auto;
			border-right: 1px solid var(--border-primary);
			border-bottom: 0;
			border-radius: 8px 8px 0 0;
		}
		.advanced-table__filter-list {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.advanced-table__toolbar {
			flex-wrap: wrap;
		}
		.advanced-table__search {
			width: 100%;
		}
	}
</style>

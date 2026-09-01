<script lang="ts">
	import { untrack } from 'svelte';
	import { ESize, type TableColumn } from '@aryagg/types';
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
	import Autocomplete from '../../atoms/autocomplete/Autocomplete.svelte';
	import type { AutocompleteValue } from '../../atoms/autocomplete/types';
	import Button from '../../atoms/button/Button.svelte';
	import InputField from '../../atoms/input-field/InputField.svelte';
	import DataTable from '../data-table/DataTable.svelte';
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
	const groupOptions = $derived(
		filterGroups.map((group) => ({
			label: `Group by: ${group.label}`,
			value: group.key,
			color: group.color,
			icon: group.icon,
			iconClass: group.iconClass
		}))
	);
	const selectedFilterGroups = $derived(
		filterGroups
			.map((group) => ({
				group,
				options: (activeFilters[group.key] ?? [])
					.map((value) => group.options.find((option) => option.value === value))
					.filter((option) => option !== undefined)
			}))
			.filter(({ options }) => options.length > 0)
	);
	const visibleColumns = $derived(
		columns.filter((column) => visibleColumnKeys.includes(column.key))
	);
	const dataTableColumns = $derived<TableColumn[]>([
		...(selectable
			? [{ key: '__selection', label: '', class: 'w-10 py-3 pr-1.5 pl-3 text-center' }]
			: []),
		...visibleColumns.map((column) => ({
			key: column.key,
			label: column.label,
			class:
				column.align === 'center'
					? 'text-center'
					: column.align === 'right'
						? 'text-right'
						: undefined
		}))
	]);
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

	$effect(() => {
		const groups = filterGroups;
		if (!groups.some((group) => group.key === activeGroupKey)) {
			activeGroupKey = groups[0]?.key ?? '';
		}

		const nextFilters: Record<string, string[]> = {};
		let filtersChanged = false;

		for (const group of groups) {
			const currentValues = activeFilters[group.key] ?? [];
			const validValues = currentValues.filter((value) =>
				group.options.some((option) => option.value === value)
			);
			if (validValues.length) nextFilters[group.key] = validValues;
			if (validValues.length !== currentValues.length) filtersChanged = true;
		}

		if (Object.keys(activeFilters).some((key) => !groups.some((group) => group.key === key))) {
			filtersChanged = true;
		}

		if (filtersChanged) activeFilters = nextFilters;
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

	function changeGroup(value: AutocompleteValue) {
		if (typeof value === 'string') activeGroupKey = value;
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

<div class="flex flex-col text-primary md:flex-row {className}">
	{#if filterGroups.length}
		<aside
			class="w-full flex-none overflow-hidden rounded-t-lg border border-border-primary bg-surface-primary transition-all duration-200 md:rounded-t-none md:rounded-l-lg md:border-r-0 {filtersCollapsed
				? 'md:w-[46px]'
				: 'md:w-[218px]'}"
		>
			<div
				class="flex min-h-[43px] items-center justify-between border-b border-border-primary pr-2.5 pl-3.5 text-xs uppercase tracking-[0.06em] {filtersCollapsed
					? 'justify-center px-0'
					: ''}"
			>
				{#if !filtersCollapsed}<strong>{filterTitle}</strong>{/if}
				<Button
					type="button"
					klass="inline-flex size-[26px] items-center justify-center rounded-[5px] border border-border-primary bg-surface-primary p-0 text-secondary"
					variant="ghost"
					aria-label={filtersCollapsed ? 'Expand filters' : 'Collapse filters'}
					onclick={() => (filtersCollapsed = !filtersCollapsed)}
				>
					{#if filtersCollapsed}<ChevronRight width={14} height={14} />{:else}<ChevronLeft
							width={14}
							height={14}
						/>{/if}
				</Button>
			</div>

			{#if !filtersCollapsed}
				<div class="px-2.5 pt-2 pb-[7px]">
					<Autocomplete
						id="advanced-filter-group"
						value={activeGroupKey}
						options={groupOptions}
						placeholder="Choose filter group"
						searchable={false}
						showSearchIcon={false}
						density={ESize.SM}
						class="!h-[28px] !min-h-[28px] !rounded-md !bg-surface-primary !px-2 !py-0.5 !shadow-[0_1px_2px_rgba(15,23,42,0.04)] [&_input]:!h-auto [&_input]:!border-0 [&_input]:!bg-transparent [&_input]:!p-0 [&_input]:!text-[11px] [&_input]:!shadow-none"
						onChange={changeGroup}
					/>
				</div>

				<div class="grid grid-cols-2 px-2 pb-2.5 md:block">
					{#each activeGroup?.options ?? [] as option (option.value)}
						{@const active = (activeFilters[activeGroupKey] ?? []).includes(option.value)}
						<Button
							type="button"
							klass="grid min-h-[30px] w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center rounded-[5px] border-0 bg-transparent px-[7px] py-[3px] text-left text-xs text-secondary hover:bg-surface-secondary {active
								? 'bg-accent/10 font-semibold text-accent'
								: ''}"
							variant="ghost"
							aria-pressed={active}
							onclick={() => toggleFilter(activeGroupKey, option.value)}
						>
							{#if option.badge}
								<span
									class="inline-flex h-4 w-[26px] items-center justify-center rounded-[3px] bg-surface-tertiary font-mono text-[9px] font-bold"
									>{option.badge}</span
								>
							{:else if option.color}
								<span
									class="ml-2 size-2 rounded-full"
									style:background-color={option.color}
								></span>
							{/if}
							<span>{option.label}</span>
							{#if option.count !== undefined}
								<span class="font-mono text-[10px] text-tertiary">{option.count}</span>
							{/if}
						</Button>
					{/each}
				</div>

				{#if selectedFilterGroups.length}
					<div class="border-t border-border-primary bg-surface-secondary px-[9px] pt-2 pb-[9px]">
						<div
							class="mb-[5px] flex min-h-[22px] items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-tertiary"
						>
							<span>Applied filters</span>
							<Button
								type="button"
								klass="min-h-[22px] border-0 bg-transparent px-[3px] py-0 text-[9px] font-bold normal-case tracking-normal text-accent"
								variant="ghost"
								onclick={clearFilters}>Clear all</Button
							>
						</div>
						<div class="grid gap-[5px]">
							{#each selectedFilterGroups as selectedGroup (selectedGroup.group.key)}
								<div
									class="overflow-hidden rounded-[7px] border border-border-primary bg-surface-primary shadow-[0_1px_2px_rgba(15,23,42,0.03)] [border-left:3px_solid_var(--filter-color)]"
									style={`--filter-color: ${selectedGroup.group.color ?? 'var(--semantic-accent)'}`}
								>
									<div
										class="flex min-h-[25px] items-center justify-between border-b border-border-primary px-[7px] py-1 [background:color-mix(in_srgb,var(--filter-color)_8%,var(--surface-primary))]"
									>
										<span
											class="inline-flex items-center gap-[5px] text-[9px] font-bold uppercase tracking-[0.05em] text-secondary"
										>
											<span
												class="size-1.5 rounded-full [background-color:var(--filter-color)]"
											></span>
											{selectedGroup.group.label}
										</span>
										<span
											class="grid h-[17px] min-w-[17px] place-items-center rounded-full font-mono text-[9px] font-bold [background:color-mix(in_srgb,var(--filter-color)_16%,var(--surface-primary))] [color:var(--filter-color)]"
										>
											{selectedGroup.options.length}
										</span>
									</div>
									<div class="flex min-w-0 flex-1 flex-wrap gap-1 p-1.5">
										{#each selectedGroup.options as option (option.value)}
											<Button
												type="button"
												klass="inline-flex min-h-[21px] items-center gap-[5px] rounded-full border py-0.5 pr-1.5 pl-[7px] text-[10px] font-semibold whitespace-nowrap text-secondary [background:color-mix(in_srgb,var(--filter-color)_12%,var(--surface-primary))] [border-color:color-mix(in_srgb,var(--filter-color)_22%,transparent)]"
												variant="ghost"
												onclick={() => toggleFilter(selectedGroup.group.key, option.value)}
											>
												<span>{option.label}</span><X width={10} height={10} />
											</Button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</aside>
	{/if}

	<section class="flex min-w-0 flex-1 flex-col">
		<div
			class="flex min-h-[52px] flex-wrap items-center justify-between gap-2.5 border border-b-0 border-border-primary bg-surface-primary px-3 py-[9px] md:flex-nowrap"
		>
			<div class="relative flex w-full items-center text-tertiary md:w-[310px]">
				<InputField
					type="search"
					bind:value={query}
					placeholder={searchPlaceholder}
					icon={Search}
				/>
			</div>

			<div class="flex flex-wrap items-center gap-[7px]">
				<div class="relative">
					<Button
						type="button"
						klass="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-primary bg-surface-primary px-2.5 text-[12.5px] whitespace-nowrap text-secondary"
						variant="outline"
						aria-expanded={columnsOpen}
						onclick={() => {
							columnsOpen = !columnsOpen;
							viewsOpen = false;
						}}
					>
						<Columns width={14} height={14} /> Columns <ChevronDown width={11} height={11} />
					</Button>
					{#if columnsOpen}
						<div
							class="absolute top-[calc(100%+5px)] right-0 z-30 w-[280px] rounded-[7px] border border-border-primary bg-surface-primary p-2.5 shadow-lg"
						>
							<p class="mb-2 text-[10px] font-bold text-tertiary uppercase">Visible columns</p>
							<div class="flex flex-wrap gap-[5px]">
								{#each columns as column (column.key)}
									<Button
										type="button"
										klass="min-h-[26px] rounded-full border border-border-primary bg-surface-secondary px-[9px] py-[3px] text-[11px] text-secondary {visibleColumnKeys.includes(
											column.key
										)
											? 'border-accent bg-accent/10 text-accent'
											: ''}"
										variant="ghost"
										aria-pressed={visibleColumnKeys.includes(column.key)}
										onclick={() => toggleColumn(column.key)}>{column.label}</Button
									>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				{#if views.length}
					<div class="relative">
						<Button
							type="button"
							klass="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-primary bg-surface-primary px-2.5 text-[12.5px] whitespace-nowrap text-secondary"
							variant="outline"
							aria-expanded={viewsOpen}
							onclick={() => {
								viewsOpen = !viewsOpen;
								columnsOpen = false;
							}}
						>
							View <ChevronDown width={11} height={11} />
						</Button>
						{#if viewsOpen}
							<div
								class="absolute top-[calc(100%+5px)] right-0 z-30 w-[230px] rounded-[7px] border border-border-primary bg-surface-primary p-2.5 shadow-lg"
							>
								<p class="mb-2 text-[10px] font-bold text-tertiary uppercase">Saved views</p>
								{#each views as view (view.id)}
									<Button
										type="button"
										klass="flex min-h-[31px] w-full items-center rounded-[5px] border-0 bg-transparent px-[7px] py-[5px] text-left text-xs text-secondary hover:bg-accent/10 hover:text-accent {activeViewId ===
										view.id
											? 'bg-accent/10 text-accent'
											: ''}"
										variant="ghost"
										onclick={() => applyView(view)}
									>
										<span>{view.name}</span>
										{#if view.default}<small class="ml-auto text-[9px] text-tertiary uppercase"
												>Default</small
											>{/if}
										{#if view.personal}<small class="ml-auto text-[9px] text-tertiary uppercase"
												>Personal</small
											>{/if}
									</Button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				<span class="font-mono text-[11px] whitespace-nowrap text-tertiary"
					>{sortedRows.length.toLocaleString()} items</span
				>
			</div>
		</div>

		<div
			class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-br-lg border border-border-primary bg-surface-primary shadow-sm"
		>
			<div
				class="min-h-0 flex-1 overflow-x-auto [scrollbar-color:var(--text-tertiary)_var(--surface-tertiary)] [scrollbar-width:auto] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-surface-tertiary [&::-webkit-scrollbar-thumb]:bg-tertiary [&::-webkit-scrollbar-thumb:hover]:bg-secondary [&::-webkit-scrollbar-track]:border-t [&::-webkit-scrollbar-track]:border-border-primary [&::-webkit-scrollbar-track]:bg-surface-tertiary"
			>
				<DataTable
					columns={dataTableColumns}
					rows={pageRows}
					{emptyText}
					{pageSize}
					hidePagination
					embedded
					actions={RowActions}
					CustomHeader={AdvancedHeader}
					CustomCell={AdvancedCell}
					rowClass={(row) => (selectedIds.includes(row.id) ? 'bg-accent/10' : '')}
				/>
			</div>

			<div
				class="mt-auto flex min-h-[45px] items-center justify-end gap-[18px] border-t border-border-primary px-3 py-[7px] text-[11px] text-tertiary"
			>
				<span>
					{sortedRows.length
						? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedRows.length)}`
						: '0'} of {sortedRows.length.toLocaleString()}
				</span>
				<label class="flex items-center gap-[7px]">
					Rows
					<select
						bind:value={pageSize}
						class="h-7 rounded-[5px] border border-border-primary bg-surface-primary px-[7px] text-secondary"
					>
						{#each pageSizeOptions as size (size)}
							<option value={size}>{size}</option>
						{/each}
					</select>
				</label>
				<div class="flex items-center gap-[7px]">
					<Button
						type="button"
						klass="size-7 rounded-[5px] border border-border-primary bg-surface-primary p-0 text-secondary disabled:opacity-40"
						variant="ghost"
						aria-label="Previous page"
						disabled={currentPage === 1}
						onclick={() => (currentPage -= 1)}><ChevronLeft width={13} height={13} /></Button
					>
					<span>{currentPage} / {totalPages}</span>
					<Button
						type="button"
						klass="size-7 rounded-[5px] border border-border-primary bg-surface-primary p-0 text-secondary disabled:opacity-40"
						variant="ghost"
						aria-label="Next page"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage += 1)}><ChevronRight width={13} height={13} /></Button
					>
				</div>
			</div>
		</div>
	</section>
</div>

{#snippet AdvancedHeader(column: TableColumn)}
	{#if column.key === '__selection'}
		<input
			type="checkbox"
			checked={pageSelected}
			aria-label="Select all rows on this page"
			onchange={togglePage}
		/>
	{:else}
		{@const advancedColumn = visibleColumns.find((item) => item.key === column.key)}
		{#if advancedColumn}
			<Button
				type="button"
				klass="inline-flex items-center gap-[5px] border-0 bg-transparent p-0 [color:inherit] [font:inherit] [letter-spacing:inherit] [text-transform:inherit] {advancedColumn.sortable
					? 'cursor-pointer select-none'
					: ''}"
				variant="ghost"
				onclick={() => toggleSort(advancedColumn)}
			>
				{advancedColumn.label}
				{#if advancedColumn.sortable}
					{#if sortKey === advancedColumn.key}
						{#if sortDirection === 'asc'}
							<ArrowUp width={11} height={11} />
						{:else}
							<ArrowDown width={11} height={11} />
						{/if}
					{:else}
						<ArrowDownUp width={10} height={10} />
					{/if}
				{/if}
			</Button>
		{/if}
	{/if}
{/snippet}

{#snippet AdvancedCell(row: AdvancedTableRow, column: TableColumn)}
	{#if column.key === '__selection'}
		<input
			type="checkbox"
			checked={selectedIds.includes(row.id)}
			aria-label="Select row"
			onchange={() => toggleRow(row.id)}
		/>
	{:else}
		{@const advancedColumn = visibleColumns.find((item) => item.key === column.key)}
		{#if advancedColumn}
			{#if CustomCell}
				{@render CustomCell(row, advancedColumn)}
			{:else}
				{String(row[advancedColumn.key] ?? '')}
			{/if}
		{/if}
	{/if}
{/snippet}

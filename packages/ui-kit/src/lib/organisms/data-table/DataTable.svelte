<!-- eslint-disable @typescript-eslint/no-unused-vars  -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SortAlphaDown, SortAlphaUp, ArrowDownUp, Search } from 'svelte-bootstrap-icons';
	import type { TableColumn } from '@aryagg/types';
	import { parseInputValue } from '@aryagg/utils';
	import { SkeletonLoader, NoData } from '../../atoms';
	import { Pagination } from '..';

	let {
		columns,
		rows,
		searchable = false,
		searchPlaceholder = 'Search…',
		loading = false,
		pageSize = $bindable(10),
		pageSizeOptions = [10, 25, 50],
		emptyText = 'No data found.',
		hidePagination = false,
		paginationKlass = '',
		actionColKlass = '',
		embedded = false,
		classes = {},
		rowClass,
		onRowClick,
		actions,
		CustomHeader,
		CustomCell,
		topMidSlot
	}: {
		columns: TableColumn[];
		rows: any[];
		searchable?: boolean;
		searchPlaceholder?: string;
		loading?: boolean;
		pageSize?: number;
		pageSizeOptions?: number[];
		emptyText?: string;
		paginationKlass?: string;
		actionColKlass?: string;
		hidePagination?: boolean;
		embedded?: boolean;
		classes?: {
			root?: string;
			toolbar?: string;
			searchWrapper?: string;
			searchIcon?: string;
			searchInput?: string;
			pagination?: string;
			tableWrapper?: string;
			table?: string;
			thead?: string;
			headRow?: string;
			headContent?: string;
			sortIcon?: string;
			columnSearchInput?: string;
			tbody?: string;
			row?: string;
			loadingCell?: string;
			emptyCell?: string;
		};
		rowClass?: (row: any) => string;
		onRowClick?: (row: any) => void;
		actions?: Snippet<[any]>;
		CustomHeader?: Snippet<[TableColumn, number]>;
		CustomCell?: Snippet<[any, TableColumn]>;
		topMidSlot?: Snippet;
	} = $props();

	// ── Sort state ────────────────────────────────────────────────
	let sortColKey = $state<string | null>(null);
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(col: TableColumn) {
		if (sortColKey === col.key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortColKey = col.key;
			sortDir = 'asc';
		}
		currentPage = 1;
	}

	// ── Search ────────────────────────────────────────────────────
	let query = $state('');
	let columnQueries = $state<Record<string, string>>({});

	function setColumnQuery(key: string, value: string) {
		columnQueries[key] = value;
		currentPage = 1;
	}

	// ── Pagination ────────────────────────────────────────────────
	let currentPage = $state(1);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		query;
		currentPage = 1;
	});

	// ── Derived: filter → sort → paginate ─────────────────────────

	const filtered = $derived.by(() => {
		let result = rows;

		if (query.trim()) {
			const q = query.toLowerCase();
			result = result.filter((row) =>
				columns.some((col) =>
					String(row[col.key] ?? '')
						.toLowerCase()
						.includes(q)
				)
			);
		}

		const columnFilters = columns.filter((col) => col.searchable && columnQueries[col.key]?.trim());
		for (const col of columnFilters) {
			const q = columnQueries[col.key].toLowerCase();
			const fields = col.searchKey
				? Array.isArray(col.searchKey)
					? col.searchKey
					: [col.searchKey]
				: [col.key];
			result = result.filter((row) =>
				fields.some((field) =>
					String(row[field] ?? '')
						.toLowerCase()
						.includes(q)
				)
			);
		}

		return result;
	});

	const sortFields = $derived.by(() => {
		if (!sortColKey) return null;
		const col = columns.find((c) => c.key === sortColKey);
		if (!col) return null;
		return col.sortKey ? (Array.isArray(col.sortKey) ? col.sortKey : [col.sortKey]) : [col.key];
	});

	const sorted = $derived.by(() => {
		if (!sortFields) return filtered;
		const fields = sortFields;
		return [...filtered].sort((a, b) => {
			for (const field of fields) {
				const av = String(a[field] ?? '');
				const bv = String(b[field] ?? '');
				const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
				if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp;
			}
			return 0;
		});
	});

	const totalPages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	const paginated = $derived(sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	const visibleColumns = $derived(columns?.filter((c) => !c.hide));
	const hasColumnSearch = $derived(visibleColumns.some((c) => c.searchable));

	const cx = (...parts: (string | undefined | false | null)[]) => parts.filter(Boolean).join(' ');

	function cellValue(col: TableColumn, row: any) {
		return parseInputValue(row[col.key], col.type) ?? '';
	}
</script>

<div class={cx(embedded ? '' : 'flex flex-col gap-3 size-full overflow-auto', classes.root)}>
	<div class={cx('flex justify-between gap-2 items-baseline flex-none', classes.toolbar)}>
		<!-- Search bar -->
		{#if searchable}
			<div class={cx('relative w-full max-w-xs h-fit', classes.searchWrapper)}>
				<span
					class={cx(
						'text-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2',
						classes.searchIcon
					)}
				>
					<Search width={14} height={14} />
				</span>
				<input
					type="search"
					placeholder={searchPlaceholder}
					bind:value={query}
					class={cx(
						'bg-surface-secondary text-primary placeholder:text-tertiary focus:border-accent focus:ring-accent w-full rounded-lg border py-2 pr-4 pl-9 text-sm transition focus:ring-1 focus:outline-none',
						classes.searchInput
					)}
				/>
			</div>
		{/if}

		{#if topMidSlot}
			{@render topMidSlot()}
		{/if}
		<!-- Pagination -->
		{#if !hidePagination}
			<div class={cx('px-2', paginationKlass, classes.pagination)}>
				<Pagination
					bind:currentPage
					bind:pageSize
					{totalPages}
					totalItems={sorted.length}
					{pageSizeOptions}
				/>
			</div>
		{/if}
	</div>

	<!-- Table -->
	<div
		class={cx(
			'w-full overflow-auto',
			embedded ? '' : 'rounded-xl border flex-auto',
			classes.tableWrapper
		)}
	>
		<table class={cx('w-full text-sm', classes.table)}>
			<thead class={classes.thead || undefined}>
				<tr class={cx('bg-surface-secondary text-secondary sticky top-0 z-10', classes.headRow)}>
					{#each visibleColumns as col, ind (ind)}
						<th
							scope="col"
							class={cx(
								'px-4 py-3 text-left text-xs font-semibold whitespace-nowrap uppercase',
								col.class,
								col.sortable && 'hover:text-primary cursor-pointer transition-colors select-none'
							)}
							onclick={() => col.sortable && toggleSort(col)}
						>
							<div class={cx('flex flex-col gap-1', classes.headContent)}>
								<span class="inline-flex items-center gap-1.5">
									{#if CustomHeader}
										{@render CustomHeader(col, ind)}
									{:else}
										{col.label}
										{#if col.sortable}
											{#if sortColKey === col.key}
												{#if sortDir === 'asc'}
													<SortAlphaDown width={13} height={13} class={cx('text-accent', classes.sortIcon)} />
												{:else}
													<SortAlphaUp width={13} height={13} class={cx('text-accent', classes.sortIcon)} />
												{/if}
											{:else}
												<ArrowDownUp width={11} height={11} class={cx('opacity-30', classes.sortIcon)} />
											{/if}
										{/if}
									{/if}
								</span>
								{#if col.searchable}
									<input
										type="search"
										placeholder="Search…"
										value={columnQueries[col.key] ?? ''}
										oninput={(e) =>
											setColumnQuery(col.key, (e.currentTarget as HTMLInputElement).value)}
										onclick={(e) => e.stopPropagation()}
										class={cx(
											'bg-surface-primary text-primary placeholder:text-tertiary focus:border-accent focus:ring-accent w-full rounded-md border px-2 py-1 text-xs font-normal normal-case transition focus:ring-1 focus:outline-none',
											classes.columnSearchInput
										)}
									/>
								{:else if hasColumnSearch}
									<div class="invisible border px-2 py-1 text-xs" aria-hidden="true">&nbsp;</div>
								{/if}
							</div>
						</th>
					{/each}
					{#if actions}
						<th
							scope="col"
							class={cx(
								'px-4 py-3 text-right text-xs font-semibold tracking-wide uppercase',
								actionColKlass
							)}
						>
							<div class="flex flex-col gap-1">
								<span>Actions</span>
								{#if hasColumnSearch}
									<div class="invisible border px-2 py-1 text-xs" aria-hidden="true">&nbsp;</div>
								{/if}
							</div>
						</th>
					{/if}
				</tr>
			</thead>

			<tbody class={cx('divide-border-primary/50 divide-y', classes.tbody)}>
				{#if loading}
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each Array(pageSize) as _, i (i)}
						<tr>
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
							{#each visibleColumns as _c, cInd (cInd)}
								<td class={cx('px-4 py-3', classes.loadingCell)}>
									<SkeletonLoader lines={1} height="0.85rem" />
								</td>
							{/each}
							{#if actions}<td></td>{/if}
						</tr>
					{/each}
				{:else if paginated.length === 0}
					<tr>
						<td colspan={visibleColumns.length + (actions ? 1 : 0)} class={cx('px-4 py-10', classes.emptyCell)}>
							<NoData text={emptyText} />
						</td>
					</tr>
				{:else}
					{#each paginated as row, rowInd (rowInd)}
						<tr
							class={cx(
								'hover:bg-surface-secondary/50 transition-colors',
								onRowClick && 'cursor-pointer',
								rowClass?.(row),
								classes.row
							)}
							onclick={(e) => {
								e?.stopPropagation();
								onRowClick?.(row);
							}}
						>
							{#each visibleColumns as col, colInd (colInd)}
								<td
									class={cx('text-primary/80 text-sm px-4 py-3 whitespace-nowrap', col.class)}
								>
									{#if CustomCell}
										{@render CustomCell(row, col)}
									{:else}
										{cellValue(col, row)}
									{/if}
								</td>
							{/each}
							{#if actions}
								<td class={cx('px-4 py-3 text-right', actionColKlass)}>
									{@render actions(row)}
								</td>
							{/if}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<!-- eslint-disable @typescript-eslint/no-unused-vars  -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SortAlphaDown, SortAlphaUp, ArrowDownUp, Search } from 'svelte-bootstrap-icons';
	import Pagination from '../navigation/Pagination.svelte';
	import NoData from './NoData.svelte';
	import SkeletonLoader from './SkeletonLoader.svelte';
	import type { TableColumn } from '@aryagg/types';
	import { parseInputValue } from '@aryagg/utils';

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
		actions,
		CustomHeader,
		CustomCell,
	}: {
		columns: TableColumn[];
		rows: any[];
		searchable?: boolean;
		searchPlaceholder?: string;
		loading?: boolean;
		pageSize?: number;
		pageSizeOptions?: number[];
		emptyText?: string;
		hidePagination?: boolean;
		actions?: Snippet<[any]>;
		CustomHeader?: Snippet<[TableColumn, number]>;
		CustomCell?: Snippet<[any, TableColumn]>;
	} = $props();

	// ── Sort state ────────────────────────────────────────────────
	let sortKey = $state<string | null>(null);
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
		currentPage = 1;
	}

	// ── Search ────────────────────────────────────────────────────
	let query = $state('');

	// ── Pagination ────────────────────────────────────────────────
	let currentPage = $state(1);

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		query;
		currentPage = 1;
	});

	// ── Derived: filter → sort → paginate ─────────────────────────
	const filtered = $derived.by(() => {
		if (!query.trim()) return rows;
		const q = query.toLowerCase();
		return rows.filter((row) =>
			columns.some((col) =>
				String(row[col.key] ?? '')
					.toLowerCase()
					.includes(q),
			),
		);
	});

	const sorted = $derived.by(() => {
		if (!sortKey) return filtered;
		const key = sortKey;
		return [...filtered].sort((a, b) => {
			const av = String(a[key] ?? '');
			const bv = String(b[key] ?? '');
			const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
			return sortDir === 'asc' ? cmp : -cmp;
		});
	});

	const totalPages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	const paginated = $derived(sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function cellValue(col: TableColumn, row: any) {
		return parseInputValue(row[col.key], col.type) ?? '';
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Search bar -->
	{#if searchable}
		<div class="relative w-full max-w-xs">
			<span
				class="text-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
			>
				<Search width={14} height={14} />
			</span>
			<input
				type="search"
				placeholder={searchPlaceholder}
				bind:value={query}
				class="bg-surface-secondary text-primary placeholder:text-tertiary focus:border-accent focus:ring-accent w-full rounded-lg
                       border py-2 pr-4
                       pl-9 text-sm transition focus:ring-1 focus:outline-none"
			/>
		</div>
	{/if}

	<!-- Pagination -->
	{#if !hidePagination}
		<div class="px-2 pt-4">
			<Pagination
				bind:currentPage
				bind:pageSize
				{totalPages}
				totalItems={sorted.length}
				{pageSizeOptions}
			/>
		</div>
	{/if}

	<!-- Table -->
	<div class="w-full overflow-auto rounded-xl border">
		<table class="w-full text-sm">
			<thead>
				<tr class="bg-surface-secondary text-secondary">
					{#each columns as col, ind (ind)}
						<th
							scope="col"
							class="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap uppercase {col.class}
                                   {col.sortable
								? 'hover:text-primary cursor-pointer transition-colors select-none'
								: ''}"
							onclick={() => col.sortable && toggleSort(col.key)}
						>
							<span class="inline-flex items-center gap-1.5">
								{#if CustomHeader}
									{@render CustomHeader(col, ind)}
								{:else}
									{col.label}
									{#if col.sortable}
										{#if sortKey === col.key}
											{#if sortDir === 'asc'}
												<SortAlphaDown
													width={13}
													height={13}
													class="text-accent"
												/>
											{:else}
												<SortAlphaUp
													width={13}
													height={13}
													class="text-accent"
												/>
											{/if}
										{:else}
											<ArrowDownUp
												width={11}
												height={11}
												class="opacity-30"
											/>
										{/if}
									{/if}
								{/if}
							</span>
						</th>
					{/each}
					{#if actions}
						<th
							scope="col"
							class="px-4 py-3 text-right text-xs font-semibold tracking-wide uppercase"
						>
							Actions
						</th>
					{/if}
				</tr>
			</thead>

			<tbody class="divide-border-primary/50 divide-y">
				{#if loading}
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each Array(pageSize) as _, i (i)}
						<tr>
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
							{#each columns as _c, cInd (cInd)}
								<td class="px-4 py-3">
									<SkeletonLoader lines={1} height="0.85rem" />
								</td>
							{/each}
							{#if actions}<td></td>{/if}
						</tr>
					{/each}
				{:else if paginated.length === 0}
					<tr>
						<td colspan={columns.length + (actions ? 1 : 0)} class="px-4 py-10">
							<NoData text={emptyText} />
						</td>
					</tr>
				{:else}
					{#each paginated as row, rowInd (rowInd)}
						<tr class="hover:bg-surface-secondary/50 transition-colors">
							{#each columns as col, colInd (colInd)}
								<td class="text-primary/80 text-sm px-4 py-3 whitespace-nowrap {col.class}">
									{#if CustomCell}
										{@render CustomCell(row, col)}
									{:else}
										{cellValue(col, row)}
									{/if}
								</td>
							{/each}
							{#if actions}
								<td class="px-4 py-3 text-right">
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

<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'svelte-bootstrap-icons';
	import type { PaginationProps } from './types';

	let {
		currentPage = $bindable(1),
		totalPages,
		totalItems,
		pageSize = $bindable(10),
		pageSizeOptions = [10, 25, 50, 100],
		variant = 'v3',
		showPageSize = true,
		showGoTo = false,
		showInfo = true,
		siblingCount = 1,
		class: className = '',
		onPageChange,
		onPageSizeChange
	}: PaginationProps = $props();

	let goToValue = $state(String(currentPage));
	const from = $derived(totalItems ? (currentPage - 1) * pageSize + 1 : 0);
	const to = $derived(totalItems ? Math.min(currentPage * pageSize, totalItems) : 0);
	const pages = $derived.by(() => {
		if (totalPages <= siblingCount * 2 + 5) {
			return Array.from({ length: totalPages }, (_, index) => index + 1);
		}
		const included = new Set([1, totalPages]);
		for (let offset = -siblingCount; offset <= siblingCount; offset += 1) {
			const page = currentPage + offset;
			if (page > 1 && page < totalPages) included.add(page);
		}
		const sorted = [...included].sort((a, b) => a - b);
		const result: (number | 'ellipsis')[] = [];
		sorted.forEach((page, index) => {
			if (index && page - sorted[index - 1] > 1) result.push('ellipsis');
			result.push(page);
		});
		return result;
	});

	$effect(() => {
		goToValue = String(currentPage);
	});

	function go(page: number) {
		const next = Math.min(Math.max(page, 1), totalPages);
		if (next === currentPage) return;
		currentPage = next;
		onPageChange?.(next);
	}

	function changeSize(event: Event) {
		pageSize = Number((event.target as HTMLSelectElement).value);
		currentPage = 1;
		onPageSizeChange?.(pageSize);
		onPageChange?.(1);
	}

	function submitGoTo() {
		const page = Number(goToValue);
		if (Number.isInteger(page) && page >= 1 && page <= totalPages) go(page);
		else goToValue = String(currentPage);
	}
</script>

<nav class="ui-pagination ui-pagination--{variant} {className}" aria-label="Pagination">
	{#if showInfo}
		<p class="ui-pagination__info">
			{#if totalItems !== undefined}
				Showing <strong>{from}–{to}</strong> of {totalItems.toLocaleString()}
			{:else}
				Page <strong>{currentPage}</strong> of {totalPages}
			{/if}
		</p>
	{/if}

	<div class="ui-pagination__right">
		{#if showPageSize}
			<label class="ui-pagination__size">
				<span>Rows</span>
				<select value={pageSize} onchange={changeSize}>
					{#each pageSizeOptions as size (size)}<option value={size}>{size}</option>{/each}
				</select>
			</label>
		{/if}

		<div class="ui-pagination__controls">
			<button
				type="button"
				disabled={currentPage <= 1}
				aria-label="Previous page"
				onclick={() => go(currentPage - 1)}
			>
				<ChevronLeft width={13} height={13} />
			</button>
			{#each pages as page, index (`${page}-${index}`)}
				{#if page === 'ellipsis'}
					<span class="ui-pagination__ellipsis">…</span>
				{:else}
					<button
						type="button"
						class:ui-pagination__page--active={page === currentPage}
						aria-current={page === currentPage ? 'page' : undefined}
						aria-label={`Page ${page}`}
						onclick={() => go(page)}>{page}</button
					>
				{/if}
			{/each}
			<button
				type="button"
				disabled={currentPage >= totalPages}
				aria-label="Next page"
				onclick={() => go(currentPage + 1)}
			>
				<ChevronRight width={13} height={13} />
			</button>
		</div>

		{#if showGoTo}
			<label class="ui-pagination__goto">
				<span>Go to</span>
				<input
					type="number"
					min="1"
					max={totalPages}
					bind:value={goToValue}
					onblur={submitGoTo}
					onkeydown={(event) => event.key === 'Enter' && submitGoTo()}
				/>
			</label>
		{/if}
	</div>
</nav>

<style>
	.ui-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		flex-wrap: wrap;
		color: var(--text-secondary);
		font-family: var(--font-body);
	}
	.ui-pagination__info {
		margin: 0;
		color: var(--text-tertiary);
		font-size: 12px;
	}
	.ui-pagination__info strong {
		color: var(--text-secondary);
		font-weight: 600;
	}
	.ui-pagination__right,
	.ui-pagination__controls,
	.ui-pagination__size,
	.ui-pagination__goto {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-pagination__right {
		gap: 14px;
	}
	.ui-pagination__size,
	.ui-pagination__goto {
		color: var(--text-tertiary);
		font-size: 11px;
	}
	.ui-pagination select,
	.ui-pagination input {
		height: 30px;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-size: 11px;
	}
	.ui-pagination select {
		padding: 0 7px;
	}
	.ui-pagination input {
		width: 48px;
		padding: 0 5px;
		text-align: center;
	}
	.ui-pagination__controls {
		gap: 4px;
	}
	.ui-pagination__controls button {
		display: grid;
		min-width: 30px;
		height: 30px;
		place-items: center;
		padding: 0 6px;
		border: 1px solid var(--border-primary);
		border-radius: 5px;
		background: var(--surface-primary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 12.5px;
		font-weight: 600;
		transition: all 0.12s;
	}
	.ui-pagination__controls button:hover:not(:disabled) {
		border-color: var(--semantic-accent, #0891b2);
		color: var(--semantic-accent, #0891b2);
	}
	.ui-pagination__controls .ui-pagination__page--active {
		border-color: var(--semantic-accent, #0891b2);
		background: var(--semantic-accent, #0891b2);
		color: var(--on-accent, #fff);
	}
	.ui-pagination__controls button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
	.ui-pagination__ellipsis {
		padding: 0 2px;
		color: var(--text-tertiary);
		font-size: 12px;
	}
	.ui-pagination--compact .ui-pagination__controls button {
		min-width: 26px;
		height: 26px;
		font-size: 11px;
	}
	@media (max-width: 640px) {
		.ui-pagination__right {
			width: 100%;
			flex-wrap: wrap;
		}
		.ui-pagination__info {
			order: 2;
		}
	}
</style>

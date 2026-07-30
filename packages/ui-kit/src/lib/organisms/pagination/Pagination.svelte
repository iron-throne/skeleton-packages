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
	const controlSize = $derived(
		variant === 'compact'
			? 'h-[26px] min-w-[26px] text-[11px] [--button-height:26px]'
			: 'h-[30px] min-w-[30px] text-xs [--button-height:30px]'
	);
	const controlClass = $derived(
		`grid place-items-center rounded-[5px] border border-border-primary px-1.5 font-semibold transition-all duration-150 [--button-padding-inline:6px] [--button-radius:5px] [--button-hover-color:var(--semantic-accent)] hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 ${controlSize}`
	);
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

<nav
	class="flex w-full flex-wrap items-center justify-between gap-3 font-sans text-secondary {className}"
	aria-label="Pagination"
>
	{#if showInfo}
		<p class="order-2 m-0 text-xs text-tertiary sm:order-none">
			{#if totalItems !== undefined}
				Showing <strong class="font-semibold text-secondary">{from}–{to}</strong> of {totalItems.toLocaleString()}
			{:else}
				Page <strong class="font-semibold text-secondary">{currentPage}</strong> of {totalPages}
			{/if}
		</p>
	{/if}

	<div class="flex w-full flex-wrap items-center gap-3.5 sm:w-auto">
		{#if showPageSize}
			<label class="flex items-center gap-1.5 text-[11px] text-tertiary">
				<span>Rows</span>
				<select
					class="h-[30px]! w-14! appearance-auto! rounded-[5px]! bg-surface-primary! px-2! py-0! text-[11px]! leading-none! text-primary!"
					value={pageSize}
					onchange={changeSize}
				>
					{#each pageSizeOptions as size (size)}<option value={size}>{size}</option>{/each}
				</select>
			</label>
		{/if}

		<div class="flex items-center gap-1">
			<button
				class={controlClass}
				type="button"
				disabled={currentPage <= 1}
				aria-label="Previous page"
				onclick={() => go(currentPage - 1)}
			>
				<ChevronLeft width={13} height={13} />
			</button>

			{#each pages as page, index (`${page}-${index}`)}
				{#if page === 'ellipsis'}
					<span class="px-0.5 text-xs text-tertiary">…</span>
				{:else}
					<button
						class="{controlClass} {page === currentPage
							? 'border-accent [--button-bg:var(--semantic-accent)] [--button-color:var(--on-accent)] [--button-border-color:var(--semantic-accent)] [--button-hover-bg:var(--semantic-accent)] [--button-hover-color:var(--on-accent)]'
							: ''}"
						type="button"
						aria-current={page === currentPage ? 'page' : undefined}
						aria-label={`Page ${page}`}
						onclick={() => go(page)}>{page}</button
					>
				{/if}
			{/each}

			<button
				class={controlClass}
				type="button"
				disabled={currentPage >= totalPages}
				aria-label="Next page"
				onclick={() => go(currentPage + 1)}
			>
				<ChevronRight width={13} height={13} />
			</button>
		</div>

		{#if showGoTo}
			<label class="flex items-center gap-1.5 text-[11px] text-tertiary">
				<span>Go to</span>
				<input
					class="h-[30px] w-12 rounded-[5px] border border-border-primary bg-surface-primary px-1 text-center text-[11px] text-primary"
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

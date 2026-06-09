<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'svelte-bootstrap-icons';

	let {
		currentPage = $bindable(),
		totalPages,
		totalItems,
		pageSize = $bindable(),
		pageSizeOptions = [10, 25, 50, 100],
	}: {
		currentPage: number;
		totalPages: number;
		totalItems?: number;
		pageSize?: number;
		pageSizeOptions?: number[];
	} = $props();

	// Calculate "from" index (e.g., 21–40)
	let from = $derived(
		totalItems != null && pageSize != null ? (currentPage - 1) * pageSize + 1 : null,
	);

	// Calculate "to" index (e.g., 21–40)
	let to = $derived(
		totalItems != null && pageSize != null
			? Math.min(currentPage * pageSize, totalItems)
			: null,
	);

	// Build page number list with ellipsis (1 … 4 5 6 … 20)
	const pageNumbers = $derived(
		(() => {
			// If few pages, show all
			if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

			// Pages near current + first + last
			const near = new Set(
				[1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(
					(n) => n >= 1 && n <= totalPages,
				),
			);

			const sorted = [...near].sort((a, b) => a - b);
			const result: (number | '…')[] = [];

			// Insert ellipsis where gaps exist
			for (let i = 0; i < sorted.length; i++) {
				const page = sorted[i]!;
				if (i > 0 && page - sorted[i - 1]! > 1) result.push('…');
				result.push(page);
			}

			return result;
		})(),
	);

	// "Go to page" input value (string for binding)
	let goToValue = $derived(String(currentPage));

	// Keep input synced when currentPage changes externally
	$effect(() => {
		goToValue = String(currentPage);
	});

	// Validate and apply "Go to page"
	function handleGoTo() {
		const n = parseInt(goToValue, 10);

		if (!isNaN(n) && n >= 1 && n <= totalPages) {
			currentPage = n;
		} else {
			// Reset if invalid
			goToValue = String(currentPage);
		}
	}

	// Change page size and reset to page 1
	function handlePageSizeChange(e: Event) {
		const newSize = parseInt((e.target as HTMLSelectElement).value, 10);
		pageSize = newSize;
		currentPage = 1;
	}
</script>

<!-- {#if totalPages > 1} -->
<div class="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-4">
	<!-- Per-page selector -->
	{#if pageSize != null}
		<div class="flex items-center gap-1.5">
			<span class="text-secondary text-[11px]">Rows</span>
			<select
				bind:value={pageSize}
				onchange={handlePageSizeChange}
				class="h-6 w-12 rounded-md px-1.5 py-0.5 text-[11px]"
			>
				{#each pageSizeOptions as size, ind (ind)}
					<option value={size}>{size}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Page controls -->
	<div class="flex items-center gap-1">
		<!-- Prev -->
		<button
			onclick={() => (currentPage -= 1)}
			disabled={currentPage === 1}
			aria-label="Previous page"
			class="bg-surface-secondary h-6 rounded-md px-1.5 text-[11px]"
		>
			<ChevronLeft class="h-3 w-3" />
		</button>

		<!-- Page numbers -->
		{#each pageNumbers as p, ind (ind)}
			{#if p === '…'}
				<span class="text-tertiary w-5 text-center text-[11px] leading-none select-none"
					>·</span
				>
			{:else}
				<button
					onclick={() => (currentPage = p)}
					aria-label="Page {p}"
					aria-current={currentPage === p ? 'page' : undefined}
					class="h-6 min-w-4 rounded-md px-1.5 text-[11px] font-semibold transition-all duration-150
              {currentPage === p
						? 'bg-accent/80 text-on-accent shadow-sm'
						: 'text-secondary hover:bg-surface-secondary hover:text-primary'}"
				>
					{p}
				</button>
			{/if}
		{/each}

		<!-- Next -->
		<button
			onclick={() => (currentPage += 1)}
			disabled={currentPage === totalPages}
			aria-label="Next page"
			class="bg-surface-secondary h-6 rounded-md px-1.5 text-[11px]"
		>
			<ChevronRight class="h-3 w-3" />
		</button>
	</div>

	<!-- Go to page -->
	<div class="flex items-center gap-1.5">
		<span class="text-tertiary text-[11px]">Go to</span>
		<input
			type="number"
			min="1"
			max={totalPages}
			placeholder="—"
			bind:value={goToValue}
			onkeydown={(e) => e.key === 'Enter' && handleGoTo()}
			onblur={handleGoTo}
			class="h-6 w-12 rounded-md px-1.5 text-center text-[11px]"
		/>
	</div>

	<!-- Item count -->
	{#if from != null && to != null && totalItems != null}
		<p class="text-tertiary ml-auto hidden text-[11px] sm:block">
			Showing <span class="text-secondary font-medium">{from} – {to}</span> of {totalItems}
		</p>
	{:else}
		<p class="text-tertiary ml-auto hidden text-[11px] sm:block">
			Page <span class="text-secondary font-medium">{currentPage}</span> of {totalPages}
		</p>
	{/if}
</div>
<!-- {/if} -->

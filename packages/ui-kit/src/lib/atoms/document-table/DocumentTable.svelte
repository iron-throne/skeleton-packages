<script lang="ts">
	import { Columns, Funnel, Search } from 'svelte-bootstrap-icons';
	import {
		DOCUMENT_TABLE_COLUMNS,
		DOCUMENT_TABLE_FILE_CLASS,
		DOCUMENT_TABLE_STATUS_CLASS,
		DOCUMENT_TABLE_STATUS_DOT_CLASS,
		DOCUMENT_TABLE_STATUS_LABEL
	} from './constants';
	import type { DocumentTableColumn, DocumentTableRow } from './types';

	let {
		rows = [],
		total = rows.length,
		showToolbar = true,
		searchPlaceholder = 'Search documents...',
		class: klass = ''
	}: {
		rows?: DocumentTableRow[];
		total?: number;
		showToolbar?: boolean;
		searchPlaceholder?: string;
		class?: string;
	} = $props();

	let query = $state('');
	let selectedIds = $state<string[]>([]);

	const filteredRows = $derived.by(() => {
		if (!query.trim()) return rows;
		const value = query.toLowerCase();
		return rows.filter((row) =>
			[row.document, row.discipline, row.workspace, row.code, row.owner, row.status]
				.join(' ')
				.toLowerCase()
				.includes(value)
		);
	});

	const selectedAll = $derived(
		filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id))
	);

	function toggleAll() {
		selectedIds = selectedAll ? [] : filteredRows.map((row) => row.id);
	}

	function toggleRow(id: string) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((selectedId) => selectedId !== id)
			: [...selectedIds, id];
	}

	function formatTotal(value: number) {
		return new Intl.NumberFormat('en-US').format(value);
	}
</script>

<section
	class="overflow-hidden rounded-2xl border border-border-primary bg-surface-primary {klass}"
>
	{#if showToolbar}
		<div class="flex flex-wrap items-center gap-2 border-b border-border-primary px-3 py-3">
			<div class="relative min-w-64 flex-1 md:max-w-md">
				<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
					<Search width={14} height={14} />
				</span>
				<input
					type="search"
					bind:value={query}
					placeholder={searchPlaceholder}
					class="h-8 rounded-md border-border-primary bg-surface-secondary py-1.5 pl-9 pr-3 text-xs"
				/>
			</div>

			<button
				type="button"
				class="h-8! rounded-md! border-border-primary! bg-surface-primary! px-3! py-1.5! text-xs! font-medium! text-primary! hover:bg-surface-secondary!"
			>
				<Funnel width={13} height={13} />
				Filter
			</button>

			<button
				type="button"
				class="h-8! rounded-md! border-border-primary! bg-surface-primary! px-3! py-1.5! text-xs! font-medium! text-primary! hover:bg-surface-secondary!"
			>
				<Columns width={13} height={13} />
				Columns
			</button>

			<div class="ml-auto font-mono text-[10px] text-secondary">
				{filteredRows.length} of {formatTotal(total)}
			</div>
		</div>
	{/if}

	<div class="overflow-auto">
		<table class="w-full border-collapse text-xs">
			<thead>
				<tr class="border-b border-border-primary bg-surface-secondary/60">
					<th class="w-10 px-3 py-2 text-left">
						<input
							type="checkbox"
							checked={selectedAll}
							onchange={toggleAll}
							aria-label="Select all documents"
						/>
					</th>

					{#each DOCUMENT_TABLE_COLUMNS as column}
						<th
							class="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-secondary {column.class}"
						>
							{column.label}
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each filteredRows as row}
					<tr
						class="border-b border-border-primary transition-colors last:border-b-0 hover:bg-surface-secondary/60"
					>
						<td class="px-3 py-3 align-middle">
							<input
								type="checkbox"
								checked={selectedIds.includes(row.id)}
								onchange={() => toggleRow(row.id)}
								aria-label={`Select ${row.document}`}
							/>
						</td>

						{#each DOCUMENT_TABLE_COLUMNS as column}
							<td class="px-3 py-3 align-middle text-primary {column.class}">
								{@render Cell(row, column)}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

{#snippet Cell(row: DocumentTableRow, column: DocumentTableColumn)}
	{#if column.key === 'document'}
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-7 shrink-0 place-items-center rounded text-[10px] font-bold {DOCUMENT_TABLE_FILE_CLASS[
					row.fileType
				]}"
			>
				{row.fileType}
			</span>
			<span class="min-w-0">
				<span class="block truncate text-sm font-semibold text-primary">{row.document}</span>
				<span class="mt-0.5 block truncate text-[10px] text-secondary">
					{row.discipline} - {row.workspace}
				</span>
			</span>
		</div>
	{:else if column.key === 'suit'}
		<span class="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
			{row.suit}
		</span>
	{:else if column.key === 'rev'}
		<span class="font-mono text-[11px] font-semibold text-primary">{row.rev}</span>
	{:else if column.key === 'status'}
		<span
			class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold {DOCUMENT_TABLE_STATUS_CLASS[
				row.status
			]}"
		>
			<span class="size-1.5 rounded-full {DOCUMENT_TABLE_STATUS_DOT_CLASS[row.status]}"></span>
			{DOCUMENT_TABLE_STATUS_LABEL[row.status]}
		</span>
	{:else if column.key === 'size'}
		<span class="font-mono text-[11px] text-primary">{row.size}</span>
	{:else if column.key === 'modified'}
		<span class="font-mono text-[11px] text-primary">{row.modified}</span>
	{:else}
		{row[column.key]}
	{/if}
{/snippet}

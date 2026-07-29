<script lang="ts">
	import Badge from '$lib/atoms/badge/Badge.svelte';
	import DocumentTable from '$lib/atoms/document-table/DocumentTable.svelte';
	import AdvancedTable from '$lib/organisms/advanced-table/AdvancedTable.svelte';
	import type { AdvancedTableColumn, AdvancedTableRow } from '$lib/organisms/advanced-table/types';
	import {
		ADVANCED_TABLE_COLUMNS,
		ADVANCED_TABLE_FILTERS,
		ADVANCED_TABLE_ROWS,
		ADVANCED_TABLE_VIEWS,
		DOCUMENT_ROWS
	} from './constants';

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		'in-review': 'In review',
		'for-approval': 'For approval',
		approved: 'Approved',
		published: 'Published'
	};

	const statusVariant = (status: unknown) => {
		if (status === 'approved') return 'success';
		if (status === 'published') return 'info';
		if (status === 'in-review') return 'warning';
		if (status === 'for-approval') return 'violet';
		return 'default';
	};
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-7xl space-y-6">
		<header class="space-y-2">
			<p class="section-label">Organism</p>
			<h1>Advanced table</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				The V3 document experience as a reusable component: grouped filters, active filter chips,
				saved views, column control, selection, sorting, search, and pagination.
			</p>
		</header>

		{#snippet tableCell(row: AdvancedTableRow, column: AdvancedTableColumn)}
			{#if column.key === 'name'}
				<div class="flex min-w-72 items-center gap-2.5">
					<span
						class="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded bg-surface-tertiary font-mono text-[9px] font-bold text-secondary"
					>
						{String(row.fileType)}
					</span>
					<div class="min-w-0">
						<p class="truncate text-[13px] font-semibold text-primary">{String(row.name)}</p>
						<p class="mt-0.5 truncate font-mono text-[10px] text-tertiary">{String(row.ref)}</p>
					</div>
				</div>
			{:else if column.key === 'status'}
				<Badge
					label={statusLabel[String(row.status)] ?? String(row.status)}
					variant={statusVariant(row.status)}
					size="xs"
					radius="sm"
				/>
			{:else if column.key === 'suit'}
				<Badge label={String(row.suit)} variant="blue" size="xs" radius="sm" />
			{:else if column.key === 'fileType'}
				<span class="font-mono text-[11px] font-bold text-secondary">{String(row.fileType)}</span>
			{:else if column.key === 'rev' || column.key === 'modified' || column.key === 'ref'}
				<span class="font-mono text-[11px] text-secondary">{String(row[column.key])}</span>
			{:else}
				{String(row[column.key] ?? '')}
			{/if}
		{/snippet}

		<AdvancedTable
			rows={ADVANCED_TABLE_ROWS}
			columns={ADVANCED_TABLE_COLUMNS}
			filterGroups={ADVANCED_TABLE_FILTERS}
			views={ADVANCED_TABLE_VIEWS}
			defaultSortKey="modified"
			defaultSortDirection="desc"
			pageSize={5}
			CustomCell={tableCell}
		/>

		<section class="space-y-3 pt-8">
			<div>
				<p class="section-label">Atom</p>
				<h2>Simple document table</h2>
			</div>
			<DocumentTable rows={DOCUMENT_ROWS} total={18420} />
		</section>
	</div>
</main>

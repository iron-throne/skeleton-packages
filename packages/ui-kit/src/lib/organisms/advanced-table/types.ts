import type { Snippet } from 'svelte';

export type AdvancedTableRow = {
	id: string;
	[key: string]: unknown;
};

export type AdvancedTableColumn = {
	key: string;
	label: string;
	sortable?: boolean;
	searchable?: boolean;
	align?: 'left' | 'center' | 'right';
	width?: string;
	compareValue?: (row: AdvancedTableRow) => string | number | Date | null | undefined;
};

export type AdvancedTableFilterOption = {
	value: string;
	label: string;
	count?: number;
	badge?: string;
	color?: string;
};

export type AdvancedTableFilterGroup = {
	key: string;
	label: string;
	options: AdvancedTableFilterOption[];
	getValue?: (row: AdvancedTableRow) => unknown;
};

export type AdvancedTableView = {
	id: string;
	name: string;
	columns: string[];
	default?: boolean;
	personal?: boolean;
};

export type AdvancedTableProps = {
	rows: AdvancedTableRow[];
	columns: AdvancedTableColumn[];
	filterGroups?: AdvancedTableFilterGroup[];
	views?: AdvancedTableView[];
	defaultViewId?: string;
	defaultSortKey?: string;
	defaultSortDirection?: 'asc' | 'desc';
	searchPlaceholder?: string;
	filterTitle?: string;
	emptyText?: string;
	pageSize?: number;
	pageSizeOptions?: number[];
	selectable?: boolean;
	selectedIds?: string[];
	class?: string;
	CustomCell?: Snippet<[AdvancedTableRow, AdvancedTableColumn]>;
	RowActions?: Snippet<[AdvancedTableRow]>;
	onSelectionChange?: (selectedIds: string[]) => void;
	onViewChange?: (view: AdvancedTableView) => void;
};

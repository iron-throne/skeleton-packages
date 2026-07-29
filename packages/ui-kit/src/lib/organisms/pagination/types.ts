export type PaginationVariant = 'v3' | 'compact';
export type PaginationProps = {
	currentPage: number;
	totalPages: number;
	totalItems?: number;
	pageSize?: number;
	pageSizeOptions?: number[];
	variant?: PaginationVariant;
	showPageSize?: boolean;
	showGoTo?: boolean;
	showInfo?: boolean;
	siblingCount?: number;
	class?: string;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
};

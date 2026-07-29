import type { Snippet } from 'svelte';
import type { IconType } from '@aryagg/types';

export type AdvancedFolderHierarchyNode = {
	id: string;
	name: string;
	count?: number;
	color?: string;
	icon?: IconType;
	meta?: string;
	keywords?: string[];
	disabled?: boolean;
	defaultOpen?: boolean;
	children?: AdvancedFolderHierarchyNode[];
};

export type AdvancedFolderHierarchyFilter = {
	id: string;
	label: string;
	/** Show this filter as a chip initially. False keeps it in the "+ New" picker. */
	display?: boolean;
	/** Ordered record fields used to build this saved hierarchy view. */
	groupBy?: string[];
	/** Stop rendering groups after this many levels. */
	levels?: number;
};

export type AdvancedFolderHierarchyGroupField = {
	id: string;
	label: string;
	example?: string;
	key?: string;
	defaultColor?: string;
	valueColors?: Record<string, string>;
	enabled?: boolean;
	locked?: boolean;
};

export type AdvancedFolderHierarchyRecord = {
	id: string;
	name: string;
	code?: string;
	[key: string]: unknown;
};

export type AdvancedFolderHierarchySpaceConfig = {
	name: string;
	groupBy: string[];
	levels: number;
};

export type AdvancedFolderHierarchyProps = {
	title?: string;
	items?: AdvancedFolderHierarchyNode[];
	records?: AdvancedFolderHierarchyRecord[];
	filters?: AdvancedFolderHierarchyFilter[];
	activeFilter?: string;
	initialVisibleFilterIds?: string[];
	maxVisibleFilters?: number;
	groupFields?: AdvancedFolderHierarchyGroupField[];
	selectedId?: string;
	expandedIds?: string[];
	searchPlaceholder?: string;
	primaryActionLabel?: string;
	secondaryActionLabel?: string;
	footerLabel?: string;
	footerCount?: string | number;
	class?: string;
	titleIcon?: IconType;
	HeaderActions?: Snippet;
	onFilterChange?: (activeFilter: string, filter: AdvancedFolderHierarchyFilter) => void;
	onSelect?: (node: AdvancedFolderHierarchyNode) => void;
	onPrimaryAction?: () => void;
	onCreateSpace?: (config: AdvancedFolderHierarchySpaceConfig) => void;
	onSecondaryAction?: () => void;
	onExpandedChange?: (expandedIds: string[]) => void;
	onFooterClick?: () => void;
};

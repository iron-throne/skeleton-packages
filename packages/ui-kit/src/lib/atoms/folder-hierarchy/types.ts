export type FolderHierarchyDensity = 'compact' | 'comfortable';

export type FolderHierarchyVariant = 'default' | 'rail' | 'boxed' | 'document' | 'v3';

export type FolderHierarchyStatus = 'active' | 'review' | 'locked' | 'draft';

export type FolderHierarchyNodeType = 'folder' | 'file';

export type FolderHierarchyNode = {
	id: string;
	name: string;
	type?: FolderHierarchyNodeType;
	meta?: string;
	count?: number;
	status?: FolderHierarchyStatus;
	disabled?: boolean;
	icon?: import('@aryagg/types').IconType;
	iconClass?: string;
	children?: FolderHierarchyNode[];
};

export type FolderHierarchyProps = {
	items?: FolderHierarchyNode[];
	title?: string;
	subtitle?: string;
	selectedId?: string;
	expandedIds?: string[];
	checkedIds?: string[];
	defaultExpanded?: boolean;
	density?: FolderHierarchyDensity;
	variant?: FolderHierarchyVariant;
	bordered?: boolean;
	checkboxes?: boolean;
	cascadeSelection?: boolean;
	showIcons?: boolean;
	class?: string;
	onSelect?: (node: FolderHierarchyNode) => void;
	onCheck?: (checkedIds: string[], node: FolderHierarchyNode) => void;
	onExpandedChange?: (expandedIds: string[]) => void;
};

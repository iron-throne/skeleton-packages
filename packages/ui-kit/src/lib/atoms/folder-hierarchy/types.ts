export type FolderHierarchyDensity = 'compact' | 'comfortable';

export type FolderHierarchyVariant = 'default' | 'rail' | 'boxed' | 'document';

export type FolderHierarchyStatus = 'active' | 'review' | 'locked' | 'draft';

export type FolderHierarchyNodeType = 'folder' | 'file';

export type FolderHierarchyNode = {
	id: string;
	name: string;
	type?: FolderHierarchyNodeType;
	meta?: string;
	count?: number;
	status?: FolderHierarchyStatus;
	children?: FolderHierarchyNode[];
};

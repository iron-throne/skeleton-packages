import type {
	FolderHierarchyDensity,
	FolderHierarchyStatus,
	FolderHierarchyVariant
} from './types';

export const FOLDER_HIERARCHY_VARIANT_CLASS: Record<FolderHierarchyVariant, string> = {
	default: 'rounded-xl border border-border-primary bg-surface-primary shadow-sm',
	rail: 'rounded-xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden',
	boxed: 'rounded-2xl border border-border-primary bg-surface-secondary p-2',
	document: 'rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden'
};

export const FOLDER_HIERARCHY_BORDERLESS_CLASS: Record<FolderHierarchyVariant, string> = {
	default: 'border-transparent shadow-none',
	rail: 'border-transparent shadow-none',
	boxed: 'border-transparent',
	document: 'border-transparent shadow-none'
};

export const FOLDER_HIERARCHY_DENSITY_CLASS: Record<FolderHierarchyDensity, string> = {
	compact: 'min-h-6 px-2 py-0.5 text-xs',
	comfortable: 'min-h-10 px-2.5 py-1.5 text-sm'
};

export const FOLDER_HIERARCHY_STATUS_CLASS: Record<FolderHierarchyStatus, string> = {
	active: 'border-success/20 bg-success/10 text-success',
	review: 'border-info/20 bg-info/10 text-info',
	locked: 'border-error/20 bg-error/10 text-error',
	draft: 'border-warning/30 bg-warning/20 text-primary'
};

export const FOLDER_HIERARCHY_INDENT_SIZE = 18;

export const FOLDER_HIERARCHY_DOCUMENT_INDENT_SIZE = 20;

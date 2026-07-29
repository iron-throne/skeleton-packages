import type {
	DocumentTableColumn,
	DocumentTableFileType,
	DocumentTableStatus
} from './types';

export const DOCUMENT_TABLE_COLUMNS: DocumentTableColumn[] = [
	{ key: 'document', label: 'Document', class: 'min-w-[360px]' },
	{ key: 'code', label: 'Code (ISO 19650)', class: 'min-w-[220px]' },
	{ key: 'type', label: 'Type', class: 'min-w-[120px]' },
	{ key: 'suit', label: 'Suit.', class: 'w-20' },
	{ key: 'rev', label: 'Rev', class: 'w-20' },
	{ key: 'status', label: 'Status', class: 'min-w-[140px]' },
	{ key: 'owner', label: 'Owner', class: 'min-w-[160px]' },
	{ key: 'size', label: 'Size', class: 'w-24 text-right' },
	{ key: 'modified', label: 'Modified', class: 'min-w-[150px]' }
];

export const DOCUMENT_TABLE_STATUS_LABEL: Record<DocumentTableStatus, string> = {
	'in-review': 'In Review',
	approved: 'Approved',
	draft: 'Draft',
	published: 'Published',
	'for-approval': 'For Approval',
	archived: 'Archived'
};

export const DOCUMENT_TABLE_STATUS_CLASS: Record<DocumentTableStatus, string> = {
	'in-review': 'border-warning/30 bg-warning/10 text-warning',
	approved: 'border-success/30 bg-success/10 text-success',
	draft: 'border-border-primary bg-surface-secondary text-tertiary',
	published: 'border-success/30 bg-success/10 text-success',
	'for-approval': 'border-info/30 bg-info/10 text-info',
	archived: 'border-border-primary bg-surface-secondary text-secondary'
};

export const DOCUMENT_TABLE_STATUS_DOT_CLASS: Record<DocumentTableStatus, string> = {
	'in-review': 'bg-warning',
	approved: 'bg-success',
	draft: 'bg-tertiary',
	published: 'bg-success',
	'for-approval': 'bg-info',
	archived: 'bg-secondary'
};

export const DOCUMENT_TABLE_FILE_CLASS: Record<DocumentTableFileType, string> = {
	RVT: 'bg-error text-on-error',
	IFC: 'bg-info text-on-info',
	DWG: 'bg-warning text-on-warning',
	PDF: 'bg-error text-on-error',
	XLS: 'bg-success text-on-success',
	NWD: 'bg-info text-on-info',
	DOC: 'bg-info text-on-info',
	ZIP: 'bg-secondary text-on-secondary-brand'
};

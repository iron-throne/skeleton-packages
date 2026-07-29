export type DocumentTableStatus =
	| 'in-review'
	| 'approved'
	| 'draft'
	| 'published'
	| 'for-approval'
	| 'archived';

export type DocumentTableFileType = 'RVT' | 'IFC' | 'DWG' | 'PDF' | 'XLS' | 'NWD' | 'DOC' | 'ZIP';

export type DocumentTableColumnKey =
	| 'document'
	| 'code'
	| 'type'
	| 'suit'
	| 'rev'
	| 'status'
	| 'owner'
	| 'size'
	| 'modified';

export type DocumentTableColumn = {
	key: DocumentTableColumnKey;
	label: string;
	class?: string;
};

export type DocumentTableRow = {
	id: string;
	document: string;
	discipline: string;
	workspace: string;
	fileType: DocumentTableFileType;
	code: string;
	type: string;
	suit: string;
	rev: string;
	status: DocumentTableStatus;
	owner: string;
	size: string;
	modified: string;
};

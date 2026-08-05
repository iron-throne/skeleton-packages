import type { DocumentTableRow } from '$atoms/document-table/types';
import type {
	AdvancedTableColumn,
	AdvancedTableFilterGroup,
	AdvancedTableRow,
	AdvancedTableView
} from '$organisms/advanced-table/types';

export const DOCUMENT_ROWS: DocumentTableRow[] = [
	{
		id: 'doc-1',
		document: 'Tottenham Court - Concourse Plan L-02',
		discipline: 'ARC',
		workspace: 'WIP',
		fileType: 'RVT',
		code: 'LDN-CRL-TCR-ARC-M3-DR-0142',
		type: 'Drawing',
		suit: 'S2',
		rev: 'P04',
		status: 'in-review',
		owner: 'Sarah Chen',
		size: '12.4 MB',
		modified: '2024-12-18 14:32'
	},
	{
		id: 'doc-2',
		document: 'Structural Federated Model',
		discipline: 'STR',
		workspace: 'Shared',
		fileType: 'IFC',
		code: 'LDN-CRL-TCR-STR-M3-MD-0008',
		type: 'Model',
		suit: 'S3',
		rev: 'P02',
		status: 'approved',
		owner: 'Marcus Weber',
		size: '284 MB',
		modified: '2024-12-18 11:08'
	},
	{
		id: 'doc-3',
		document: 'MEP Risers Coordination - Zone B',
		discipline: 'MEP',
		workspace: 'WIP',
		fileType: 'DWG',
		code: 'LDN-CRL-TCR-MEP-M3-DR-0231',
		type: 'Drawing',
		suit: 'S1',
		rev: 'P01',
		status: 'draft',
		owner: 'Yuki Tanaka',
		size: '8.1 MB',
		modified: '2024-12-18 09:44'
	},
	{
		id: 'doc-4',
		document: 'ISO 19650 - Quarterly Audit Report',
		discipline: 'QA',
		workspace: 'Published',
		fileType: 'PDF',
		code: 'LDN-CRL-TCR-XX-XX-RP-0042',
		type: 'Report',
		suit: 'A1',
		rev: 'C01',
		status: 'published',
		owner: 'Anna Lindqvist',
		size: '2.3 MB',
		modified: '2024-12-17 16:22'
	},
	{
		id: 'doc-5',
		document: 'COBie Asset Register',
		discipline: 'FM',
		workspace: 'Shared',
		fileType: 'XLS',
		code: 'LDN-CRL-TCR-XX-XX-SH-0014',
		type: 'Schedule',
		suit: 'S4',
		rev: 'P03',
		status: 'for-approval',
		owner: 'Linnea Bergstrom',
		size: '4.8 MB',
		modified: '2024-12-17 14:01'
	},
	{
		id: 'doc-6',
		document: 'Civil Coordination Model',
		discipline: 'CIV',
		workspace: 'Shared',
		fileType: 'NWD',
		code: 'LDN-CRL-TCR-CIV-M3-MD-0011',
		type: 'Model',
		suit: 'S3',
		rev: 'P05',
		status: 'approved',
		owner: 'Priya Sharma',
		size: '412 MB',
		modified: '2024-12-17 10:18'
	},
	{
		id: 'doc-7',
		document: 'Architectural Specification Pack',
		discipline: 'ARC',
		workspace: 'Published',
		fileType: 'DOC',
		code: 'LDN-CRL-TCR-ARC-M3-SP-0098',
		type: 'Specification',
		suit: 'A2',
		rev: 'C02',
		status: 'published',
		owner: 'Sarah Chen',
		size: '18.2 MB',
		modified: '2024-12-16 18:50'
	},
	{
		id: 'doc-8',
		document: 'Structural Calculations - Concourse Slab',
		discipline: 'STR',
		workspace: 'WIP',
		fileType: 'PDF',
		code: 'LDN-CRL-TCR-STR-M3-CA-0007',
		type: 'Calculation',
		suit: 'S1',
		rev: 'P02',
		status: 'draft',
		owner: 'Marcus Weber',
		size: '3.1 MB',
		modified: '2024-12-16 12:35'
	}
];

export const ADVANCED_TABLE_ROWS: AdvancedTableRow[] = DOCUMENT_ROWS.map((row) => ({
	...row,
	name: row.document,
	ref: row.code,
	author: row.owner
}));

export const ADVANCED_TABLE_COLUMNS: AdvancedTableColumn[] = [
	{ key: 'name', label: 'Document', sortable: true, width: '320px' },
	{ key: 'ref', label: 'Reference', sortable: true },
	{ key: 'fileType', label: 'File type', sortable: true, align: 'center' },
	{ key: 'suit', label: 'Suitability', sortable: true, align: 'center' },
	{ key: 'rev', label: 'Revision', sortable: true, align: 'center' },
	{ key: 'status', label: 'Status', sortable: true },
	{ key: 'modified', label: 'Modified', sortable: true },
	{ key: 'discipline', label: 'Discipline', sortable: true, align: 'center' },
	{ key: 'author', label: 'Author', sortable: true }
];

const count = (key: keyof DocumentTableRow, value: string) =>
	DOCUMENT_ROWS.filter((row) => String(row[key]) === value).length;

export const ADVANCED_TABLE_FILTERS: AdvancedTableFilterGroup[] = [
	{
		key: 'fileType',
		label: 'File type',
		options: ['RVT', 'IFC', 'DWG', 'PDF', 'XLS', 'NWD', 'DOC'].map((value) => ({
			value,
			label: value,
			badge: value,
			count: count('fileType', value)
		}))
	},
	{
		key: 'status',
		label: 'Status',
		options: [
			{ value: 'draft', label: 'Draft', color: '#64748b', count: count('status', 'draft') },
			{
				value: 'in-review',
				label: 'In review',
				color: '#f59e0b',
				count: count('status', 'in-review')
			},
			{
				value: 'for-approval',
				label: 'For approval',
				color: '#8b5cf6',
				count: count('status', 'for-approval')
			},
			{
				value: 'approved',
				label: 'Approved',
				color: '#10b981',
				count: count('status', 'approved')
			},
			{
				value: 'published',
				label: 'Published',
				color: '#0891b2',
				count: count('status', 'published')
			}
		]
	},
	{
		key: 'discipline',
		label: 'Discipline',
		options: ['ARC', 'STR', 'MEP', 'CIV', 'QA', 'FM'].map((value) => ({
			value,
			label: value,
			count: count('discipline', value)
		}))
	},
	{
		key: 'suit',
		label: 'Suitability',
		options: ['S1', 'S2', 'S3', 'S4', 'A1', 'A2'].map((value) => ({
			value,
			label: value,
			count: count('suit', value)
		}))
	},
	{
		key: 'workspace',
		label: 'Folder',
		options: ['WIP', 'Shared', 'Published'].map((value) => ({
			value,
			label: value,
			count: count('workspace', value)
		}))
	}
];

export const ADVANCED_TABLE_VIEWS: AdvancedTableView[] = [
	{
		id: 'default',
		name: 'Default',
		columns: ['name', 'fileType', 'suit', 'rev', 'status', 'modified'],
		default: true
	},
	{
		id: 'document-control',
		name: 'Document Control',
		columns: ['name', 'ref', 'status', 'rev', 'modified']
	},
	{
		id: 'engineering',
		name: 'Engineering',
		columns: ['name', 'discipline', 'fileType', 'suit', 'rev']
	},
	{
		id: 'approval',
		name: 'Approval',
		columns: ['name', 'status', 'suit', 'rev', 'author']
	},
	{
		id: 'latest',
		name: 'Latest Submissions',
		columns: ['name', 'modified', 'status', 'author'],
		personal: true
	}
];

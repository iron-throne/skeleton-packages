import type { FolderHierarchyNode } from '$atoms/folder-hierarchy/types';
import type {
	AdvancedFolderHierarchyFilter,
	AdvancedFolderHierarchyGroupField,
	AdvancedFolderHierarchyNode,
	AdvancedFolderHierarchyRecord
} from '$organisms/advanced-folder-hierarchy/types';

export const DOCUMENT_TREE: FolderHierarchyNode[] = [
	{
		id: 'project-root',
		name: 'CDE Project Workspace',
		meta: 'ISO 19650 container',
		count: 42,
		children: [
			{
				id: 'wip',
				name: '01 Work In Progress',
				meta: 'Discipline authoring area',
				count: 18,
				status: 'active',
				children: [
					{
						id: 'architecture',
						name: 'Architecture',
						meta: 'Models, drawings, sheets',
						count: 8,
						children: [
							{
								id: 'arc-model',
								name: 'ARC-LDN-CRL-TCR-M3-A-DR-0142_P02.rvt',
								type: 'file',
								meta: 'Updated 12 min ago',
								status: 'review'
							},
							{
								id: 'arc-sheet',
								name: 'GA plans - Level 04.pdf',
								type: 'file',
								meta: '2.4 MB'
							}
						]
					},
					{
						id: 'structure',
						name: 'Structure',
						meta: 'Steel and concrete package',
						count: 5,
						children: [
							{
								id: 'str-model',
								name: 'STR-LDN-CRL-TCR-M3-S-M3-0021.ifc',
								type: 'file',
								meta: 'IFC 4.3'
							}
						]
					}
				]
			},
			{
				id: 'shared',
				name: '02 Shared',
				meta: 'Published for coordination',
				count: 13,
				status: 'review',
				children: [
					{
						id: 'federated',
						name: 'Federated models',
						meta: 'Coordination snapshots',
						count: 4,
						children: [
							{
								id: 'fed-weekly',
								name: 'Federation-week-32.nwd',
								type: 'file',
								meta: 'Clash run attached',
								status: 'active'
							}
						]
					}
				]
			},
			{
				id: 'published',
				name: '03 Published',
				meta: 'Approved deliverables',
				count: 9,
				children: [
					{
						id: 'handover',
						name: 'Handover',
						meta: 'Client issue set',
						count: 3,
						status: 'locked',
						children: [
							{
								id: 'cobie',
								name: 'COBie asset register.xlsx',
								type: 'file',
								meta: 'Ready for review',
								status: 'draft'
							}
						]
					}
				]
			}
		]
	}
];

export const CLASSIFICATION_TREE: FolderHierarchyNode[] = [
	{
		id: 'architectural',
		name: 'Architectural',
		children: [
			{ id: 'concept', name: 'Concept' },
			{ id: 'detailed-design', name: 'Detailed design' }
		]
	},
	{
		id: 'structural',
		name: 'Structural',
		children: [
			{ id: 'steel', name: 'Steel' },
			{ id: 'concrete', name: 'Concrete' }
		]
	},
	{ id: 'mep', name: 'MEP' },
	{ id: 'civil', name: 'Civil / Infrastructure' }
];

export const SPACE_FILTERS: AdvancedFolderHierarchyFilter[] = [
	{
		id: 'space',
		label: 'By Space',
		display: true,
		groupBy: ['space'],
		levels: 1
	},
	{ id: 'status', label: 'By Status', display: true, groupBy: ['status'], levels: 1 },
	{ id: 'stage', label: 'By Stage', display: true, groupBy: ['stage'], levels: 1 },
	{ id: 'file-type', label: 'By File Type', display: true, groupBy: ['file-type'], levels: 1 }
];

export const SPACE_GROUP_FIELDS: AdvancedFolderHierarchyGroupField[] = [
	{
		id: 'space',
		label: 'Space',
		example: 'SP-INFRA, SP-2030...',
		key: 'space',
		defaultColor: '#246da5',
		enabled: true,
		locked: false
	},
	{
		id: 'status',
		label: 'Status',
		example: 'WIP, Shared, Archived...',
		enabled: false,
		valueColors: { WIP: '#246da5', ARCHIVED: '#64748b', PUBLISHED: '#15805e' }
	},
	{
		id: 'stage',
		label: 'Stage',
		example: 'Stage 3, Stage 4...',
		enabled: false,
		defaultColor: '#64748b'
	},
	{
		id: 'file-type',
		label: 'File type',
		example: 'RVT, IFC, PDF...',
		enabled: false,
		valueColors: {
			RVT: '#88473f',
			IFC: '#246da5',
			DWG: '#ad7600',
			PDF: '#c43d4d',
			DOC: '#7252a8'
		}
	}
];

export const SPACE_RECORDS: AdvancedFolderHierarchyRecord[] = [
	{
		id: '1',
		name: 'Royal Manchester Hospital.rvt',
		code: 'MAN-HSP-03',
		space: 'SP-INFRA',
		status: 'WIP',
		stage: 'Stage 4',
		'file-type': 'RVT'
	},
	{
		id: '2',
		name: 'Concourse coordination.dwg',
		code: 'MAN-HSP-04',
		space: 'SP-INFRA',
		status: 'WIP',
		stage: 'Stage 4',
		'file-type': 'DWG'
	},
	{
		id: '3',
		name: 'Archive model.ifc',
		code: 'MAN-HSP-01',
		space: 'SP-INFRA',
		status: 'ARCHIVED',
		stage: 'Stage 3',
		'file-type': 'IFC'
	},
	{
		id: '4',
		name: 'Published report.pdf',
		code: 'MAN-HSP-09',
		space: 'SP-INFRA',
		status: 'PUBLISHED',
		stage: 'Stage 4',
		'file-type': 'PDF'
	},
	{
		id: '5',
		name: 'Station federated model.ifc',
		code: 'SP2-MOD-01',
		space: 'SP-2030',
		status: 'WIP',
		stage: 'Stage 3',
		'file-type': 'IFC'
	},
	{
		id: '6',
		name: 'Station plans.pdf',
		code: 'SP2-DR-02',
		space: 'SP-2030',
		status: 'PUBLISHED',
		stage: 'Stage 4',
		'file-type': 'PDF'
	},
	{
		id: '7',
		name: 'Asset schedule.doc',
		code: 'SP2-SH-03',
		space: 'SP-2030',
		status: 'WIP',
		stage: 'Stage 4',
		'file-type': 'DOC'
	},
	{
		id: '8',
		name: 'Residential model.rvt',
		code: 'SP7-MOD-01',
		space: 'SP-2070',
		status: 'WIP',
		stage: 'Stage 3',
		'file-type': 'RVT'
	},
	{
		id: '9',
		name: 'Vision drawing.dwg',
		code: 'VIS-DR-01',
		space: 'VISION',
		status: 'WIP',
		stage: 'Stage 4',
		'file-type': 'DWG'
	}
];

export const SPACE_TREE: AdvancedFolderHierarchyNode[] = [
	{
		id: 'rvt',
		name: 'RVT',
		count: 2,
		color: '#88473f',
		children: [{ id: 'rvt-wip', name: 'WIP', count: 2, color: '#246da5' }]
	},
	{
		id: 'ifc',
		name: 'IFC',
		count: 2,
		color: '#246da5',
		children: [
			{ id: 'ifc-shared', name: 'Shared', count: 1, color: '#0891b2' },
			{ id: 'ifc-published', name: 'Published', count: 1, color: '#15805e' }
		]
	},
	{
		id: 'dwg',
		name: 'DWG',
		count: 2,
		color: '#ad7600',
		children: [{ id: 'dwg-wip', name: 'WIP', count: 2, color: '#246da5' }]
	},
	{
		id: 'pdf',
		name: 'PDF',
		count: 4,
		color: '#c43d4d',
		children: [
			{ id: 'pdf-review', name: 'For review', count: 3, color: '#ad7600' },
			{ id: 'pdf-approved', name: 'Approved', count: 1, color: '#15805e' }
		]
	},
	{ id: 'doc', name: 'DOC', count: 1, color: '#7252a8' }
];

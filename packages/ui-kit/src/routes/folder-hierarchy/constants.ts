import type { FolderHierarchyNode } from '$lib/atoms/folder-hierarchy/types';

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

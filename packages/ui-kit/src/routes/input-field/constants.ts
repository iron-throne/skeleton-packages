import type { InputFieldOption } from '$atoms/input-field/types';

export const DISCIPLINE_OPTIONS: InputFieldOption[] = [
	{ label: 'Architecture', value: 'architecture' },
	{ label: 'Structure', value: 'structure' },
	{ label: 'MEP', value: 'mep' },
	{ label: 'Civil', value: 'civil' }
];

export const STATUS_OPTIONS: InputFieldOption[] = [
	{ label: 'Draft', value: 'draft' },
	{ label: 'In Review', value: 'review' },
	{ label: 'Approved', value: 'approved' }
];

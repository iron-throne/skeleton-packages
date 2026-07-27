import type { AutocompleteOption } from '$lib/atoms/autocomplete/types';

export const PROJECT_OPTIONS: AutocompleteOption[] = [
	{
		label: 'Crossrail 2 - Tottenham Court Station',
		value: 'crossrail-tcr',
		description: 'London, UK - Stage 4 Technical Design'
	},
	{
		label: 'Dubai Opera District - Tower 2',
		value: 'dubai-opera-t2',
		description: 'Dubai, UAE - Stage 5 Construction'
	},
	{
		label: 'Berlin Data Campus',
		value: 'berlin-data-campus',
		description: 'Berlin, DE - Handover'
	},
	{
		label: 'Manchester Hospital Redevelopment',
		value: 'manchester-hospital',
		description: 'Manchester, UK - Coordination'
	},
	{
		label: 'Sydney Residences',
		value: 'sydney-residences',
		description: 'Sydney, AU - Asset handover'
	},
	{
		label: 'Tokyo Rail Interchange',
		value: 'tokyo-rail',
		description: 'Tokyo, JP - Clash review'
	}
];

export const DISCIPLINE_OPTIONS: AutocompleteOption[] = [
	{ label: 'Architecture', value: 'arc', description: 'ARC authoring and drawings' },
	{ label: 'Structure', value: 'str', description: 'STR models and calculations' },
	{ label: 'MEP', value: 'mep', description: 'Mechanical, electrical, plumbing' },
	{ label: 'Civil', value: 'civ', description: 'Civil infrastructure package' },
	{ label: 'Quality Assurance', value: 'qa', description: 'Audit and compliance documents' },
	{ label: 'Facilities Management', value: 'fm', description: 'COBie and asset data' }
];

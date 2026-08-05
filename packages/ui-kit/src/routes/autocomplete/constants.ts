import type { AutocompleteOption } from '$atoms/autocomplete/types';
import {
	Building,
	Buildings,
	Hospital,
	House,
	TrainFront,
	TrainLightrailFront
} from 'svelte-bootstrap-icons';

export const PROJECT_OPTIONS: AutocompleteOption[] = [
	{
		label: 'Crossrail 2 - Tottenham Court Station',
		value: 'crossrail-tcr',
		icon: TrainFront,
		description: 'London, UK - Stage 4 Technical Design'
	},
	{
		label: 'Dubai Opera District - Tower 2',
		value: 'dubai-opera-t2',
		icon: Building,
		description: 'Dubai, UAE - Stage 5 Construction'
	},
	{
		label: 'Berlin Data Campus',
		value: 'berlin-data-campus',
		icon: Buildings,
		description: 'Berlin, DE - Handover'
	},
	{
		label: 'Manchester Hospital Redevelopment',
		value: 'manchester-hospital',
		icon: Hospital,
		description: 'Manchester, UK - Coordination'
	},
	{
		label: 'Sydney Residences',
		value: 'sydney-residences',
		icon: House,
		description: 'Sydney, AU - Asset handover'
	},
	{
		label: 'Tokyo Rail Interchange',
		value: 'tokyo-rail',
		icon: TrainLightrailFront,
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

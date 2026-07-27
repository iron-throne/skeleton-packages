export type ThemeColorVariable =
	| '--semantic-accent'
	| '--semantic-secondary'
	| '--semantic-success'
	| '--semantic-warning'
	| '--semantic-error'
	| '--semantic-info'
	| '--surface-primary'
	| '--surface-secondary'
	| '--surface-tertiary'
	| '--text-primary'
	| '--text-secondary'
	| '--text-tertiary'
	| '--border-primary';

export type ThemeColorField = {
	label: string;
	description: string;
	variable: ThemeColorVariable;
};

export const THEME_STORAGE_KEY = 'aryagg-ui-theme-colors';

export const DEFAULT_THEME_COLORS: Record<ThemeColorVariable, string> = {
	'--semantic-accent': '#ca0613',
	'--semantic-secondary': '#5e5253',
	'--semantic-success': '#107c10',
	'--semantic-warning': '#f8d22a',
	'--semantic-error': '#d13438',
	'--semantic-info': '#6264a7',
	'--surface-primary': '#ffffff',
	'--surface-secondary': '#fafafa',
	'--surface-tertiary': '#f8f8f8',
	'--text-primary': '#000000',
	'--text-secondary': '#657487',
	'--text-tertiary': '#606060',
	'--border-primary': '#e1dfdd'
};

export const BRAND_COLOR_FIELDS: ThemeColorField[] = [
	{
		label: 'Primary',
		description: 'Main action color used by primary buttons, icons, focus rings, and highlights.',
		variable: '--semantic-accent'
	},
	{
		label: 'Secondary',
		description: 'Secondary action color used by secondary buttons and stronger neutral actions.',
		variable: '--semantic-secondary'
	}
];

export const SEMANTIC_COLOR_FIELDS: ThemeColorField[] = [
	{
		label: 'Success',
		description: 'Confirmation and positive status color.',
		variable: '--semantic-success'
	},
	{
		label: 'Warning',
		description: 'Attention, pending, and caution color.',
		variable: '--semantic-warning'
	},
	{
		label: 'Error',
		description: 'Danger and destructive action color.',
		variable: '--semantic-error'
	},
	{
		label: 'Info',
		description: 'Informational and helper-state color.',
		variable: '--semantic-info'
	}
];

export const SURFACE_COLOR_FIELDS: ThemeColorField[] = [
	{
		label: 'Surface primary',
		description: 'Cards, menus, and raised surfaces.',
		variable: '--surface-primary'
	},
	{
		label: 'Surface secondary',
		description: 'Inputs, muted buttons, and secondary panels.',
		variable: '--surface-secondary'
	},
	{
		label: 'Surface tertiary',
		description: 'Page background and quiet canvas color.',
		variable: '--surface-tertiary'
	},
	{
		label: 'Border',
		description: 'Default border and divider color.',
		variable: '--border-primary'
	}
];

export const TEXT_COLOR_FIELDS: ThemeColorField[] = [
	{
		label: 'Text primary',
		description: 'Headings and important labels.',
		variable: '--text-primary'
	},
	{
		label: 'Text secondary',
		description: 'Body copy and supporting labels.',
		variable: '--text-secondary'
	},
	{
		label: 'Text tertiary',
		description: 'Captions, helper text, and subtle metadata.',
		variable: '--text-tertiary'
	}
];

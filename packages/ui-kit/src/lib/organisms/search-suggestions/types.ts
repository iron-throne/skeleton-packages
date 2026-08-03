import type { IconType } from '@aryagg/types';

export type SearchSuggestionTone = 'accent' | 'success' | 'info' | 'warning' | 'error' | 'neutral';

export type SearchSuggestionItem = {
	id: string;
	title: string;
	description?: string;
	keywords?: string[];
	icon?: IconType;
	badge?: string;
	badgeTone?: SearchSuggestionTone;
	disabled?: boolean;
};

export type SearchSuggestionAction = {
	id: string;
	label: string;
	description?: string;
	icon?: IconType;
	trailingText?: string;
	disabled?: boolean;
};

export type SearchSuggestionsProps = {
	query?: string;
	items?: SearchSuggestionItem[];
	recentItems?: SearchSuggestionItem[];
	quickActions?: SearchSuggestionAction[];
	recentLabel?: string;
	resultsLabel?: string;
	quickActionsLabel?: string;
	emptyLabel?: string;
	viewAllLabel?: string;
	maxResults?: number;
	class?: string;
	onSelect?: (item: SearchSuggestionItem) => void;
	onQuickAction?: (action: SearchSuggestionAction) => void;
	onViewAll?: (query: string) => void;
};

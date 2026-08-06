<script lang="ts">
	import { ArrowRight, Search } from 'svelte-bootstrap-icons';
	import Icon from '../../atoms/icon/Icon.svelte';
	import type {
		SearchSuggestionAction,
		SearchSuggestionItem,
		SearchSuggestionsProps
	} from './types';

	let {
		query = '',
		items = [],
		recentItems = [],
		quickActions = [],
		recentLabel = 'Recent',
		resultsLabel = 'Search results',
		quickActionsLabel = 'Quick navigate',
		emptyLabel = 'No matching results',
		viewAllLabel = 'View all results',
		maxResults = 5,
		class: className = '',
		onSelect,
		onQuickAction,
		onViewAll
	}: SearchSuggestionsProps = $props();

	const normalizedQuery = $derived(query.trim().toLocaleLowerCase());
	const visibleItems = $derived(
		items
			.filter((item) =>
				[item.title, item.description ?? '', ...(item.keywords ?? [])]
					.join(' ')
					.toLocaleLowerCase()
					.includes(normalizedQuery)
			)
			.slice(0, maxResults)
	);

	function select(item: SearchSuggestionItem) {
		if (!item.disabled) onSelect?.(item);
	}

	function chooseAction(action: SearchSuggestionAction) {
		if (!action.disabled) onQuickAction?.(action);
	}
</script>

<div
	class="w-full overflow-hidden rounded-[9px] border border-[var(--border-primary)] bg-[var(--surface-primary)] font-[var(--font-sans)] text-[var(--text-primary)] shadow-[var(--shadow-lg)] {className}"
>
	{#if normalizedQuery}
		<section>
			<h2
				class="m-0 px-3.5 pt-2.5 pb-[5px] text-[10px] font-bold tracking-[0.07em] text-[var(--text-tertiary)] uppercase"
			>
				{resultsLabel}
			</h2>
			{#each visibleItems as item (item.id)}
				<button
					type="button"
					class="flex w-full cursor-pointer items-center !min-h-[47px] !justify-start !gap-2.5 !rounded-none !border-0 !bg-transparent !px-3.5 !py-2 !text-start !text-[var(--text-primary)] !shadow-none [font:inherit] hover:!bg-[var(--surface-secondary)] focus-visible:!bg-[var(--surface-secondary)] focus-visible:outline-none active:!scale-100 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={item.disabled}
					onclick={() => select(item)}
				>
					<span
						class="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[color-mix(in_srgb,var(--semantic-accent)_12%,transparent)] text-[var(--semantic-accent)]"
					>
						<Icon icon={item.icon ?? Search} klass="size-3.5" />
					</span>
					<span class="grid min-w-0 flex-1 justify-items-start gap-0.5 text-start">
						<strong class="truncate text-xs font-semibold">{item.title}</strong>
						{#if item.description}
							<small class="truncate text-[10px] text-[var(--text-tertiary)]">
								{item.description}
							</small>
						{/if}
					</span>
					{#if item.badge}
						<span
							class="ms-auto shrink-0 rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[9px] font-bold text-[var(--text-secondary)] data-[tone=accent]:bg-[color-mix(in_srgb,var(--semantic-accent)_14%,transparent)] data-[tone=accent]:text-[var(--semantic-accent)] data-[tone=error]:bg-[color-mix(in_srgb,var(--semantic-error)_14%,transparent)] data-[tone=error]:text-[var(--semantic-error)] data-[tone=info]:bg-[color-mix(in_srgb,var(--semantic-info)_14%,transparent)] data-[tone=info]:text-[var(--semantic-info)] data-[tone=success]:bg-[color-mix(in_srgb,var(--semantic-success)_14%,transparent)] data-[tone=success]:text-[var(--semantic-success)] data-[tone=warning]:bg-[color-mix(in_srgb,var(--semantic-warning)_14%,transparent)] data-[tone=warning]:text-[var(--semantic-warning)]"
							data-tone={item.badgeTone ?? 'neutral'}
						>
							{item.badge}
						</span>
					{/if}
				</button>
			{:else}
				<p class="m-0 px-3.5 py-[18px] text-center text-xs text-[var(--text-tertiary)]">
					{emptyLabel}
				</p>
			{/each}
		</section>

		{#if onViewAll}
			<button
				type="button"
				class="flex w-full cursor-pointer items-center !min-h-[43px] !justify-between !gap-2.5 !rounded-none !border-0 !border-t !border-[var(--border-primary)] !bg-transparent !px-3.5 !py-2 !text-start text-xs font-bold !text-[var(--semantic-accent)] !shadow-none hover:!bg-[var(--surface-secondary)] focus-visible:!bg-[var(--surface-secondary)] focus-visible:outline-none active:!scale-100"
				onclick={() => onViewAll?.(query.trim())}
			>
				<span>{viewAllLabel}</span>
				<ArrowRight class="rtl:rotate-180" width={13} height={13} />
			</button>
		{/if}
	{:else}
		{#if recentItems.length}
			<section>
				<h2
					class="m-0 px-3.5 pt-2.5 pb-[5px] text-[10px] font-bold tracking-[0.07em] text-[var(--text-tertiary)] uppercase"
				>
					{recentLabel}
				</h2>
				{#each recentItems as item (item.id)}
					<button
						type="button"
						class="flex w-full cursor-pointer items-center !min-h-[47px] !justify-start !gap-2.5 !rounded-none !border-0 !bg-transparent !px-3.5 !py-2 !text-start !text-[var(--text-primary)] !shadow-none [font:inherit] hover:!bg-[var(--surface-secondary)] focus-visible:!bg-[var(--surface-secondary)] focus-visible:outline-none active:!scale-100 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={item.disabled}
						onclick={() => select(item)}
					>
						<span
							class="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[color-mix(in_srgb,var(--semantic-accent)_12%,transparent)] text-[var(--semantic-accent)]"
						>
							<Icon icon={item.icon ?? Search} klass="size-3.5" />
						</span>
						<span class="grid min-w-0 flex-1 justify-items-start gap-0.5 text-start">
							<strong class="truncate text-xs font-semibold">{item.title}</strong>
							{#if item.description}
								<small class="truncate text-[10px] text-[var(--text-tertiary)]">
									{item.description}
								</small>
							{/if}
						</span>
						{#if item.badge}
							<span
								class="ms-auto shrink-0 rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[9px] font-bold text-[var(--text-secondary)] data-[tone=accent]:bg-[color-mix(in_srgb,var(--semantic-accent)_14%,transparent)] data-[tone=accent]:text-[var(--semantic-accent)] data-[tone=error]:bg-[color-mix(in_srgb,var(--semantic-error)_14%,transparent)] data-[tone=error]:text-[var(--semantic-error)] data-[tone=info]:bg-[color-mix(in_srgb,var(--semantic-info)_14%,transparent)] data-[tone=info]:text-[var(--semantic-info)] data-[tone=success]:bg-[color-mix(in_srgb,var(--semantic-success)_14%,transparent)] data-[tone=success]:text-[var(--semantic-success)] data-[tone=warning]:bg-[color-mix(in_srgb,var(--semantic-warning)_14%,transparent)] data-[tone=warning]:text-[var(--semantic-warning)]"
								data-tone={item.badgeTone ?? 'neutral'}
							>
								{item.badge}
							</span>
						{/if}
					</button>
				{/each}
			</section>
		{/if}

		{#if quickActions.length}
			<section class="border-t border-[var(--border-primary)]">
				<h2
					class="m-0 px-3.5 pt-2.5 pb-[5px] text-[10px] font-bold tracking-[0.07em] text-[var(--text-tertiary)] uppercase"
				>
					{quickActionsLabel}
				</h2>
				{#each quickActions as action (action.id)}
					<button
						type="button"
						class="flex w-full cursor-pointer items-center !min-h-[47px] !justify-start !gap-2.5 !rounded-none !border-0 !bg-transparent !px-3.5 !py-2 !text-start !text-[var(--text-primary)] !shadow-none [font:inherit] hover:!bg-[var(--surface-secondary)] focus-visible:!bg-[var(--surface-secondary)] focus-visible:outline-none active:!scale-100 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={action.disabled}
						onclick={() => chooseAction(action)}
					>
						<span
							class="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
						>
							<Icon icon={action.icon ?? Search} klass="size-3.5" />
						</span>
						<span class="grid min-w-0 flex-1 justify-items-start gap-0.5 text-start">
							<strong class="truncate text-xs font-semibold">{action.label}</strong>
							{#if action.description}
								<small class="truncate text-[10px] text-[var(--text-tertiary)]">
									{action.description}
								</small>
							{/if}
						</span>
						{#if action.trailingText}
							<small class="ms-auto text-[10px] text-[var(--text-tertiary)]">
								{action.trailingText}
							</small>
						{/if}
					</button>
				{/each}
			</section>
		{/if}
	{/if}
</div>

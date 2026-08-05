<script lang="ts">
	import { SIZE_CLASS } from '$lib/constants';
	import { ESize } from '@aryagg/types';
	import { isSnippet } from '@aryagg/utils';
	import type { IAccordionData, IAccordionProps } from './types';
	import type { Snippet } from 'svelte';
	import { ChevronDown, ChevronLeft } from 'svelte-bootstrap-icons';
	import Icon from '../../atoms/icon/Icon.svelte';
	import { fade, slide } from 'svelte/transition';

	function initialExpanded(
		list: IAccordionData[] | undefined,
		isMandatory: boolean | undefined,
		forcedId: number | string | undefined
	): (number | string)[] {
		const initial = new Set<number | string>();
		for (const item of list ?? []) {
			if (item.expanded) initial.add(item.id);
		}
		if (isMandatory && initial.size === 0) {
			const idToOpen = forcedId ?? list?.[0]?.id;
			if (idToOpen !== undefined) initial.add(idToOpen);
		}
		return [...initial];
	}

	let {
		id,
		items,
		size = ESize.MD,
		leftIcon = { expandIcon: ChevronLeft, collapseIcon: ChevronDown },
		rightIcon,
		multiple = false,
		collapsible = true,
		mandatory = false,
		mandatoryId,
		disabled = false,
		readonly = false,
		variant = 'default',
		density = 'default',
		parentklass,
		listKlass,
		detailKlass,
		summaryKlass,
		articleKlass,
		disableListClick = false,
		expandedIds = $bindable(initialExpanded(items, mandatory, mandatoryId))
	}: IAccordionProps = $props();


	const densityClass: Record<NonNullable<IAccordionProps['density']>, { summary: string; article: string }> = {
		compact: { summary: 'px-3 py-1.5', article: 'px-3 pb-2' },
		default: { summary: 'px-4 py-3', article: 'px-4 pb-4' },
		comfortable: { summary: 'px-5 py-4', article: 'px-5 pb-5' }
	};

	const isItemOpen = (itemId: number | string) => expandedIds.includes(itemId);

	const toggle = (item: IAccordionData) => {
		if (readonly || disabled || item.disabled || disableListClick) return;

		const isOpen = isItemOpen(item.id);

		if (multiple) {
			if (isOpen) {
				if (mandatory && expandedIds.length === 1) return;
				expandedIds = expandedIds.filter((openId) => openId !== item.id);
			} else {
				expandedIds = [...expandedIds, item.id];
			}
			return;
		}

		if (isOpen) {
			if (mandatory || !collapsible) return;
			expandedIds = [];
		} else {
			expandedIds = [item.id];
		}
	};
</script>

<ul class="{SIZE_CLASS[size]} divide-y divider-border-primary shadow rounded-xl {parentklass}" {id}>
	{#if items?.length}
		{#each items as item (item.id)}
			{@const isExpand = isItemOpen(item.id)}
			{@const isItemDisabled = disabled || item.disabled}
			<li class="border-border-primary {item.klass} {listKlass}">
				<details
					open
					class="group border-border-primary {isItemDisabled ? 'cursor-not-allowed opacity-50' : ''} {detailKlass}"
				>
					<summary
						id="{id}-summary-{item.id}"
						aria-controls="{id}-panel-{item.id}"
						aria-disabled={isItemDisabled}
						aria-expanded={isExpand}
						class="flex items-center gap-3 font-medium marker:content-none border-border-primary transition-colors duration-200 {densityClass[
							density
						].summary} {isItemDisabled ? 'pointer-events-none' : 'hover:cursor-pointer'} {summaryKlass}"
						onclick={(e) => {
							e.preventDefault();
							toggle(item);
						}}
					>
						{#if leftIcon}
							<Icon
								icon={isExpand ? leftIcon.expandIcon : leftIcon.collapseIcon}
								onclick={leftIcon.onclick &&
									((e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										leftIcon.onclick?.(item.id);
									})}
							/>
						{/if}
						<span class="flex-1">{@render Render(item.title)}</span>
						{#if item.subtitle}
							<span class="text-sm opacity-70">{item.subtitle}</span>
						{/if}
						{#if rightIcon}
							<Icon
								icon={isExpand ? rightIcon.expandIcon : rightIcon.collapseIcon}
								onclick={rightIcon.onclick &&
									((e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										rightIcon.onclick?.(item.id);
									})}
							/>
						{/if}
					</summary>

					{#if isExpand}
						<article
							id="{id}-panel-{item.id}"
							aria-labelledby="{id}-summary-{item.id}"
							class=""
							transition:slide={{ duration: 200 }}
						>
							<div class="{densityClass[density].article} {articleKlass}" transition:fade={{ duration: 150 }}>
								{@render Render(item.content)}
							</div>
						</article>
					{/if}
				</details>
			</li>
		{/each}
	{:else}
		<li class="px-4 py-3 text-sm opacity-70">No data to display</li>
	{/if}
</ul>

{#snippet Render(content: string | Snippet)}
	{#if content}
		{#if isSnippet(content)}
			{@render content()}
		{:else}
			{content}
		{/if}
	{/if}
{/snippet}

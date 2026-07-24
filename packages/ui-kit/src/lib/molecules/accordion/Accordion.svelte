<script lang="ts">
	import { SIZE_CLASS } from '$lib/constants';
	import { ESize } from '@aryagg/types';
	import { isSnippet } from '@aryagg/utils';
	import type { IAccordionProps } from './types';
	import { onMount, type Snippet } from 'svelte';
	import { ChevronDown, ChevronLeft } from 'svelte-bootstrap-icons';
	import Icon from '$lib/atoms/icon/Icon.svelte';

	const {
		id,
		items,
		size = ESize.MD,
		leftIcon = { expandIcon: ChevronLeft, collapseIcon: ChevronDown },
		rightIcon,
		multiple,
		mandatory,
		mandatoryId,
		disabled,
		variant,
		density,
		parentklass,
		listKlass,
		detailKlass,
		summaryKlass,
		articleKlass,
		disableListClick
	}: IAccordionProps = $props();

	let expanded = $state<Set<number | string>>(new Set());

	onMount(() => {
		mandatoryOpen();
	});
	const mandatoryOpen = () => {
		if (mandatory) {
			const idToOpen = mandatoryId || items?.[0]?.id;
			if (idToOpen) {
				expanded.add(idToOpen);
			}
		}
	};
	const toggleList = (id: number | string) => {
		if (!multiple) expanded.clear();
		expanded.add(id);
	};
</script>

<ul class="{SIZE_CLASS[size]} mx-auto mt-20 divide-y shadow rounded-xl {parentklass}" {id}>
	{#if items.length}
		{#each items as item, iInd (iInd)}
			{@const isExpand = expanded.has(item.id)}
			{@const { title, subtitle } = item}
			<li class={listKlass} onclick={disableListClick ? '' : toggleList(item.id)}>
				<details
					class="group {isExpand ? 'open' : ''} {disabled
						? 'cursor-not-allowed opacity-50 pointer-events-none'
						: ''} {detailKlass}"
				>
					<summary
						class="flex items-center gap-3 px-4 py-3 font-medium marker:content-none hover:cursor-pointer {summaryKlass}"
					>
						{#if leftIcon || !rightIcon}
							<Icon
								icon={isExpand ? leftIcon.expandIcon : leftIcon.collapseIcon}
								onclick={leftIcon.onclick}
							/>
						{/if}
						<p>
							{@render Render(title)}
						</p>
						{#if subtitle}
							<span>{subtitle}</span>
						{/if}
						{#if rightIcon}
							<Icon
								icon={isExpand ? rightIcon.expandIcon : rightIcon.collapseIcon}
								onclick={rightIcon.onclick}
							/>
						{/if}
					</summary>

					<article class="px-4 pb-4">
						<p>
							{@render Render(item.content)}
						</p>
					</article>
				</details>
			</li>
		{/each}
	{:else}
		No data to display
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

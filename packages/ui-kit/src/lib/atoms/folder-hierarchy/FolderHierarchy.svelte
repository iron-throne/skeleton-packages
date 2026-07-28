<script lang="ts">
	import {
		ChevronDown,
		ChevronRight,
		FileEarmarkText,
		Folder2,
		Folder2Open
	} from 'svelte-bootstrap-icons';
	import { untrack } from 'svelte';
	import {
		FOLDER_HIERARCHY_DENSITY_CLASS,
		FOLDER_HIERARCHY_DOCUMENT_INDENT_SIZE,
		FOLDER_HIERARCHY_INDENT_SIZE,
		FOLDER_HIERARCHY_BORDERLESS_CLASS,
		FOLDER_HIERARCHY_STATUS_CLASS,
		FOLDER_HIERARCHY_VARIANT_CLASS
	} from './constants';
	import type {
		FolderHierarchyDensity,
		FolderHierarchyNode,
		FolderHierarchyVariant
	} from './types';

	let {
		items = [],
		title = '',
		subtitle = '',
		selectedId = '',
		expandedIds = [],
		defaultExpanded = true,
		density = 'comfortable',
		variant = 'rail',
		bordered = true,
		class: klass = '',
		onSelect
	}: {
		items?: FolderHierarchyNode[];
		title?: string;
		subtitle?: string;
		selectedId?: string;
		expandedIds?: string[];
		defaultExpanded?: boolean;
		density?: FolderHierarchyDensity;
		variant?: FolderHierarchyVariant;
		bordered?: boolean;
		class?: string;
		onSelect?: (node: FolderHierarchyNode) => void;
	} = $props();

	let openIds = $state<string[]>(
		untrack(() => (defaultExpanded ? collectFolderIds(items) : expandedIds))
	);

	const rootClass = $derived(
		[
			FOLDER_HIERARCHY_VARIANT_CLASS[variant],
			bordered ? '' : FOLDER_HIERARCHY_BORDERLESS_CLASS[variant],
			klass
		]
			.filter(Boolean)
			.join(' ')
	);

	function collectFolderIds(nodes: FolderHierarchyNode[]): string[] {
		return nodes.flatMap((node) => {
			const children = node.children ?? [];
			return children.length ? [node.id, ...collectFolderIds(children)] : [];
		});
	}

	function hasChildren(node: FolderHierarchyNode) {
		return !!node.children?.length;
	}

	function isFolder(node: FolderHierarchyNode) {
		return node.type !== 'file';
	}

	function isOpen(node: FolderHierarchyNode) {
		return openIds.includes(node.id);
	}

	function toggle(node: FolderHierarchyNode) {
		if (!hasChildren(node)) return;
		openIds = isOpen(node) ? openIds.filter((id) => id !== node.id) : [...openIds, node.id];
	}

	function selectNode(node: FolderHierarchyNode) {
		selectedId = node.id;
		onSelect?.(node);
	}

	const bodyClass = $derived(
		variant === 'boxed' ? 'space-y-1' : variant === 'document' ? 'p-4 pt-3' : 'p-2'
	);
</script>

<div class={rootClass}>
	{#if title || subtitle}
		<div class="border-b border-border-primary px-4 py-3">
			{#if title}
				{#if variant === 'document'}
					<span class="inline-flex bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-on-accent">
						{title}
					</span>
				{:else}
					<h2 class="text-sm font-semibold text-primary">{title}</h2>
				{/if}
			{/if}
			{#if subtitle}
				<p class="mt-1 text-xs text-secondary">{subtitle}</p>
			{/if}
		</div>
	{/if}

	<div class={bodyClass}>
		{#each items as item}
			{@render TreeNode(item, 0)}
		{/each}
	</div>
</div>

{#snippet TreeNode(node: FolderHierarchyNode, depth: number)}
	{@const childItems = node.children ?? []}
	{@const folder = isFolder(node)}
	{@const open = isOpen(node)}
	{@const active = selectedId === node.id}
	{@const documentStyle = variant === 'document'}

	<div>
		<button
			type="button"
			class="group flex w-full items-center gap-2 text-left transition {documentStyle
				? 'border-0! bg-transparent! shadow-none! ring-0! rounded-md! hover:bg-transparent! active:scale-100!'
				: 'rounded-lg hover:border-border-primary hover:bg-surface-secondary'} {FOLDER_HIERARCHY_DENSITY_CLASS[
				documentStyle ? 'compact' : density
			]} {active && !documentStyle ? 'border-accent/30 bg-accent/10 text-primary' : 'text-secondary'}"
			style={`padding-left:${
				(documentStyle ? 0 : 8) +
				depth *
					(documentStyle ? FOLDER_HIERARCHY_DOCUMENT_INDENT_SIZE : FOLDER_HIERARCHY_INDENT_SIZE)
			}px`}
			onclick={() => {
				selectNode(node);
				if (folder) toggle(node);
			}}
			aria-expanded={folder && hasChildren(node) ? open : undefined}
		>
			<span class="grid size-4 shrink-0 place-items-center {documentStyle ? 'text-primary' : 'text-tertiary'}">
				{#if folder && hasChildren(node)}
					{#if open}
						<ChevronDown width={12} height={12} />
					{:else}
						<ChevronRight width={12} height={12} />
					{/if}
				{/if}
			</span>

			<span
				class="grid shrink-0 place-items-center {documentStyle
					? 'size-4 text-success'
					: `size-7 rounded-md ${folder ? 'bg-accent/10 text-accent' : 'bg-surface-tertiary text-tertiary'}`}"
			>
				{#if folder}
					{#if open}
						<Folder2Open width={documentStyle ? 13 : 15} height={documentStyle ? 13 : 15} />
					{:else}
						<Folder2 width={documentStyle ? 13 : 15} height={documentStyle ? 13 : 15} />
					{/if}
				{:else}
					<FileEarmarkText width={documentStyle ? 12 : 15} height={documentStyle ? 12 : 15} />
				{/if}
			</span>

			<span class="min-w-0 flex-1 {documentStyle ? 'leading-5' : ''}">
				<span class="block truncate {documentStyle && depth > 0 ? 'font-normal text-secondary' : 'font-medium text-primary'}">
					{node.name}
				</span>
				{#if node.meta && !documentStyle}
					<span class="block truncate text-[10px] leading-4 text-tertiary">{node.meta}</span>
				{/if}
			</span>

			{#if node.count !== undefined}
				<span
					class="{documentStyle
						? 'font-mono text-[9px] font-medium text-secondary'
						: 'rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-tertiary'}"
				>
					{node.count}
				</span>
			{/if}

			{#if node.status && !documentStyle}
				<span
					class="rounded-full border px-2 py-0.5 text-[10px] font-semibold {FOLDER_HIERARCHY_STATUS_CLASS[
						node.status
					]}"
				>
					{node.status}
				</span>
			{/if}
		</button>

		{#if folder && open && childItems.length}
			<div class="relative">
				{#each childItems as child}
					{@render TreeNode(child, depth + 1)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

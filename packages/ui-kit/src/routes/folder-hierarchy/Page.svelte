<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import Card from '$atoms/card/Card.svelte';
	import FolderHierarchy from '$atoms/folder-hierarchy/FolderHierarchy.svelte';
	import AdvancedFolderHierarchy from '$organisms/advanced-folder-hierarchy/AdvancedFolderHierarchy.svelte';
	import { FolderPlus, Search } from 'svelte-bootstrap-icons';
	import {
		CLASSIFICATION_TREE,
		DOCUMENT_TREE,
		SPACE_FILTERS,
		SPACE_GROUP_FIELDS,
		SPACE_RECORDS,
		SPACE_TREE
	} from './constants';

	let checkedDisciplines = $state<string[]>(['architectural', 'concept', 'detailed-design']);
	let spaceFilters = $state([...SPACE_FILTERS]);
	let activeSpaceFilter = $state('file-type');
	let expandedSpaces = $state<string[]>(['rvt']);

	function addSavedSpace(config: { name: string; groupBy: string[]; levels: number }) {
		const id = `saved-${Date.now()}`;
		spaceFilters = [
			...spaceFilters,
			{
				id,
				label: config.name,
				display: true,
				groupBy: config.groupBy,
				levels: config.levels
			}
		];
		activeSpaceFilter = id;
	}
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[380px_1fr]">
		<section class="space-y-4">
			<header class="space-y-2">
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
				<h1>Folder hierarchy</h1>
				<p class="text-sm leading-6 text-secondary">
					A navigable tree for CDE folders, documents, metadata, counts, and status states.
				</p>
			</header>

			<div class="flex flex-wrap gap-2">
				<Button label="New folder" icon={FolderPlus} />
				<Button label="Search" icon={Search} variant="outline" />
			</div>
		</section>

		<section class="grid gap-4">
			<div class="max-w-[312px]">
				<AdvancedFolderHierarchy
					items={SPACE_TREE}
					records={SPACE_RECORDS}
					filters={spaceFilters}
					groupFields={SPACE_GROUP_FIELDS}
					bind:activeFilter={activeSpaceFilter}
					bind:expandedIds={expandedSpaces}
					footerCount="47 total"
					onCreateSpace={addSavedSpace}
				/>
			</div>

			<FolderHierarchy
				title="Discipline"
				items={CLASSIFICATION_TREE}
				variant="v3"
				checkboxes
				showIcons={false}
				bind:checkedIds={checkedDisciplines}
			/>

			<FolderHierarchy
				title="Folder hierarchy"
				items={DOCUMENT_TREE}
				variant="document"
				selectedId="architecture"
			/>

			<FolderHierarchy
				title="Documents"
				subtitle="Project folder structure"
				items={DOCUMENT_TREE}
				selectedId="arc-model"
				variant="rail"
			/>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card
					variant="feature"
					title="Without border"
					subtitle="Use bordered={false} when the hierarchy already sits inside another container."
					badge="borderless"
				>
					<FolderHierarchy
						items={DOCUMENT_TREE}
						selectedId="shared"
						density="compact"
						variant="boxed"
						bordered={false}
					/>
				</Card>

				<Card
					variant="insight"
					title="Folder states"
					subtitle="Show workflow status without changing the tree layout."
					badge="status"
				>
					<ul class="space-y-2 text-xs leading-5 text-secondary">
						<li>
							<span class="font-semibold text-success">active</span> marks live working folders.
						</li>
						<li>
							<span class="font-semibold text-info">review</span> marks coordination or approval steps.
						</li>
						<li>
							<span class="font-semibold text-error">locked</span> marks controlled published areas.
						</li>
						<li><span class="font-semibold text-primary">draft</span> marks unissued documents.</li>
					</ul>
				</Card>
			</div>
		</section>
	</div>
</main>

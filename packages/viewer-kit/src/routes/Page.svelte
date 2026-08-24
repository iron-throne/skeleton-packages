<script lang="ts">
	import { ViewerModal, type ViewerSource } from '$lib';

	type ViewerDemo = {
		name: string;
		format: string;
		description: string;
		source: ViewerSource;
		fileName?: string;
		kind: 'pdf' | 'presentation' | 'spreadsheet' | 'bim';
	};

	const availableViewers: ViewerDemo[] = [
		{
			name: 'PDF viewer',
			format: 'PDF',
			description: 'Preview reports, drawings and documents.',
			source: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
			kind: 'pdf'
		},
		{
			name: 'Presentation viewer',
			format: 'PPT · PPTX',
			description: 'Open PowerPoint presentations and slide decks.',
			source:
				'https://raw.githubusercontent.com/microsoft/workshop-template/main/presentation.pptx',
			kind: 'presentation'
		},
		{
			name: 'Excel viewer',
			format: 'XLS · XLSX',
			description: 'Review worksheets, tables and financial data.',
			source:
				'https://download.microsoft.com/download/1/4/E/14EDED28-6C58-4055-A65C-23B4DA81C4DE/Financial%20Sample.xlsx',
			kind: 'spreadsheet'
		},
		{
			name: 'BIM & CAD viewer',
			format: 'DWG · IFC · GLB · GLTF · SVG · PDF',
			description: 'Open CAD drawings, BIM models, and exported drawing PDFs locally.',
			source:
				'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
			fileName: 'sample-building.glb',
			kind: 'bim'
		}
	];

	let selected = $state<ViewerDemo>();
	let open = $state(false);
	let bimFileInput = $state<HTMLInputElement>();

	function preview(viewer: ViewerDemo) {
		if (viewer.kind === 'bim') {
			bimFileInput?.click();
			return;
		}
		selected = viewer;
		open = true;
	}

	function openBimFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		selected = { ...availableViewers[3], source: file, fileName: file.name };
		open = true;
		input.value = '';
	}
</script>

<svelte:head>
	<title>Viewer Kit</title>
</svelte:head>

<main class="min-h-dvh bg-[#f7f8fa] font-sans text-slate-950">
	<input
		bind:this={bimFileInput}
		type="file"
		accept=".dwg,.ifc,.glb,.gltf,.svg,.pdf,application/pdf"
		class="sr-only"
		onchange={openBimFile}
		aria-label="Choose a DWG, IFC, GLB, glTF, SVG, or PDF file"
	/>
	<div class="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
		<section class="max-w-2xl">
			<p class="text-sm font-medium text-blue-600">File preview components</p>
			<h1 class="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
				Choose a viewer
			</h1>
		</section>

		<section class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each availableViewers as viewer (viewer.name)}
				<button
					type="button"
					onclick={() => preview(viewer)}
					class="group flex min-h-52 cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					<div class="flex items-center justify-between">
						<span
							class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-blue-50 group-hover:text-blue-600"
						>
							{#if viewer.kind === 'pdf'}
								<svg
									class="size-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<path d="M7 3.5h6.5L18.5 8v12.5H7z" />
									<path d="M13.5 3.5V8h5M9.5 13h6M9.5 16h4" />
								</svg>
							{:else if viewer.kind === 'presentation'}
								<svg
									class="size-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<rect x="3.5" y="5" width="17" height="12" rx="2" />
									<path d="M8 21h8M12 17v4M8 9h8M8 12h5" />
								</svg>
							{:else if viewer.kind === 'spreadsheet'}
								<svg
									class="size-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<rect x="4" y="4" width="16" height="16" rx="2" />
									<path d="M4 9h16M4 14h16M10 9v11" />
								</svg>
							{:else}
								<svg
									class="size-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								>
									<path d="m4 8 8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8" />
								</svg>
							{/if}
						</span>
					</div>

					<div class="mt-7">
						<!-- <p class="text-xs font-semibold tracking-wide text-slate-400">{viewer.format}</p> -->
						<h2 class="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
							{viewer.name}
						</h2>
						<p class="mt-2 text-sm leading-6 text-slate-500">{viewer.description}</p>
					</div>

					<div class="mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium text-blue-600">
						{viewer.kind === 'bim' ? 'Choose file' : 'Open viewer'}
						<svg
							class="size-4 transition-transform group-hover:translate-x-0.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</div>
				</button>
			{/each}
		</section>
	</div>
</main>

{#if selected}
	<ViewerModal
		bind:open
		source={selected.source}
		fileName={selected.fileName ||
			(selected.kind === 'pdf'
				? 'sample-document.pdf'
				: selected.kind === 'presentation'
					? 'sample-presentation.pptx'
					: selected.kind === 'spreadsheet'
						? 'financial-sample.xlsx'
						: 'sample-building.glb')}
		appTitle={selected.name}
		appSubtitle={`${selected.format} preview`}
		headerClass="border-slate-200 bg-white text-slate-950"
		subtitleClass="text-slate-500"
		accentClass="bg-blue-50 text-blue-600 ring-blue-100"
		primaryActionClass="border-blue-600 bg-blue-600 text-white"
	/>
{/if}

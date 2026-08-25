<script lang="ts">
	import RichTextEditor from '$lib/molecules/rich-text-editor/RichTextEditor.svelte';

	let content = $state(
		'<h2>Project update</h2><p>Use the existing editor toolbar to format this content.</p>'
	);

	function handleChange(element: HTMLElement) {
		content = element.innerHTML;
	}
</script>

<svelte:head>
	<title>Rich Text Editor · UI Kit</title>
</svelte:head>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
			<h1>Rich Text Editor</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				The existing formatted-content editor from the library.
			</p>
		</header>

		<section class="overflow-hidden rounded-xl border border-border-primary bg-surface-primary shadow-sm">
			<div class="flex items-center justify-between border-b border-border-primary px-4 py-3">
				<div>
					<h2 class="text-sm font-semibold">Backend payload</h2>
					<p class="mt-0.5 text-xs text-secondary">Live value returned by the editor.</p>
				</div>
				<span class="rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
					Live
				</span>
			</div>
			<pre
				class="max-h-48 overflow-auto bg-surface-secondary p-4 text-xs leading-5 text-primary"><code>{JSON.stringify(
						{ content },
						null,
						2
					)}</code></pre>
		</section>

		<section class="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
			<RichTextEditor
				uniqRef="rich-text-editor-showcase-"
				value={content}
				onChangeInput={handleChange}
			/>
		</section>
	</div>
</main>

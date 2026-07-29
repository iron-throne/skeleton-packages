<script lang="ts">
	import Button from '$lib/atoms/button/Button.svelte';
	import Card from '$lib/atoms/card/Card.svelte';
	import { ArrowCounterclockwise, Floppy, Palette } from 'svelte-bootstrap-icons';
	import { onMount } from 'svelte';
	import {
		BRAND_COLOR_FIELDS,
		DEFAULT_THEME_COLORS,
		SEMANTIC_COLOR_FIELDS,
		SURFACE_COLOR_FIELDS,
		TEXT_COLOR_FIELDS,
		THEME_STORAGE_KEY,
		type ThemeColorField,
		type ThemeColorVariable
	} from './constants';

	let colors = $state<Record<ThemeColorVariable, string>>({ ...DEFAULT_THEME_COLORS });

	function applyTheme() {
		for (const [name, value] of Object.entries(colors)) {
			document.documentElement.style.setProperty(name, value);
		}
	}

	function saveTheme() {
		localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
		applyTheme();
	}

	function resetTheme() {
		colors = { ...DEFAULT_THEME_COLORS };
		localStorage.removeItem(THEME_STORAGE_KEY);
		applyTheme();
	}

	function loadTheme() {
		const saved = localStorage.getItem(THEME_STORAGE_KEY);
		if (!saved) {
			applyTheme();
			return;
		}

		colors = { ...DEFAULT_THEME_COLORS, ...JSON.parse(saved) };
		applyTheme();
	}

	onMount(loadTheme);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
		<section class="space-y-6">
			<header class="space-y-2">
				<p class="section-label">Theme</p>
				<h1>Color system</h1>
				<p class="max-w-2xl text-sm leading-6 text-secondary">
					Choose the primary, secondary, semantic, surface, and text colors used by the UI kit.
				</p>
			</header>

			{@render ColorGroup('Brand colors', BRAND_COLOR_FIELDS)}
			{@render ColorGroup('Semantic colors', SEMANTIC_COLOR_FIELDS)}
			{@render ColorGroup('Surface colors', SURFACE_COLOR_FIELDS)}
			{@render ColorGroup('Text colors', TEXT_COLOR_FIELDS)}
		</section>

		<aside class="space-y-4 lg:sticky lg:top-6 lg:self-start">
			<Card variant="panel" title="Live preview" icon={Palette} tone="accent">
				<div class="space-y-4">
					<div class="flex flex-wrap gap-2">
						<Button label="Primary" icon={Floppy} />
						<Button label="Secondary" variant="secondary" />
						<Button label="Outline" variant="outline" />
					</div>

					<div class="grid grid-cols-2 gap-2 text-xs">
						<div class="rounded-lg bg-success/10 p-3 text-success">Success</div>
						<div class="rounded-lg bg-warning/10 p-3 text-warning">Warning</div>
						<div class="rounded-lg bg-error/10 p-3 text-error">Error</div>
						<div class="rounded-lg bg-info/10 p-3 text-info">Info</div>
					</div>

					<Card
						variant="metric"
						eyebrow="Theme score"
						value="98"
						trend="up"
						trendLabel="+8 visual consistency"
						tone="accent"
						chartValues={[10, 13, 12, 18, 22, 21, 28, 31]}
					/>
				</div>

				{#snippet footer()}
					<div class="flex flex-wrap gap-2">
						<Button label="Save" icon={Floppy} onClick={saveTheme} />
						<Button
							label="Reset"
							icon={ArrowCounterclockwise}
							variant="outline"
							onClick={resetTheme}
						/>
					</div>
				{/snippet}
			</Card>
		</aside>
	</div>
</main>

{#snippet ColorGroup(title: string, fields: ThemeColorField[])}
	<section class="card space-y-4">
		<h2 class="text-lg">{title}</h2>

		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each fields as field}
				<label class="m-0 block rounded-xl border border-border-primary bg-surface-primary p-3 normal-case tracking-normal">
					<div class="flex items-start gap-3">
						<span
							class="mt-0.5 size-9 shrink-0 rounded-lg border border-border-primary"
							style={`background:${colors[field.variable]}`}
						></span>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-semibold text-primary">{field.label}</span>
							<span class="mt-1 block text-xs leading-5 text-secondary">{field.description}</span>
							<span class="mt-2 block font-mono text-[10px] text-tertiary">{field.variable}</span>
						</span>
						<input
							class="h-9 w-10 shrink-0 cursor-pointer rounded border border-border-primary bg-transparent p-0"
							type="color"
							bind:value={colors[field.variable]}
							oninput={applyTheme}
							aria-label={field.label}
						/>
					</div>
				</label>
			{/each}
		</div>
	</section>
{/snippet}

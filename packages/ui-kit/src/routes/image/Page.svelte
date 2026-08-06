<script lang="ts">
	import Badge from '$atoms/badge/Badge.svelte';
	import Button from '$atoms/button/Button.svelte';
	import Image from '$atoms/image/Image.svelte';
	import { ESize } from '@aryagg/types';
	import { ArrowsFullscreen, Download, StarFill } from 'svelte-bootstrap-icons';
	import { IMAGE_EXAMPLES } from './constants';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Image</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Responsive image surfaces with aspect ratios, fit modes, captions, overlays, loading state,
				and fallback.
			</p>
		</header>

		<section class="max-w-sm space-y-3">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">
				V3 project preview
			</p>
			<Image
				alt="Architectural project preview"
				aspect="project"
				radius="none"
				borderWidth="0"
				showBlueprint
				gradientFrom="#1a3326"
				gradientTo="#0d2318"
				blueprintColor="146 239 202"
			>
				{#snippet topLeft()}
					<Button
						label="Pin project"
						icon={StarFill}
						iconOnly
						radius="full"
						variant="ghost-light"
						style="--button-height:26px"
					/>
				{/snippet}

				{#snippet topRight()}
					<Badge variant="success" appearance="solid" size={ESize.SM} uppercase>Active</Badge>
				{/snippet}
			</Image>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Image
				src={IMAGE_EXAMPLES.project}
				alt="High-rise construction project"
				caption="Project hero with bottom overlay"
				overlay="bottom"
				aspect="video"
			>
				{#snippet actions()}
					<button
						class="!size-8 !rounded-md !border-white/30 !bg-white/10 !p-0 text-white hover:!bg-white/20"
					>
						<ArrowsFullscreen width={14} height={14} />
					</button>
				{/snippet}
			</Image>

			<Image
				src={IMAGE_EXAMPLES.model}
				alt="Construction coordination workspace"
				caption="Contained image fit"
				fit="contain"
				aspect="video"
				radius="xl"
			/>
		</section>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Image
				src={IMAGE_EXAMPLES.detail}
				alt="Building detail"
				caption="Square crop"
				aspect="square"
			/>
			<Image
				src={IMAGE_EXAMPLES.project}
				alt="Tall building facade"
				caption="Portrait"
				aspect="portrait"
			/>
			<Image
				src={IMAGE_EXAMPLES.missing}
				alt="Missing preview"
				caption="Error fallback"
				aspect="square"
			/>
		</section>

		<section class="max-w-sm">
			<Image
				src={IMAGE_EXAMPLES.detail}
				alt="Round avatar-like image"
				caption="Full radius option"
				aspect="square"
				radius="full"
				overlay="full"
			>
				{#snippet actions()}
					<button
						class="!h-8 !rounded-md !border-white/30 !bg-white/10 !px-3 !py-0 text-xs text-white hover:!bg-white/20"
					>
						<Download width={13} height={13} />
						Download
					</button>
				{/snippet}
			</Image>
		</section>
	</div>
</main>

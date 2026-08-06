<script lang="ts">
	import Button from '$atoms/button/Button.svelte';
	import { ESize } from '@aryagg/types';
	import {
		ArrowRight,
		Download,
		Floppy,
		Plus,
		Search,
		Trash,
		ThreeDotsVertical
	} from 'svelte-bootstrap-icons';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Button</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Reusable button styles for actions, toolbars, forms, icon controls, and loading states.
			</p>
		</header>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Variants</p>
				<h2 class="mt-2 text-lg">Action styles</h2>
			</div>
			<div class="flex flex-wrap gap-3">
				here is like V3
				<Button label="Actions" variant="actions" radius="full" icon={ThreeDotsVertical} />
			</div>
			<div class="flex flex-wrap gap-3">
				<Button label="Primary" />
				<Button label="Secondary" variant="secondary" />
				<Button label="Muted" variant="muted" />
				<Button label="Outline" variant="outline" />
				<Button label="Ghost" variant="ghost" />
				<Button label="Success" variant="success" icon={Floppy} />
				<Button label="Danger" variant="danger" icon={Trash} />
				<Button label="Info" variant="info" />
			</div>
		</section>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Border radius</p>
				<h2 class="mt-2 text-lg">Built-in and parent-controlled radius</h2>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<Button label="None" radius="none" />
				<Button label="Small" radius="sm" />
				<Button label="V3 default" radius="md" />
				<Button label="Large" radius="lg" />
				<Button label="Pill" radius="full" />
				<div style="--button-radius: 14px">
					<Button label="Parent: 14px" variant="secondary" />
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div
				class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
			>
				<div>
					<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Sizes</p>
					<h2 class="mt-2 text-lg">Compact to large</h2>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Button label="Small" size={ESize.SM} />
					<Button label="Medium" />
					<Button label="Large" size={ESize.LG} />
					<Button label="Search" icon={Search} iconOnly variant="secondary" />
					<Button label="Download" icon={Download} iconOnly variant="outline" />
				</div>
			</div>

			<div
				class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
			>
				<div>
					<p class="text-xs font-semibold uppercase tracking-wider text-secondary">States</p>
					<h2 class="mt-2 text-lg">Loading and disabled</h2>
				</div>

				<div class="flex flex-wrap gap-3">
					<Button label="Saving" loading />
					<Button label="Disabled" disabled variant="secondary" />
					<Button label="Full width" fullWidth variant="outline" />
				</div>
			</div>
		</section>

		<section
			class="space-y-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Icons</p>
				<h2 class="mt-2 text-lg">Button with icon</h2>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<Button label="Create project" icon={Plus} />
				<Button label="Save changes" icon={Floppy} variant="success" />
				<Button label="Export" icon={Download} variant="secondary" />
				<Button label="Continue" icon={ArrowRight} iconPosition="right" variant="outline" />
				<Button label="Search" icon={Search} iconOnly variant="ghost" />
			</div>
		</section>
	</div>
</main>

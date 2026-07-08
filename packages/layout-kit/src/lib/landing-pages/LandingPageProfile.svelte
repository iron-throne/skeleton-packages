<script lang="ts">
	import type { Component } from 'svelte';
	import { Heart, Download } from 'svelte-bootstrap-icons';

	// svelte-bootstrap-icons ships Svelte 4 class components; double-assert to
	// bridge the incompatible Svelte 5 Component function signature.
	type IconComponent = Component<Record<string, never>>;

	let {
		greeting = 'Hi,',
		role = "I'm Full Stack Developer",
		description = `Lorem ipsum dolor sit, amet consectetur adipisicing elit.
Aut excepturi magnam enim officiis facilis numquam corporis
quos accusantium tempora, dolores quod cum facere architecto
soluta atque corrupti a alias perferendis.`,
		followText = 'Follow',
		resumeText = 'Resume',
		image = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
		imageAlt = 'Profile photo',
		FollowIcon = Heart as unknown as IconComponent,
		ResumeIcon = Download as unknown as IconComponent,
		onFollow = () => {},
		onResume = () => {},
		wrapperCls,
		leftCls,
		headingCls,
		descCls,
		followCls,
		resumeCls,
		imgCls
	}: {
		greeting?: string;
		role?: string;
		description?: string;
		followText?: string;
		resumeText?: string;
		image?: string;
		imageAlt?: string;
		FollowIcon?: IconComponent;
		ResumeIcon?: IconComponent;
		onFollow?: () => void;
		onResume?: () => void;
		wrapperCls?: string;
		leftCls?: string;
		headingCls?: string;
		descCls?: string;
		followCls?: string;
		resumeCls?: string;
		imgCls?: string;
	} = $props();
</script>

<div class="flex h-screen items-center justify-center bg-surface-secondary p-5 {wrapperCls}">
	<div class="grid md:grid-cols-2 grid-cols-1 items-center gap-10 md:px-10">
		<!-- LEFT SIDE -->
		<div class={leftCls}>
			<h1 class="mb-2 text-3xl font-bold {headingCls}">
				<span class="text-accent">{greeting}</span>
				{role}
			</h1>

			<p class="mb-6 {descCls}">{description}</p>

			<div class="flex justify-center space-x-5">
				{#if onFollow}
					<button type="button" class="btn btn-primary w-full {followCls}" onclick={onFollow}>
						{followText}
						<FollowIcon />
					</button>
				{/if}
				{#if onResume}
					<button type="button" class="btn btn-secondary w-full {resumeCls}" onclick={onResume}>
						{resumeText}
						<ResumeIcon />
					</button>
				{/if}
			</div>
		</div>

		<!-- RIGHT SIDE IMAGE -->
		<div>
			{#if image}
				<img
					src={image}
					alt={imageAlt}
					class="md:size-96 size-72 rounded-full object-cover {imgCls}"
				/>
			{/if}
		</div>
	</div>
</div>

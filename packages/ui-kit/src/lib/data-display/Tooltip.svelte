<script lang="ts">
	import type { Snippet } from 'svelte';

	type Position = 'top' | 'bottom' | 'left' | 'right';

	let {
		text,
		position = 'top',
		children,
	}: {
		text: string;
		position?: Position;
		children: Snippet;
	} = $props();

	const positionClasses: Record<Position, string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	};
</script>

<div class="group relative inline-flex">
	{@render children()}
	<div
		role="tooltip"
		class="bg-surface-primary text-content-secondary pointer-events-none absolute z-50
               rounded-md border
               px-2.5 py-1.5 text-xs whitespace-nowrap opacity-0
               shadow-md transition-opacity duration-150 group-hover:opacity-100
               {positionClasses[position]}"
	>
		{text}
	</div>
</div>

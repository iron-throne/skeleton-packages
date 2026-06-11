<script lang="ts">
	import type { Size } from './types';

	let {
		src = '',
		name = '',
		size = 'md',
		status,
		class: klass = ''
	}: {
		src?: string;
		name?: string;
		size?: Size;
		/** Optional presence indicator */
		status?: 'online' | 'offline' | 'away';
		class?: string;
	} = $props();

	const sizeClass: Record<Size, string> = {
		xs: 'w-6  h-6  text-[9px]',
		sm: 'w-8  h-8  text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base',
		xl: 'w-16 h-16 text-xl'
	};

	const statusClass: Record<string, string> = {
		online: 'bg-success',
		offline: 'bg-content-tertiary',
		away: 'bg-warning'
	};

	const dotSize: Record<Size, string> = {
		xs: 'w-1.5 h-1.5 ring-1',
		sm: 'w-2   h-2   ring-1',
		md: 'w-2.5 h-2.5 ring-2',
		lg: 'w-3   h-3   ring-2',
		xl: 'w-3.5 h-3.5 ring-2'
	};

	const initials = $derived(
		name
			.trim()
			.split(/\s+/)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.slice(0, 2)
			.join('')
	);

	let imgError = $state(false);
	const showImage = $derived(!!src && !imgError);
</script>

<span class="relative inline-flex shrink-0 {klass}">
	<span
		class="bg-accent/20 text-accent flex items-center justify-center
               overflow-hidden rounded-full font-semibold select-none
               {sizeClass[size]}"
	>
		{#if showImage}
			<img
				{src}
				alt={name || 'Avatar'}
				class="h-full w-full object-cover"
				onerror={() => (imgError = true)}
			/>
		{:else}
			{initials || '?'}
		{/if}
	</span>

	{#if status}
		<span
			class="ring-surface-primary absolute right-0 bottom-0 rounded-full
                   {dotSize[size]} {statusClass[status]}"
		></span>
	{/if}
</span>

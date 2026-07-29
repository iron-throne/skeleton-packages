<script lang="ts">
	import { ESize } from '@aryagg/types';
	import { initials } from '@aryagg/utils';
	import type { AvatarProps } from './types';

	let {
		src = '',
		name = '',
		size = ESize.MD,
		status,
		klass = '',
		avatarKlass,
		imgKlass,
		dotKlass
	}: AvatarProps = $props();

	const sizeClass: Record<ESize, string> = {
		xs: 'size-6   text-[9px]',
		sm: 'size-8   text-xs',
		md: 'size-10  text-sm',
		lg: 'size-12  text-base',
		xl: 'size-16  text-xl',

		'2xl': 'size-20  text-2xl',
		'3xl': 'size-24  text-3xl',
		'4xl': 'size-28  text-4xl',
		'5xl': 'size-32  text-5xl',
		'6xl': 'size-36  text-6xl',
		'7xl': 'size-40  text-7xl',

		full: 'w-full h-full text-inherit',
		fit: 'w-fit  h-fit  text-inherit',
		min: 'w-min  h-min  text-inherit',
		max: 'w-max  h-max  text-inherit'
	};

	const statusClass: Record<string, string> = {
		online: 'bg-success',
		offline: 'bg-content-tertiary',
		away: 'bg-warning'
	};

	const dotSize: Record<ESize, string> = {
		xs: 'size-1.5 ring-1',
		sm: 'size-2   ring-1',
		md: 'size-2.5 ring-2',
		lg: 'size-3   ring-2',
		xl: 'size-3.5 ring-2',

		'2xl': 'size-4   ring-2',
		'3xl': 'size-5   ring-2',
		'4xl': 'size-6   ring-2',
		'5xl': 'size-7   ring-2',
		'6xl': 'size-8   ring-2',
		'7xl': 'size-9   ring-2',

		full: 'size-full ring-2',
		fit: 'size-fit  ring-2',
		min: 'size-min  ring-2',
		max: 'size-max  ring-2'
	};

	let imgError = $state(false);
	const showImage = $derived(!!src && !imgError);
</script>

<span class="relative inline-flex shrink-0 {klass}">
	<span
		class="bg-accent/20 text-accent flex items-center justify-center
               overflow-hidden rounded-full font-semibold select-none
               {sizeClass[size]} {avatarKlass}"
	>
		{#if showImage}
			<img
				{src}
				alt={name || 'Avatar'}
				class="h-full w-full object-cover {imgKlass}"
				onerror={() => (imgError = true)}
			/>
		{:else}
			{initials(name) || '?'}
		{/if}
	</span>

	{#if status}
		<span
			class="ring-surface-primary absolute right-0 bottom-0 rounded-full
                   {dotSize[size]} {statusClass[status]} {dotKlass}"
		></span>
	{/if}
</span>

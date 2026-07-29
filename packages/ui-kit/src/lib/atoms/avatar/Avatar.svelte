<script lang="ts">
	import { initials } from '@aryagg/utils';
	import { ESize } from '@aryagg/types';
	import type { AvatarProps } from './types';

	let {
		src = '',
		name = '',
		size = ESize.MD,
		status,
		class: klass = '',
		avatarKlass = '',
		imgKlass = '',
		dotKlass = ''
	}: AvatarProps = $props();

	const sizeClass: Partial<Record<ESize, string>> = {
		[ESize.XS]: 'w-6 h-6 text-[9px]',
		[ESize.SM]: 'w-8 h-8 text-xs',
		[ESize.MD]: 'w-10 h-10 text-sm',
		[ESize.LG]: 'w-12 h-12 text-base',
		[ESize.XL]: 'w-16 h-16 text-xl'
	};

	const statusClass: Record<string, string> = {
		online: 'bg-success',
		offline: 'bg-content-tertiary',
		away: 'bg-warning'
	};

	const dotSize: Partial<Record<ESize, string>> = {
		[ESize.XS]: 'w-1.5 h-1.5 ring-1',
		[ESize.SM]: 'w-2 h-2 ring-1',
		[ESize.MD]: 'w-2.5 h-2.5 ring-2',
		[ESize.LG]: 'w-3 h-3 ring-2',
		[ESize.XL]: 'w-3.5 h-3.5 ring-2'
	};

	let imgError = $state(false);
	const showImage = $derived(!!src && !imgError);
</script>

<span class="relative inline-flex shrink-0 {klass}">
	<span
		class="bg-accent/20 text-accent flex items-center justify-center
               overflow-hidden rounded-full font-semibold select-none
               {sizeClass[size] ?? sizeClass[ESize.MD]} {avatarKlass}"
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
                   {dotSize[size] ?? dotSize[ESize.MD]} {statusClass[status]} {dotKlass}"
		></span>
	{/if}
</span>

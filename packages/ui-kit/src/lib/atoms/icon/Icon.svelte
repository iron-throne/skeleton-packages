<script lang="ts">
	import type { IconType } from '@aryagg/types';
	const {
		icon = null,
		klass,
		onclick,
		disabled,
		...rest
	}: {
		icon: IconType | null | undefined;
		klass?: string;
		disabled?: boolean;
		onclick?: ((...e: any) => void) | undefined;
		[key: string]: any;
	} = $props();

	const iconClasses = $derived(
		'size-4 shrink-0 ' +
			(onclick ? 'cursor-pointer' : disabled ? 'cursor-not-allowed opacity-65' : '') +
			klass
	);
</script>

{#if icon}
	{#if typeof icon === 'string'}
		<img src={icon} aria-hidden="true" class={iconClasses} {onclick} {...rest} />
	{:else}
		{@const IconComp = icon}
		<IconComp class={iconClasses} {onclick} {...rest} />
	{/if}
{/if}

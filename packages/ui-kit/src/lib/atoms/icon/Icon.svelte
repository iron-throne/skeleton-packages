<script lang="ts">
    import type { SvelteComponent } from "svelte";	
	const {
		icon = null,
		klass,
		onclick,
		disabled,
		...rest
	}: {
		icon: string | (new (...args:any[]) => SvelteComponent)  | null;
		klass?: string;
		disabled?: boolean;
		onclick?: ((e: MouseEvent) => void) | undefined;
		[key: string]: any;
	} = $props();

	const baseKlass = $derived(
		'size-4 shrink-0 ' +
			(onclick ? 'cursor-pointer' : disabled ? 'cursor-not-allowed opacity-65' : '')
	);
</script>

{#if icon}
	{#if typeof icon === 'string'}
		<img
			src={icon}
			aria-hidden="true"
			class={`${baseKlass} ${klass} `}
			{onclick}
			{...rest}
		/>
	{:else}
		{@const Icon = icon}
		<Icon class={`${baseKlass} ${klass}`} {onclick} {...rest} />
	{/if}
{/if}

<script lang="ts">
	let {
		Icon,
		class: className,
		onclick,
		...rest
	}: {
		/** Raw SVG markup string, or a Svelte icon component (e.g. from svelte-bootstrap-icons) */
		Icon?: string | any;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		[key: string]: any;
	} = $props();
</script>

{#if Icon}
	{#if typeof Icon === 'string'}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<span class={`size-4 shrink-0 ${className}`} {onclick}>{@html Icon}</span>
	{:else}
		<Icon class={`size-4 shrink-0 ${className}`} {onclick} {...rest} />
	{/if}
{/if}

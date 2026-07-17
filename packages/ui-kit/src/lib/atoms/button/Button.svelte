<script lang="ts">
	import { ArrowClockwise } from 'svelte-bootstrap-icons';

	let {
		label,
		klass = '',
		type = 'button',
		loading = false,
		disabled = false,
		icon,
		onClick,
		onKeydown,
		onEnterKeydown,
	}: {
		label: string;
		klass?: string;
		type?: 'button' | 'submit' | 'reset';
		loading?: boolean;
		disabled?: boolean;
		icon?: any;
		onClick?: (e?: MouseEvent) => void | Promise<void>;
		onKeydown?: (e: KeyboardEvent) => void;
		onEnterKeydown?: () => void;
	} = $props();

	function handleClick(e: MouseEvent) {
		if (loading || disabled) return;
		onClick?.(e);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			onEnterKeydown?.();
		} else {
			onKeydown?.(e);
		}
	}
</script>

<button
	{type}
	class="btn btn-primary {klass}"
	disabled={disabled || loading}
	aria-disabled={disabled || loading}
	aria-busy={loading}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if icon}
		{@const Icon = icon}
		<Icon width="16" height="16" />
	{/if}
	{#if loading}
		<ArrowClockwise class="mr-2 animate-spin" width="16" height="16" />
	{/if}

	{label}
</button>

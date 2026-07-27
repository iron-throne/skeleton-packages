<script lang="ts">
	import { ArrowClockwise } from 'svelte-bootstrap-icons';
	import { BUTTON_SIZE_CLASS, BUTTON_VARIANT_CLASS } from './constants';
	import type { ButtonIconPosition, ButtonSize, ButtonVariant } from './types';
	

	let {
		label,
		klass = '',
		classes = '',
		variant = 'primary',
		size = 'md',
		type = 'button',
		loading = false,
		disabled = false,
		fullWidth = false,
		iconOnly = false,
		iconPosition = 'left',
		icon,
		onClick,
		onKeydown,
		onEnterKeydown,
	}: {
		label: string;
		klass?: string;
		classes?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: 'button' | 'submit' | 'reset';
		loading?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		iconOnly?: boolean;
		iconPosition?: ButtonIconPosition;
		icon?: any;
		onClick?: (e?: MouseEvent) => void | Promise<void>;
		onKeydown?: (e: KeyboardEvent) => void;
		onEnterKeydown?: () => void;
	} = $props();

	const buttonClass = $derived(
		[
			'btn',
			BUTTON_VARIANT_CLASS[variant],
			BUTTON_SIZE_CLASS[size],
			fullWidth ? 'w-full' : '',
			iconOnly ? 'aspect-square px-0' : '',
			classes
		]
			.filter(Boolean)
			.join(' ')
	);

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
	class={buttonClass}
	disabled={disabled || loading}
	aria-disabled={disabled || loading}
	aria-busy={loading}
	aria-label={iconOnly ? label : undefined}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if loading}
		<ArrowClockwise class="animate-spin" width="16" height="16" />
	{:else if icon && iconPosition === 'left'}
		{@const Icon = icon}
		<Icon width="16" height="16" />
	{/if}

	{#if !iconOnly}
		{label}
	{/if}
	{#if icon && iconPosition === 'right' && !loading}
		{@const Icon = icon}
		<Icon width="16" height="16" />
	{/if}
</button>

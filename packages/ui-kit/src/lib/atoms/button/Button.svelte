<script lang="ts">
	import { BUTTON_SIZE_CLASS, BUTTON_VARIANT_CLASS } from './constants';
	import type { ButtonProps } from './types';

	let {
		label,
		children,
		class: className = '',
		klass = '',
		classes = '',
		variant = 'primary',
		size = 'md',
		radius = 'md',
		type = 'button',
		loading = false,
		disabled = false,
		fullWidth = false,
		iconOnly = false,
		iconPosition = 'left',
		icon,
		onclick,
		onClick,
		onkeydown,
		onKeydown,
		onEnterKeydown,
		...restProps
	}: ButtonProps = $props();

	const buttonClass = $derived(
		[
			'btn',
			BUTTON_VARIANT_CLASS[variant],
			BUTTON_SIZE_CLASS[size],
			fullWidth && 'btn-full',
			iconOnly && 'btn-icon-only',
			className,
			klass,
			classes
		]
			.filter(Boolean)
			.join(' ')
	);

	const accessibleLabel = $derived(restProps['aria-label'] ?? (iconOnly ? label : undefined));

	function handleClick(event: MouseEvent) {
		if (loading || disabled) return;
		onclick?.(event);
		onClick?.(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		onkeydown?.(event);
		onKeydown?.(event);

		if (event.key === 'Enter') {
			onEnterKeydown?.();
		}
	}
</script>

<button
	{...restProps}
	{type}
	class={buttonClass}
	disabled={disabled || loading}
	aria-disabled={disabled || loading}
	aria-busy={loading || undefined}
	aria-label={accessibleLabel}
	data-variant={variant}
	data-size={size}
	data-radius={radius}
	data-loading={loading || undefined}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if loading}
		<span class="btn-spinner" aria-hidden="true"></span>
	{:else if icon && iconPosition === 'left'}
		{@const Icon = icon}
		<Icon width="16" height="16" aria-hidden="true" />
	{/if}

	{#if !iconOnly}
		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	{/if}

	{#if icon && iconPosition === 'right' && !loading}
		{@const Icon = icon}
		<Icon width="16" height="16" aria-hidden="true" />
	{/if}
</button>

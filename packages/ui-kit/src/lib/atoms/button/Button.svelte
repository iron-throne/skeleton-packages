<script lang="ts">
	import { BUTTON_SIZE_CLASS, BUTTON_VARIANT_CLASS } from './constants';
	import { EPosition, ESize } from '@aryagg/types';
	import type { ButtonProps } from './types';
	import Icon from '../icon/Icon.svelte';

	let {
		label,
		children,
		klass = '',
		variant = 'primary',
		size = ESize.MD,
		radius = 'md',
		type = 'button',
		loading = false,
		disabled = false,
		fullWidth = false,
		iconOnly = false,
		iconPosition = EPosition.LEFT,
		icon,
		iconKlass = '',
		onclick,
		onkeydown,
		onEnterKeydown,
		...restProps
	}: ButtonProps = $props();

	const buttonClass = $derived(
		[
			'btn',
			BUTTON_VARIANT_CLASS[variant],
			BUTTON_SIZE_CLASS[size] ?? BUTTON_SIZE_CLASS[ESize.MD],
			fullWidth && 'btn-full',
			iconOnly && 'btn-icon-only',
			klass,
		]
			.filter(Boolean)
			.join(' ')
	);

	const accessibleLabel = $derived(restProps['aria-label'] ?? (iconOnly ? label : undefined));

	function handleClick(event: MouseEvent) {
		if (loading || disabled) return;
		onclick?.(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		onkeydown?.(event);

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
	{:else if icon && iconPosition === EPosition.LEFT}
		<Icon {icon} klass={iconKlass} width="16" height="16" aria-hidden="true" />
	{/if}

	{#if !iconOnly}
		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	{/if}

	{#if icon && iconPosition === EPosition.RIGHT && !loading}
		<Icon {icon} klass={iconKlass} width="16" height="16" aria-hidden="true" />
	{/if}
</button>

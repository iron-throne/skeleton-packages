<script lang="ts">
	import { ESize } from "@aryagg/types";
	import type { BadgeProps } from "..";



	let {
		label = '',
		variant = 'default',
		appearance = 'soft',
		size = ESize.MD,
		radius = 'full',
		dot = false,
		dotOnly = false,
		uppercase = false,
		icon,
		class: klass = '',
		style = '',
		backgroundColor = '',
		textColor = '',
		borderColor = '',
		borderWidth = '',
		borderRadius = '',
		height = '',
		paddingInline = '',
		fontSize = '',
		fontWeight = '',
		dotColor = '',
		children,
		...restProps
	}: BadgeProps = $props();

	const rootStyle = $derived(
		[
			backgroundColor && `--badge-bg:${backgroundColor}`,
			textColor && `--badge-color:${textColor}`,
			borderColor && `--badge-border-color:${borderColor}`,
			borderWidth && `--badge-border-width:${borderWidth}`,
			borderRadius && `--badge-radius:${borderRadius}`,
			height && `--badge-height:${height}`,
			paddingInline && `--badge-padding-inline:${paddingInline}`,
			fontSize && `--badge-font-size:${fontSize}`,
			fontWeight && `--badge-font-weight:${fontWeight}`,
			dotColor && `--badge-dot-color:${dotColor}`,
			style
		]
			.filter(Boolean)
			.join(';')
	);
</script>

<span
	{...restProps}
	class="ui-badge ui-badge-{variant} ui-badge-{appearance} ui-badge-{size}
		ui-badge-radius-{radius}
		{dotOnly ? 'ui-badge-dot-only' : ''}
		{uppercase ? 'ui-badge-uppercase' : ''}
		{klass}"
	style={rootStyle || undefined}
	data-variant={variant}
	data-appearance={appearance}
	data-size={size}
	data-radius={radius}
>
	{#if dot || dotOnly}
		<span class="ui-badge-dot" aria-hidden="true"></span>
	{/if}

	{#if !dotOnly}
		{#if icon}
			{@const Icon = icon}
			<Icon width="12" height="12" aria-hidden="true" />
		{/if}

		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	{/if}
</span>

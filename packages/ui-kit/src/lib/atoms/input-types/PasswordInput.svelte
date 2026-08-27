<script lang="ts">
	import { EInputType, EPosition, INPUT_TYPE_CLASSES, type IconType, type IFormField } from '@aryagg/types';
	import type { Snippet } from 'svelte';
	import { Eye, EyeSlash } from 'svelte-bootstrap-icons';
	import { buildAttributes, createDebouncedEmit, inputBaseClass } from '$lib/input-shared';

	let {
		field = $bindable(),
		icon,
		iconPosition = EPosition.LEFT,
		labelBlock
	}: {
		field: IFormField;
		icon?: IconType;
		iconPosition?: EPosition.LEFT | EPosition.RIGHT;
		labelBlock: Snippet;
	} = $props();

	let showPassword = $state(false);

	const debouncedEmit = createDebouncedEmit(field);

	const hasLeftIcon = $derived(!!icon && iconPosition === EPosition.LEFT);
	const hasRightIcon = $derived(!!icon && iconPosition === EPosition.RIGHT);

	const inputClass = $derived(
		[
			inputBaseClass,
			INPUT_TYPE_CLASSES[EInputType.PASSWORD] ?? '',
			field.klass ?? '',
			hasLeftIcon ? 'pl-10' : '',
			'pr-10'
		]
			.filter(Boolean)
			.join(' ')
	);

	const attrs = $derived(buildAttributes(field, inputClass, debouncedEmit));
</script>

<div class="relative">
	{#if icon}
		{@const InputIcon = icon}
		<InputIcon
			width={15}
			height={15}
			class="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-secondary
				{iconPosition === EPosition.LEFT ? 'left-3' : 'right-10'}"
		/>
	{/if}
	<input
		id={field.id}
		type={showPassword ? EInputType.TEXT : EInputType.PASSWORD}
		autocomplete="current-password"
		{...attrs}
	/>
	<!-- {#if !field.hideLabel}
		{@render labelBlock()}
	{/if} -->
	<button
		type="button"
		onclick={() => (showPassword = !showPassword)}
		class="text-secondary hover:text-content-primary hover:text-accent absolute top-1/2 right-0 -translate-y-1/2 border-0 transition bg-transparent!"
		aria-label="Toggle password visibility"
	>
		{#if showPassword}
			<EyeSlash width={16} height={16} />
		{:else}
			<Eye width={16} height={16} />
		{/if}
	</button>
</div>

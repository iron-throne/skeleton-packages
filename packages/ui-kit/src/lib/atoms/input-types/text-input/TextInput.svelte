<script lang="ts">
	import { EInputType, INPUT_TYPE_CLASSES, type IFormField } from '@aryagg/types';
	import { Search } from 'svelte-bootstrap-icons';
	import { buildAttributes, createDebouncedEmit, inputBaseClass } from '$lib/input-shared';

	let {
		field = $bindable(),
		icon,
		iconPosition = 'left'
	}: {
		field: IFormField;
		icon?: any;
		iconPosition?: 'left' | 'right';
	} = $props();

	const debouncedEmit = createDebouncedEmit(field);

	const isSearch = $derived(field.type === EInputType.SEARCH);
	const InputIcon = $derived(icon ?? (isSearch ? Search : undefined));
	const hasLeftIcon = $derived(!!InputIcon && iconPosition === 'left');
	const hasRightIcon = $derived(!!InputIcon && iconPosition === 'right');

	const inputClass = $derived(
		[
			inputBaseClass,
			INPUT_TYPE_CLASSES[field.type] ?? '',
			field.klass ?? '',
			hasLeftIcon ? 'pl-10' : '',
			hasRightIcon ? 'pr-10' : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	const attrs = $derived(buildAttributes(field, inputClass, debouncedEmit));
</script>

<div class="relative">
	{#if InputIcon}
		<InputIcon
			width={15}
			height={15}
			class="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-secondary
				{iconPosition === 'left' ? 'left-3' : 'right-3'}"
		/>
	{/if}
	<input id={field.id} type={field.type} {...attrs} />
</div>

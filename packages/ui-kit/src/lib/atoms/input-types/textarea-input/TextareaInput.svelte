<script lang="ts">
	import { EInputType, INPUT_TYPE_CLASSES, type IFormField } from '@aryagg/types';
	import { buildAttributes, createDebouncedEmit, inputBaseClass } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	const debouncedEmit = createDebouncedEmit(field);

	const inputClass = $derived(
		[inputBaseClass, INPUT_TYPE_CLASSES[EInputType.TEXTAREA] ?? '', field.klass ?? '']
			.filter(Boolean)
			.join(' ')
	);

	const attrs = $derived(buildAttributes(field, inputClass, debouncedEmit));
</script>

<textarea id={field.id} {...attrs}></textarea>

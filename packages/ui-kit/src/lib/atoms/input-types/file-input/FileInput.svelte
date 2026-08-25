<script lang="ts">
	import { EInputType, INPUT_TYPE_CLASSES, type IFormField, type InputValue } from '@aryagg/types';
	import { emitValue, inputBaseClass } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	const inputClass = $derived(
		[inputBaseClass, INPUT_TYPE_CLASSES[EInputType.FILE] ?? '', field.klass ?? '']
			.filter(Boolean)
			.join(' ')
	);
</script>

<input
	id={field.id}
	type="file"
	required={field.required}
	disabled={field.disabled}
	multiple={field.multiple}
	class={inputClass}
	data-state={field.errorMsg ? 'error' : undefined}
	{...field.attributes}
	onchange={(e) => {
		const files = (e.target as HTMLInputElement).files;
		emitValue(field, (field.multiple ? Array.from(files ?? []) : (files?.[0] ?? null)) as InputValue);
	}}
/>

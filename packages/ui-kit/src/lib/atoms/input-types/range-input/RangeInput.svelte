<script lang="ts">
	import { EInputType, INPUT_TYPE_CLASSES, type IFormField } from '@aryagg/types';
	import { buildAttributes, createDebouncedEmit, emitValue, inputBaseClass } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	const debouncedEmit = createDebouncedEmit(field);

	const inputClass = $derived(
		[inputBaseClass, INPUT_TYPE_CLASSES[EInputType.RANGE] ?? '', field.klass ?? '']
			.filter(Boolean)
			.join(' ')
	);

	const attrs = $derived(buildAttributes(field, inputClass, debouncedEmit));
</script>

<div class="flex items-center gap-3">
	<input
		id={field.id}
		type="range"
		{...attrs}
		oninput={(e) => emitValue(field, Number((e.target as HTMLInputElement).value))}
	/>
	<span class="text-content-primary w-10 text-right text-sm font-medium tabular-nums">
		{field.value}
	</span>
</div>

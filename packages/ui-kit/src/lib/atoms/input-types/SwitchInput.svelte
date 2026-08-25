<script lang="ts">
	import type { IFormField } from '@aryagg/types';
	import { emitValue } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();
</script>

<label class="group relative flex cursor-pointer items-center gap-3">
	<span class="text-content-secondary group-hover:text-accent text-xs transition normal-case">
		{field.placeholder ?? field.label}
	</span>
	<input
		type="checkbox"
		id={field.id}
		checked={!!field.value}
		disabled={field.disabled}
		onchange={(e) => emitValue(field, (e.target as HTMLInputElement).checked)}
		class="peer sr-only"
	/>
	<span
		class="peer-disabled:opacity-50 peer-disabled:cursor-not-allowed relative flex h-6 w-11 shrink-0 items-center rounded-full bg-gray-400 px-0.5 transition-colors before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform before:duration-300 peer-checked:bg-accent peer-checked:before:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-400 peer-checked:peer-focus-visible:outline-accent {field.klass ??
			''}"
	></span>
</label>

<script lang="ts">
	import type { IFormField } from '@aryagg/types';
	import { emitValue } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();
</script>

<label class="group flex cursor-pointer items-center gap-3">
	<input
		id={field.id}
		type="checkbox"
		disabled={field.disabled}
		checked={!!field.value}
		onchange={(e) => emitValue(field, (e.target as HTMLInputElement).checked)}
		class="w-fit"
	/>
	<span class="text-content-secondary group-hover:text-accent text-xs transition">
		{field.placeholder ?? field.label}
	</span>
</label>

<script lang="ts">
	import type { IFormField } from '@aryagg/types';
	import { emitValue } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();
</script>

<div class="flex gap-2">
	{#each field.options ?? [] as opt (opt.value)}
		<label class="group flex cursor-pointer items-center gap-3">
			<input
				type="radio"
				name={field.id}
				value={opt.value}
				checked={field.value === opt.value}
				class="accent-accent size-4 cursor-pointer"
				onchange={() => emitValue(field, opt.value)}
			/>
			<span class="text-content-secondary group-hover:text-accent text-xs transition">
				{opt.label}
			</span>
		</label>
	{/each}
</div>

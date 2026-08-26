<script lang="ts">
	import { EInputType, INPUT_TYPE_CLASSES, type IFormField } from '@aryagg/types';
	import { ChevronDown, PlusLg } from 'svelte-bootstrap-icons';
	import {
		buildAttributes,
		createDebouncedEmit,
		emitValue,
		inputBaseClass
	} from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	let newOptionLabel = $state('');

	const debouncedEmit = createDebouncedEmit(field);

	const inputClass = $derived(
		[inputBaseClass, INPUT_TYPE_CLASSES[field.type] ?? '', field.klass ?? '']
			.filter(Boolean)
			.join(' ')
	);

	const attrs = $derived(buildAttributes(field, inputClass, debouncedEmit));

	function addOption(): string | undefined {
		const label = newOptionLabel.trim();
		if (!label) return undefined;
		const existing = (field.options ?? []).find(
			(o) => String(o.value).toLowerCase() === label.toLowerCase()
		);
		if (!existing) {
			if (field.onAddOption) {
				field.onAddOption?.(label);
			} else {
				const newOption = { label, value: label };
				field.options = [...(field.options ?? []), newOption];
			}
		}
		newOptionLabel = '';
		return existing ? String(existing.value) : label;
	}
</script>

<div class="relative">
	<select
		id={field.id}
		{...attrs}
		onchange={(e) => emitValue(field, (e.target as HTMLSelectElement).value)}
	>
		{#if field.placeholder}
			<option value="" disabled selected class="text-content-secondary">{field.placeholder}</option>
		{/if}
		{#each field.options ?? [] as opt (opt.value)}
			<option value={opt.value} class="bg-surface-primary text-content-secondary"
				>{opt.label}</option
			>
		{/each}
	</select>
	<ChevronDown
		width={14}
		height={14}
		class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-secondary"
	/>
</div>

{#if field.type === EInputType.SELECT_ADDNEW}
	<div class="mt-1 flex">
		<input
			type="text"
			bind:value={newOptionLabel}
			placeholder="Add new option…"
			class="{inputBaseClass} flex-1 rounded-r-none border-r-0 py-2 text-sm"
			onkeydown={(e) => {
				if (e.key !== 'Enter') return;
				e.preventDefault();
				const value = addOption();
				if (value) emitValue(field, value);
			}}
		/>
		<button
			type="button"
			disabled={!newOptionLabel.trim()}
			onclick={() => {
				const value = addOption();
				if (value) emitValue(field, value);
			}}
			class="btn btn-secondary shrink-0 gap-1 rounded-l-none px-3 text-sm"
			aria-label="Add option"
		>
			<PlusLg width={14} height={14} />
			Add
		</button>
	</div>
{/if}

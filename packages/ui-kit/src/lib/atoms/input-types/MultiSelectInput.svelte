<script lang="ts">
	import { EInputType, type IFormField, type InputValue } from '@aryagg/types';
	import { clickOutside } from '@aryagg/utils';
	import { Check, ChevronDown, PlusLg } from 'svelte-bootstrap-icons';
	import { emitValue, inputBaseClass } from '$lib/input-shared';

	let { field = $bindable() }: { field: IFormField } = $props();

	let showMultiDropdown = $state(false);
	let comboQuery = $state('');
	let comboActiveIndex = $state(-1);

	const isAddNew = $derived(field.type === EInputType.MULTISELECT_ADDNEW);

	const multiSelectedValues = $derived(Array.isArray(field.value) ? (field.value as string[]) : []);

	const multiFilteredOptions = $derived(
		(field.options ?? []).filter((o) =>
			comboQuery.trim() ? o.label.toLowerCase().includes(comboQuery.trim().toLowerCase()) : true
		)
	);

	const multiExactMatch = $derived(
		(field.options ?? []).find((o) => o.label.toLowerCase() === comboQuery.trim().toLowerCase())
	);

	const multiShowAddRow = $derived(
		field.type === EInputType.MULTISELECT_ADDNEW && comboQuery.trim() !== '' && !multiExactMatch
	);

	function toggleMultiValue(value: string, resetQuery = false) {
		const next = multiSelectedValues.includes(value)
			? multiSelectedValues.filter((v) => v !== value)
			: [...multiSelectedValues, value];
		emitValue(field, next as InputValue);
		if (resetQuery) {
			comboQuery = '';
			comboActiveIndex = -1;
		}
	}

	function addComboOption() {
		const label = comboQuery.trim();
		if (!label) return;
		const existing = (field.options ?? []).find(
			(o) => String(o.label).toLowerCase() === label.toLowerCase()
		);
		if (!existing) {
			const newOption = { label, value: label };
			field.options = [...(field.options ?? []), newOption];
			field.onAddOption?.(newOption);
		}
		toggleMultiValue(existing ? String(existing.value) : label, true);
	}

	function handleMultiKeydown(e: KeyboardEvent) {
		const total = multiFilteredOptions.length + (multiShowAddRow ? 1 : 0);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			showMultiDropdown = true;
			comboActiveIndex = total ? (comboActiveIndex + 1) % total : -1;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			comboActiveIndex = total ? (comboActiveIndex - 1 + total) % total : -1;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (comboActiveIndex >= 0 && comboActiveIndex < multiFilteredOptions.length) {
				toggleMultiValue(String(multiFilteredOptions[comboActiveIndex].value), true);
			} else if (multiShowAddRow) {
				addComboOption();
			} else if (multiExactMatch) {
				toggleMultiValue(String(multiExactMatch.value), true);
			} else if (multiFilteredOptions.length === 1) {
				toggleMultiValue(String(multiFilteredOptions[0].value), true);
			}
		} else if (e.key === 'Escape') {
			showMultiDropdown = false;
			comboActiveIndex = -1;
		} else if (e.key === 'Backspace' && !comboQuery && multiSelectedValues.length) {
			toggleMultiValue(multiSelectedValues[multiSelectedValues.length - 1]);
		}
	}
</script>

<div class="relative flex flex-col gap-2" use:clickOutside={() => (showMultiDropdown = false)}>
	{#if multiSelectedValues.length}
		<div class="flex flex-wrap gap-1.5">
			{#each multiSelectedValues as val (val)}
				{@const opt = (field.options ?? []).find((o) => String(o.value) === val)}
				<span
					class="text-content-primary border-border-primary rounded-sm rounded-full border px-2 py-0.5 text-xs font-medium"
				>
					{opt?.label ?? val}
					<button
						type="button"
						onclick={() => toggleMultiValue(val)}
						class="hover:text-error border-0 bg-transparent p-0 text-[10px] leading-none transition"
						aria-label="Remove {opt?.label ?? val}"
					>
						✕
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<div class="relative">
		<input
			id={field.id}
			type="text"
			value={comboQuery}
			placeholder={field.placeholder ?? (isAddNew ? 'Search or add…' : 'Search…')}
			disabled={field.disabled}
			class="{inputBaseClass} pr-10 {field.klass ?? ''}"
			oninput={(e) => {
				comboQuery = (e.target as HTMLInputElement).value;
				comboActiveIndex = -1;
				showMultiDropdown = true;
			}}
			onfocus={() => (showMultiDropdown = true)}
			onkeydown={handleMultiKeydown}
		/>
		<button
			type="button"
			onclick={() => (showMultiDropdown = !showMultiDropdown)}
			class="text-secondary absolute top-1/2 right-3 -translate-y-1/2 border-0 bg-transparent! transition"
			aria-label="Toggle options"
		>
			<ChevronDown width={14} height={14} />
		</button>
	</div>

	{#if showMultiDropdown}
		<div
			class="bg-surface-primary absolute top-full z-20 mt-1.5 flex max-h-60 w-full flex-col gap-1 overflow-y-auto rounded-lg border p-1.5 shadow-lg"
		>
			{#each multiFilteredOptions as opt, i (opt.value)}
				{@const isSelected = multiSelectedValues.includes(String(opt.value))}
				<button
					type="button"
					onclick={() => toggleMultiValue(String(opt.value), true)}
					onmouseenter={() => (comboActiveIndex = i)}
					class="flex w-full items-center justify-start gap-2 rounded-md border-0 px-3 py-2 text-sm transition
                        {comboActiveIndex === i
						? 'bg-surface-secondary text-content-primary'
						: isSelected
							? 'text-content-primary font-medium'
							: 'text-content-secondary'}"
				>
					<span
						class="flex size-4 shrink-0 items-center rounded border transition
							{isSelected ? 'bg-accent border-accent text-surface-primary' : 'border-content-tertiary'}"
						aria-hidden="true"
					>
						{#if isSelected}
							<Check width={10} height={10} />
						{/if}
					</span>
					<span class="truncate">{opt.label}</span>
				</button>
			{/each}

			{#if multiShowAddRow}
				<button
					type="button"
					onclick={addComboOption}
					onmouseenter={() => (comboActiveIndex = multiFilteredOptions.length)}
					class="text-accent justify-left flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition
                        {multiFilteredOptions.length ? 'mt-1 border-t pt-2.5' : ''}
                        {comboActiveIndex === multiFilteredOptions.length ? 'bg-surface-secondary' : ''}"
				>
					<PlusLg width={12} height={12} />
					Add "{comboQuery.trim()}"
				</button>
			{/if}

			{#if !multiFilteredOptions.length && !multiShowAddRow}
				<div class="text-content-tertiary px-3 py-2 text-xs">No options found</div>
			{/if}
		</div>
	{/if}
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Eye, EyeSlash, ExclamationCircle } from 'svelte-bootstrap-icons';
	import { EInputType } from '@aryagg/types';
	import type { IFormField, InputValue, ISelectOption } from '@aryagg/types';
	import { DEBOUNCE_DELAY, INPUT_TYPE_CLASSES, NATIVE_TEXT_TYPES, REGEX } from '@aryagg/types';

	let { field = $bindable() }: { field: IFormField } = $props();

	let showPassword = $state(false);
	let newOptionLabel = $state('');

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function debouncedEmit(val: InputValue) {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => emit(val), DEBOUNCE_DELAY);
	}

	const inputBase = [
		'w-full px-4 py-2 rounded-lg border ',
		'bg-surface-secondary/50 text-content-primary text-sm',
		'placeholder:text-content-tertiary',
		// 'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
		'disabled:opacity-50 disabled:cursor-not-allowed transition',
	].join(' ');

	const inputClass = $derived(
		`${inputBase} ${INPUT_TYPE_CLASSES[field.type] ?? ''} ${field.classes ?? ''}`.trim(),
	);

	const inputAttributes = $derived({
		value: field.value as string | number | null | undefined,
		placeholder: field.placeholder,
		required: field.required,
		disabled: field.disabled,
		readonly: field.readOnly,
		multiple: field.multiple,
		class: inputClass,
		oninput: (e: Event) => debouncedEmit((e.target as HTMLInputElement).value),
		onblur: field.onBlur,
		onfocus: field.onFocus,
		onkeydown: field.onKeydown,
		...field.errorMsg && { 'data-state': 'error' },
		...field.attributes,
	});

	function emit(inputVal: InputValue) {
		const val = typeof inputVal === 'string' ? inputVal.trim() : inputVal;
		checkValidation(val);

		if (field.errorMsg) return;
		field.value = val;
		field.onChange?.(val);
	}
	function checkValidation(val: InputValue) {
		if (field.type === EInputType.FILE) {
			if (field.required && (val == null || (Array.isArray(val) && val.length === 0))) {
				field.errorMsg = `${field.label} is required`;
			}
			field.errorMsg = '';
			return;
		}
		if (field.rules?.length) {
			const valString = typeof val === 'string' ? val : String(val);
			for (const rule of field.rules) {
				field.errorMsg = valString?.match(rule.regex) ? '' : rule.message;
				if (field.errorMsg) {
					return;
				}
			}
		}
	}

	function addOption() {
		const label = newOptionLabel.trim();
		if (!label) return;
		field.options = [...(field.options ?? []), { label, value: label }];
		newOptionLabel = '';
	}

	function removeOption(opt: ISelectOption) {
		field.options = (field.options ?? []).filter((o) => o.value !== opt.value);
	}
	onMount(() => {
		field.rules = [
			...(field.rules ?? []),
			...(field.required
				? [{ regex: REGEX.REQUIRED, message: `${field.label} is required` }]
				: []),
			...(field.type === EInputType.EMAIL
				? [{ regex: REGEX.EMAIL, message: `${field.label} is not a valid email` }]
				: []),
		];
	});
</script>

<div class="flex flex-col gap-1">
	<!-- Label -->
	{#if !field.hideLabel && field.type !== EInputType.HIDDEN}
		<label for={field.id} class="section-label flex gap-1">
			{#if field.icon}
				<field.icon width={14} height={14} class="text-content-tertiary" />
			{/if}
			{field.label}
			{#if field.required}
				<span class="text-accent text-xs">*</span>
			{/if}
		</label>
	{/if}

	<!-- ── TEXT-LIKE INPUTS ── -->
	{#if NATIVE_TEXT_TYPES.has(field.type)}
		<div class="relative">
			<input id={field.id} type={field.type} {...inputAttributes} />
		</div>

		<!-- ── PASSWORD ── -->
	{:else if field.type === EInputType.PASSWORD}
		<div class="relative">
			<input
				id={field.id}
				type={showPassword ? EInputType.TEXT : EInputType.PASSWORD}
				{...inputAttributes}
			/>
			<button
				type="button"
				onclick={() => (showPassword = !showPassword)}
				class="text-secondary hover:text-content-primary hover:text-accent absolute top-1/2 right-0 -translate-y-1/2 border-0 transition"
				aria-label="Toggle password visibility"
			>
				{#if showPassword}
					<EyeSlash width={16} height={16} />
				{:else}
					<Eye width={16} height={16} />
				{/if}
			</button>
		</div>

		<!-- ── TEXTAREA ── -->
	{:else if field.type === EInputType.TEXTAREA}
		<textarea id={field.id} {...inputAttributes}></textarea>

		<!-- ── CHECKBOX ── -->
	{:else if field.type === EInputType.CHECKBOX}
		<label class="group flex cursor-pointer items-center gap-3">
			<input
				id={field.id}
				type="checkbox"
				{...inputAttributes}
				checked={!!field.value}
				onchange={(e) => emit((e.target as HTMLInputElement).checked)}
				class="w-fit"
			/>
			<span class="text-content-secondary group-hover:text-accent text-xs transition">
				{field.placeholder ?? field.label}
			</span>
		</label>

		<!-- ── RADIO ── -->
	{:else if field.type === EInputType.RADIO}
		<div class="flex gap-2">
			{#each field.options ?? [] as opt (opt.value)}
				<label class="group flex cursor-pointer items-center gap-3">
					<input
						type="radio"
						name={field.id}
						value={opt.value}
						checked={field.value === opt.value}
						class="accent-accent size-4 cursor-pointer"
						onchange={() => emit(opt.value)}
					/>
					<span class="text-content-secondary group-hover:text-accent text-xs transition">
						{opt.label}
					</span>
				</label>
			{/each}
		</div>

		<!-- ── RANGE ── -->
	{:else if field.type === EInputType.RANGE}
		<div class="flex items-center gap-3">
			<input
				id={field.id}
				type="range"
				{...inputAttributes}
				oninput={(e) => emit(Number((e.target as HTMLInputElement).value))}
			/>
			<span class="text-content-primary w-10 text-right text-sm font-medium tabular-nums">
				{field.value}
			</span>
		</div>

		<!-- ── FILE ── -->
	{:else if field.type === EInputType.FILE}
		<input
			id={field.id}
			type="file"
			{...inputAttributes}
			onchange={(e) => {
				const files = (e.target as HTMLInputElement).files;
				emit(field.multiple ? Array.from(files ?? []) : (files?.[0] ?? null));
			}}
		/>

		<!-- ── SELECT ── -->
	{:else if field.type === EInputType.SELECT || field.type === EInputType.SELECT_ADDNEW}
		<select
			id={field.id}
			{...inputAttributes}
			onchange={(e) => emit((e.target as HTMLSelectElement).value)}
		>
			{#if field.placeholder}
				<option value="" disabled selected class="text-content-tertiary"
					>{field.placeholder}</option
				>
			{/if}
			{#each field.options ?? [] as opt (opt.value)}
				<option value={opt.value} class="bg-surface-primary text-content-primary"
					>{opt.label}</option
				>
			{/each}
		</select>
		{#if field.type === EInputType.SELECT_ADDNEW}
			<div class="mt-1 flex gap-2">
				<input
					type="text"
					bind:value={newOptionLabel}
					placeholder="New option…"
					class="{inputBase} flex-1 py-2 text-sm"
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
				/>
				<button
					type="button"
					onclick={addOption}
					class="btn btn-secondary px-4 py-2 text-sm"
				>
					Add
				</button>
			</div>
		{/if}

		<!-- ── MULTISELECT ── -->
	{:else if field.type === EInputType.MULTISELECT || field.type === EInputType.MULTISELECT_ADDNEW}
		<div class="flex flex-col gap-2">
			<div class="bg-surface-secondary flex min-h-11 flex-wrap gap-2 rounded-lg border p-2">
				{#each field.options ?? [] as opt (opt.value)}
					{@const selected =
						Array.isArray(field.value) && field.value.includes(opt.value)}
					<button
						type="button"
						onclick={() => {
							const current: InputValue[] = Array.isArray(field.value)
								? [...field.value]
								: [];
							const next = selected
								? current.filter((v) => v !== opt.value)
								: [...current, opt.value];
							emit(next);
						}}
						class="rounded-full border px-3 py-1 text-xs font-medium transition
                            {selected
							? 'bg-accent text-surface-primary border-accent'
							: 'bg-surface-primary text-content-secondary  hover:border-accent hover:text-content-primary'}"
					>
						{opt.label}
					</button>
				{/each}
				{#if !field.options?.length}
					<span class="text-content-tertiary self-center px-1 text-xs">No options</span>
				{/if}
			</div>
			{#if field.type === EInputType.MULTISELECT_ADDNEW}
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={newOptionLabel}
						placeholder="New option…"
						class="{inputBase} flex-1 py-2 text-sm"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
					/>
					<button
						type="button"
						onclick={addOption}
						class="btn btn-secondary px-4 py-2 text-sm"
					>
						Add
					</button>
				</div>
			{/if}
			<!-- Remove options from list -->
			{#if field.options?.length}
				<div class="flex flex-wrap gap-1">
					{#each field.options ?? [] as opt (opt.value)}
						<span
							class="text-content-tertiary bg-surface-secondary flex items-center gap-1 rounded px-2 py-0.5 text-xs"
						>
							{opt.label}
							{#if field.type === EInputType.MULTISELECT_ADDNEW}
								<button
									type="button"
									onclick={() => removeOption(opt)}
									class="hover:text-accent transition">✕</button
								>
							{/if}
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ── RICHTEXT ── -->
	{:else if field.type === EInputType.RICHTEXT}
		<div
			id={field.id}
			contenteditable="true"
			role="textbox"
			aria-multiline="true"
			class={inputClass}
			oninput={(e) => emit((e.target as HTMLElement).innerHTML)}
		></div>
	{/if}

	<!-- Helper / Error -->
	{#if field.errorMsg}
		<p class="text-error flex items-center gap-1 text-[11px]">
			<ExclamationCircle width={12} height={12} />
			{field.errorMsg}
		</p>
	{:else if field.helperText}
		<p class="text-content-tertiary text-[11px]">{field.helperText}</p>
	{/if}
</div>

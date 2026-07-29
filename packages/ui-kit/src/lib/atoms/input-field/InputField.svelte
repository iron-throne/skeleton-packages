<script lang="ts">
	import { Eye, EyeSlash } from 'svelte-bootstrap-icons';
	import {
		INPUT_FIELD_BASE_CLASS,
		INPUT_FIELD_HELPER_CLASS,
		INPUT_FIELD_INLINE_CLASS,
		INPUT_FIELD_SIZE_CLASS,
		INPUT_FIELD_STATE_CLASS
	} from './constants';
	import type {
		InputFieldOption,
		InputFieldIconPosition,
		InputFieldSize,
		InputFieldState,
		InputFieldType,
		InputFieldValue
	} from './types';

	let {
		id = crypto.randomUUID(),
		label = '',
		type = 'text',
		value = $bindable<InputFieldValue>(''),
		placeholder = '',
		helperText = '',
		state: validationState = 'default',
		size = 'md',
		options = [],
		name = '',
		required = false,
		disabled = false,
		readonly = false,
		multiple = false,
		accept = '',
		min,
		max,
		step,
		rows = 4,
		icon,
		iconPosition = 'left',
		class: klass = '',
		onChange
	}: {
		id?: string;
		label?: string;
		type?: InputFieldType;
		value?: InputFieldValue;
		placeholder?: string;
		helperText?: string;
		state?: InputFieldState;
		size?: InputFieldSize;
		options?: InputFieldOption[];
		name?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		multiple?: boolean;
		accept?: string;
		min?: number | string;
		max?: number | string;
		step?: number | string;
		rows?: number;
		icon?: any;
		iconPosition?: InputFieldIconPosition;
		class?: string;
		onChange?: (value: InputFieldValue) => void;
	} = $props();

	let showPassword = $state(false);
	let fileNames = $state<string[]>([]);

	const controlClass = $derived(
		[
			INPUT_FIELD_BASE_CLASS,
			type === 'textarea' ? 'min-h-24 py-2.5 leading-6' : INPUT_FIELD_SIZE_CLASS[size],
			INPUT_FIELD_STATE_CLASS[validationState],
			icon && iconPosition === 'left' ? 'pl-10' : '',
			(icon && iconPosition === 'right') || type === 'password' ? 'pr-10' : '',
			klass
		]
			.filter(Boolean)
			.join(' ')
	);

	const nativeType = $derived(type === 'password' && showPassword ? 'text' : type);
	const describedBy = $derived(helperText ? `${id}-helper` : undefined);

	function update(nextValue: InputFieldValue) {
		value = nextValue;
		onChange?.(nextValue);
	}

	function handleTextInput(event: Event) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		update(type === 'number' || type === 'range' ? Number(target.value) : target.value);
	}

	function handleFileInput(event: Event) {
		const files = Array.from((event.target as HTMLInputElement).files ?? []);
		fileNames = files.map((file) => file.name);
		update(multiple ? files : (files[0] ?? null));
	}
</script>

<div class="space-y-1.5">
	{#if label && type !== 'checkbox' && type !== 'radio'}
		<label for={id}>
			{label}
			{#if required}
				<span class="text-accent">*</span>
			{/if}
		</label>
	{/if}

	{#if type === 'textarea'}
		<textarea
			{id}
			{placeholder}
			{required}
			{disabled}
			{readonly}
			{rows}
			class={controlClass}
			value={String(value ?? '')}
			aria-describedby={describedBy}
			data-state={validationState === 'default' ? undefined : validationState}
			oninput={handleTextInput}
		></textarea>
	{:else if type === 'select'}
		<select
			{id}
			{required}
			{disabled}
			class={controlClass}
			value={String(value ?? '')}
			aria-describedby={describedBy}
			data-state={validationState === 'default' ? undefined : validationState}
			onchange={(event) => update((event.target as HTMLSelectElement).value)}
		>
			{#if placeholder}
				<option value="" disabled>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>{option.label}</option>
			{/each}
		</select>
	{:else if type === 'checkbox'}
		<label class="m-0 flex cursor-pointer items-start gap-2 normal-case tracking-normal">
			<input
				{id}
				type="checkbox"
				{disabled}
				checked={Boolean(value)}
				class="{INPUT_FIELD_INLINE_CLASS} mt-0.5 size-4"
				onchange={(event) => update((event.target as HTMLInputElement).checked)}
			/>
			<span class="space-y-0.5">
				<span class="block text-sm font-medium text-primary">{label}</span>
				{#if helperText}
					<span class="block text-xs {INPUT_FIELD_HELPER_CLASS[validationState]}">{helperText}</span
					>
				{/if}
			</span>
		</label>
	{:else if type === 'radio'}
		<fieldset class="space-y-2">
			{#if label}
				<legend class="section-label">{label}</legend>
			{/if}
			<div class="flex flex-wrap gap-3">
				{#each options as option}
					<label class="m-0 flex cursor-pointer items-center gap-2 normal-case tracking-normal">
						<input
							type="radio"
							{name}
							value={option.value}
							disabled={disabled || option.disabled}
							checked={value === option.value}
							class="{INPUT_FIELD_INLINE_CLASS} size-4"
							onchange={() => update(option.value)}
						/>
						<span class="text-sm text-primary">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>
	{:else if type === 'range'}
		<div class="flex items-center gap-3">
			<input
				{id}
				type="range"
				{disabled}
				{min}
				{max}
				{step}
				value={Number(value ?? 0)}
				class="w-full"
				oninput={handleTextInput}
			/>
			<span class="w-10 text-right font-mono text-xs text-primary">{value}</span>
		</div>
	{:else if type === 'file'}
		<div class="space-y-2">
			<input
				{id}
				type="file"
				{disabled}
				{multiple}
				{accept}
				class={controlClass}
				aria-describedby={describedBy}
				data-state={validationState === 'default' ? undefined : validationState}
				onchange={handleFileInput}
			/>
			{#if fileNames.length}
				<div class="flex flex-wrap gap-1">
					{#each fileNames as fileName}
						<span class="rounded bg-surface-tertiary px-2 py-0.5 text-[10px] text-secondary">
							{fileName}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{:else if type === 'color'}
		<input
			{id}
			type="color"
			{disabled}
			value={String(value ?? '#000000')}
			class="h-10 w-16 rounded-xl border border-border-primary bg-surface-secondary p-1"
			oninput={(event) => update((event.target as HTMLInputElement).value)}
		/>
	{:else}
		<div class="relative">
			{#if icon}
				{@const Icon = icon}
				<span
					class="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-secondary
						{iconPosition === 'left' ? 'left-3' : type === 'password' ? 'right-10' : 'right-3'}"
					aria-hidden="true"
				>
					<Icon width={15} height={15} />
				</span>
			{/if}

			<input
				{id}
				type={nativeType}
				{placeholder}
				{required}
				{disabled}
				{readonly}
				{min}
				{max}
				{step}
				class={controlClass}
				value={String(value ?? '')}
				aria-describedby={describedBy}
				data-state={validationState === 'default' ? undefined : validationState}
				oninput={handleTextInput}
			/>
			{#if type === 'password'}
				<button
					type="button"
					class="absolute right-2 top-1/2 size-7 -translate-y-1/2 rounded-md !border-0 !bg-transparent !p-0 text-secondary hover:!bg-surface-tertiary"
					onclick={() => (showPassword = !showPassword)}
					aria-label="Toggle password visibility"
				>
					{#if showPassword}
						<EyeSlash width={15} height={15} />
					{:else}
						<Eye width={15} height={15} />
					{/if}
				</button>
			{/if}
		</div>
	{/if}

	{#if helperText && type !== 'checkbox'}
		<p id={`${id}-helper`} class="text-xs {INPUT_FIELD_HELPER_CLASS[validationState]}">
			{helperText}
		</p>
	{/if}
</div>

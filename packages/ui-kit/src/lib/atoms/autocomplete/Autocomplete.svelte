<script lang="ts">
	import { Check, ChevronDown, Search, XLg } from 'svelte-bootstrap-icons';
	import { ESize } from '@aryagg/types';
	import Icon from '../icon/Icon.svelte';
	import {
		AUTOCOMPLETE_EMPTY_TEXT,
		AUTOCOMPLETE_HELPER_CLASS,
		AUTOCOMPLETE_PANEL_CLASS,
		AUTOCOMPLETE_SIZE_CLASS,
		AUTOCOMPLETE_STATE_CLASS
	} from './constants';
	import type { AutocompleteOption, AutocompleteProps, AutocompleteValue } from './types';

	let {
		id = crypto.randomUUID(),
		label = '',
		value = $bindable<AutocompleteValue>(null),
		options = [],
		placeholder = 'Search...',
		helperText = '',
		state: validationState = 'default',
		density = ESize.MD,
		multiple = false,
		chips = false,
		clearable = false,
		disabled = false,
		loading = false,
		searchable = true,
		showSearchIcon = true,
		showOptionIcons = true,
		noDataText = AUTOCOMPLETE_EMPTY_TEXT,
		class: klass = '',
		onChange
	}: AutocompleteProps = $props();

	let query = $state('');
	let open = $state(false);
	let activeIndex = $state(0);

	const selectedValues = $derived(
		multiple ? (Array.isArray(value) ? value : []) : typeof value === 'string' ? [value] : []
	);

	const selectedOptions = $derived(
		selectedValues
			.map((selectedValue) => options.find((option) => option.value === selectedValue))
			.filter((option): option is AutocompleteOption => Boolean(option))
	);

	const filteredOptions = $derived.by(() => {
		const search = query.trim().toLowerCase();
		if (!search || !searchable) return options;
		return options.filter((option) =>
			[option.label, option.value, option.description ?? '']
				.join(' ')
				.toLowerCase()
				.includes(search)
		);
	});

	const inputValue = $derived(
		multiple || (open && searchable) ? query : (selectedOptions[0]?.label ?? query)
	);
	const describedBy = $derived(helperText ? `${id}-helper` : undefined);
	const wrapperClass = $derived(
		[
			'relative flex w-full items-center gap-2 rounded-xl border bg-surface-secondary transition focus-within:bg-surface-primary focus-within:ring-2',
			AUTOCOMPLETE_SIZE_CLASS[density] ?? AUTOCOMPLETE_SIZE_CLASS[ESize.MD],
			AUTOCOMPLETE_STATE_CLASS[validationState],
			disabled ? 'cursor-not-allowed opacity-60' : '',
			klass
		]
			.filter(Boolean)
			.join(' ')
	);

	function update(nextValue: AutocompleteValue) {
		value = nextValue;
		onChange?.(nextValue);
	}

	function selectOption(option: AutocompleteOption) {
		if (option.disabled) return;

		if (multiple) {
			const next = selectedValues.includes(option.value)
				? selectedValues.filter((item) => item !== option.value)
				: [...selectedValues, option.value];
			update(next);
			query = '';
			open = true;
			return;
		}

		update(option.value);
		query = option.label;
		open = false;
	}

	function openSelect() {
		if (disabled) return;
		open = true;
		if (searchable) query = '';
	}

	function removeValue(selectedValue: string) {
		if (!multiple) {
			clearValue();
			return;
		}

		update(selectedValues.filter((item) => item !== selectedValue));
	}

	function clearValue() {
		update(multiple ? [] : null);
		query = '';
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			open = true;
			activeIndex = Math.min(activeIndex + 1, Math.max(filteredOptions.length - 1, 0));
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		}

		if (event.key === 'Enter' && open && filteredOptions[activeIndex]) {
			event.preventDefault();
			selectOption(filteredOptions[activeIndex]);
		}

		if (event.key === 'Escape') {
			open = false;
		}
	}

	function handleFocusout(event: FocusEvent) {
		const nextTarget = event.relatedTarget as Node | null;
		if (nextTarget && (event.currentTarget as HTMLElement).contains(nextTarget)) return;
		open = false;
	}
</script>

<div class="space-y-1.5">
	{#if label}
		<label for={id}>{label}</label>
	{/if}

	<div class="relative" onfocusout={handleFocusout}>
		<div class={wrapperClass}>
			{#if showOptionIcons && !multiple && !open && selectedOptions[0]?.icon}
				<Icon
					icon={selectedOptions[0].icon}
					klass="size-4 text-tertiary {selectedOptions[0].iconClass ?? ''}"
				/>
			{:else if showSearchIcon && searchable}
				<Search width={14} height={14} class="shrink-0 text-tertiary" />
			{/if}

			{#if multiple && chips && selectedOptions.length}
				<div class="flex max-w-full flex-wrap gap-1">
					{#each selectedOptions as option}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent"
						>
							{#if showOptionIcons && option.icon}
								<Icon icon={option.icon} klass="size-3 {option.iconClass ?? ''}" />
							{/if}
							{option.label}
							<button
								type="button"
								class="!size-4 !rounded-full !border-0 !bg-transparent !p-0 hover:!bg-accent/10"
								onclick={() => removeValue(option.value)}
								aria-label={`Remove ${option.label}`}
							>
								<XLg width={9} height={9} />
							</button>
						</span>
					{/each}
				</div>
			{/if}

			<input
				{id}
				type="text"
				role="combobox"
				aria-expanded={open}
				aria-controls={`${id}-listbox`}
				aria-describedby={describedBy}
				{disabled}
				{placeholder}
				readonly={!searchable}
				value={inputValue}
				class="min-w-24 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-tertiary focus:ring-0"
				onfocus={openSelect}
				oninput={(event) => {
					if (!searchable) return;
					query = (event.target as HTMLInputElement).value;
					open = true;
					activeIndex = 0;
				}}
				onkeydown={handleKeydown}
			/>

			{#if clearable && selectedValues.length}
				<button
					type="button"
					class="!size-6 !rounded-md !border-0 !bg-transparent !p-0 text-secondary hover:!bg-surface-tertiary"
					onclick={clearValue}
					aria-label="Clear selection"
				>
					<XLg width={12} height={12} />
				</button>
			{/if}

			<button
				type="button"
				class="!size-6 !rounded-md !border-0 !bg-transparent !p-0 text-secondary hover:!bg-surface-tertiary"
				onclick={() => !disabled && (open = !open)}
				aria-label="Toggle options"
			>
				<ChevronDown width={14} height={14} />
			</button>
		</div>

		{#if open && !disabled}
			<div id={`${id}-listbox`} role="listbox" class={AUTOCOMPLETE_PANEL_CLASS}>
				{#if loading}
					<div class="px-3 py-4 text-center text-xs text-secondary">Loading options...</div>
				{:else if filteredOptions.length === 0}
					<div class="px-3 py-4 text-center text-xs text-secondary">{noDataText}</div>
				{:else}
					{#each filteredOptions as option, index}
						{@const selected = selectedValues.includes(option.value)}
						<button
							type="button"
							role="option"
							aria-selected={selected}
							disabled={option.disabled}
							class="flex w-full items-center gap-2 rounded-lg !border-0 !bg-transparent px-3 py-2 text-left text-sm text-primary hover:!bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50 {index ===
							activeIndex
								? '!bg-surface-secondary'
								: ''}"
							onmouseenter={() => (activeIndex = index)}
							onclick={() => selectOption(option)}
						>
							{#if showOptionIcons && option.icon}
								<span
									class="grid size-6 shrink-0 place-items-center rounded bg-surface-tertiary text-tertiary"
								>
									<Icon icon={option.icon} klass="size-3.5 {option.iconClass ?? ''}" />
								</span>
							{/if}
							<span class="min-w-0 flex-1">
								<span class="block truncate font-medium">{option.label}</span>
								{#if option.description}
									<span class="block truncate text-[10px] text-secondary">{option.description}</span
									>
								{/if}
							</span>
							<span class="grid size-4 shrink-0 place-items-center text-accent">
								{#if selected}
									<Check width={14} height={14} />
								{/if}
							</span>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	{#if helperText}
		<p id={`${id}-helper`} class="text-xs {AUTOCOMPLETE_HELPER_CLASS[validationState]}">
			{helperText}
		</p>
	{/if}
</div>

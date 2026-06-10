<script lang="ts">
	import { clickOutside } from '@aryagg/utils';

	let {
		placeholder,
		options,
		canAddNew,
		multiSelect,
		displayText,
		bindValue,
		errorMsg,
		selected,
		label,
		returnObject,
		hideInput,
		icon,
		classes,
		onUpdateValue,
		handleChangeInput,
		disabled,
		id
	}: {
		placeholder?: string;
		options?: Array<any>;
		canAddNew?: boolean;
		multiSelect?: boolean;
		displayText?: string[];
		bindValue?: string;
		errorMsg?: string;
		selected?: any;
		label?: string;
		returnObject?: boolean;
		hideInput?: boolean;
		icon?: string;
		classes?: string;
		onUpdateValue: (val: any) => void;
		handleChangeInput?: (val: any) => void;
		disabled?: boolean;
		id: string;
	} = $props();

	let items        = $state<any[]>([]);
	let inputValue   = $state<string>('');
	let showDropdown = $state<boolean>(false);
	let showAllList  = $state<boolean>(false);
	let openMoreItems = $state(false);

	$effect(() => {
		const newItems: any[] = [];
		if (selected === '' || selected) {
			const selectedItemsArr: string[] = Array.isArray(selected)
				? selected
				: typeof selected === 'object' && selected !== null
					? [selected]
					: typeof selected === 'string'
						? selected.split(',')
						: [];

			if (bindValue && !returnObject) {
				selectedItemsArr.forEach((i: string) => {
					const option = options?.find(
						o => o[bindValue as keyof typeof o]?.toString().toLowerCase() === i?.toLowerCase()
					);
					if (option) newItems.push(option);
				});
			} else {
				newItems.push(...selectedItemsArr);
			}
		}

		if (JSON.stringify(newItems) !== JSON.stringify(items)) {
			items = newItems;
			if (!multiSelect && newItems.length) {
				const newInput = getDisplayText(newItems[0]);
				if (newInput !== inputValue) inputValue = newInput;
			} else if (!newItems.length) {
				inputValue = '';
			}
		}
	});

	const idKey = 'id';

	function removeItems(val: string | number) {
		const target = items.find(it =>
			typeof it === 'object' ? (it[idKey] ?? it[bindValue!]) == val : it == val
		);
		if (target) removeItem(target);
	}

	const searchedOptions = $derived(() => {
		if (!options?.length) return [];
		return showAllList
			? options
			: options.filter(option => {
					const text = getDisplayText(option);
					return text?.toLowerCase().includes(inputValue?.toLowerCase());
				});
	});

	function addItem(item: string | Record<string, any>) {
		const newVal = item ?? item[bindValue as any] ?? inputValue.trim() ?? '';
		if (newVal !== '') {
			if (!isExistsInDropdown(newVal) && !canAddNew) return;
			if (!multiSelect) {
				items = [];
				inputValue = getDisplayText(item);
			} else {
				inputValue = '';
			}
			items.push(item);
			removeDuplicates();
			let selectedValues = returnObject
				? items
				: bindValue
					? items.map(v => v[bindValue as any]).join(',')
					: items.join(',');
			selectedValues =
				!multiSelect && Array.isArray(selectedValues) ? selectedValues?.[0] : selectedValues;
			onUpdateValue(selectedValues);
		} else {
			onUpdateValue(newVal);
		}
		if (!multiSelect) showDropdown = false;
	}

	function removeDuplicates() {
		items = items.reduce((acc, current) => {
			if (!acc.find((obj: any) =>
				bindValue ? obj[bindValue] === current[bindValue] : obj === current
			)) {
				acc.push(current);
			}
			return acc;
		}, []);
	}

	function isExistsInDropdown(newVal: string | Record<string, any>): boolean {
		if (!options?.length) return false;
		if (!bindValue) return options.includes(newVal);
		const bindKey = bindValue;
		return options.some(option => {
			const optionValue = option[bindKey];
			const newValue = typeof newVal === 'object' ? newVal[bindKey] : newVal;
			return optionValue == newValue;
		});
	}

	function getDisplayText(name: string | Record<string, any>): string {
		if (displayText?.length && typeof name === 'object') {
			return displayText.map(key => name[key] || '').filter(Boolean).join(' - ');
		}
		return String(name);
	}

	function handleClick(option: any) {
		if (selectedItem(option)) {
			if (multiSelect) removeItem(option);
			else showDropdown = false;
		} else {
			addItem(option);
		}
	}

	function removeItem(toRemoveItem: string | Record<string, any>) {
		const index = items.findIndex(item => {
			if (typeof item === 'string' && typeof toRemoveItem === 'string') return item === toRemoveItem;
			if (typeof item === 'object' && typeof toRemoveItem === 'object' && bindValue)
				return item[bindValue] === toRemoveItem[bindValue];
			return false;
		});
		if (index !== -1) {
			items.splice(index, 1);
			const updatedItems = items.map(item => {
				if (typeof item === 'string') return item;
				if (returnObject) return item;
				if (bindValue) return item[bindValue];
			});
			onUpdateValue(updatedItems);
			if (!multiSelect) inputValue = '';
		}
	}

	function selectedItem(option: Record<string, any>): boolean {
		const selectedItems = Array.isArray(items) ? items : [items];
		return selectedItems.some(item =>
			bindValue
				? option[bindValue] === item || item[bindValue] === option[bindValue]
				: item === option
		);
	}

	function showDropdownList() {
		showAllList = true;
		showDropdown = true;
	}
</script>

<div
	class="w-full rounded-lg"
	use:clickOutside={() => (showDropdown = false)}
>
	{#if multiSelect && items.length > 0}
		<div class="mb-1 w-full">
			{@render ChipRow(items, removeItems, openMoreItems, v => (openMoreItems = v))}
		</div>
	{/if}

	<div
		role="button"
		tabindex="0"
		onclick={showDropdownList}
		onkeydown={e => e.key === 'Enter' && showDropdownList()}
		class={`relative flex flex-wrap items-center gap-2 rounded-md border bg-primary ${
			errorMsg ? 'border border-red-300' : 'border-primary'
		}`}
	>
		{#if icon}
			<span class="text-highlight/80 absolute inset-y-0 left-0 flex items-center justify-center border-primary px-2">
				<i class={`bi ${icon} text-sm`}></i>
			</span>
		{/if}

		{#if !hideInput}
			<input
				type="search"
				bind:value={inputValue}
				placeholder={placeholder ? placeholder : canAddNew ? 'Choose or enter options:' : 'Choose options:'}
				oninput={() => {
					showAllList = false;
					showDropdown = true;
					handleChangeInput?.(inputValue);
				}}
				onkeydown={e => {
					if (e.key === 'Enter') { e.preventDefault(); addItem(inputValue); }
				}}
				{disabled}
				autocomplete="new-password"
				{id}
				class={`block w-full cursor-pointer rounded-md border-none sm:py-3 pr-7! font-normal text-black ${icon ? 'pl-10!' : 'pl-4!'} outline-none! sm:leading-6 ${classes}`}
			/>
		{/if}

		<span class="absolute -top-2.5 left-3 px-1 text-sm">{label}</span>
		<button
			type="button"
			class="bi bi-caret-down-fill absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent! text-[#22242F] opacity-70"
			onclick={e => { e.preventDefault(); showDropdownList(); }}
			onkeydown={e => e.key === 'Enter' && showDropdownList()}
			aria-label="Toggle dropdown"
		></button>
	</div>

	{#if showDropdown}
		<div class={`absolute left-0 right-0 top-full z-1000 mt-1 w-full min-w-60 cursor-pointer bg-primary p-2 text-sm font-normal shadow-2xl ${hideInput ? 'w-60' : ''}`}>
			<div class="firefox-scrollbar mt-1 max-h-48 overflow-y-auto rounded-lg border-primary p-2">
				{#if !searchedOptions()?.length}
					<dt>No search results found!</dt>
				{:else}
					{#each searchedOptions() as option, ind (ind)}
						<button
							type="button"
							class={`w-full cursor-pointer p-2 text-left hover:bg-sky-50! hover:font-medium ${selectedItem(option) ? 'bg-sky-100! bg-opacity-50 font-medium' : ''}`}
							onclick={e => { e.preventDefault(); handleClick(option); }}
							onkeydown={e => e.key === 'Enter' && handleClick(option)}
						>
							{#if multiSelect}
								<label>
									<input type="checkbox" checked={selectedItem(option)} class="mr-2" />
									{getDisplayText(option)}
								</label>
							{:else}
								{getDisplayText(option)}
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

{#snippet ChipRow(
	chipItems: any[],
	onRemove: (id: string | number) => void,
	openFlag: boolean,
	setOpen: (val: boolean) => void
)}
	{@const rest = chipItems.slice(1)}
	<div class="flex h-10 items-center gap-2">
		<div class="min-w-0 flex-1">
			<div class="flex h-10 flex-wrap items-center gap-2 overflow-hidden">
				<span class="inline-flex max-w-full items-center gap-2 rounded-lg border bg-white px-2.5 py-1 text-xs">
					<span class="max-w-[20rem] truncate font-medium">{chipItems[0].name || chipItems[0].label}</span>
					<button
						type="button"
						class="bi bi-x shrink-0 text-sm"
						onclick={() => onRemove(chipItems[0].id || chipItems[0].value)}
						aria-label="Remove {chipItems[0].name || chipItems[0].label}"
					></button>
				</span>
			</div>
		</div>

		{#if rest.length}
			<div class="relative shrink-0">
				<button
					type="button"
					class="rounded-lg border bg-white px-2.5 py-1 text-[11px]"
					onclick={() => setOpen(!openFlag)}
				>
					+{rest.length} more
				</button>

				{#if openFlag}
					<div class="absolute right-0 top-full z-2000 mt-2 max-h-48 w-72 overflow-auto rounded-xl border bg-white p-2 shadow">
						<div class="flex flex-wrap gap-2">
							{#each rest as it (it.id)}
								<span class="inline-flex max-w-full items-center gap-2 rounded-lg border bg-white px-2.5 py-1 text-xs">
									<span class="max-w-48 truncate font-medium">{it.name}</span>
									<button
										type="button"
										aria-label="Remove {it.name}"
										class="bi bi-x text-sm"
										onclick={() => onRemove(it.id)}
									></button>
								</span>
							{/each}
						</div>
						<div class="mt-2 text-right">
							<button class="text-[11px] underline" onclick={() => setOpen(false)}>Close</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}


<script lang="ts">
	import { clickOutside as useClickOutside, isValidDateString } from '@aryagg/utils';
	import { MONTHS, DAYS } from '@aryagg/types';
	import type { ICalendarDate, ICalendarOption, IFormField } from '@aryagg/types';

	let {
		onUpdateValue,
		field,
		placeholder,
		selected,
		minDate = '',
		maxDate = '' // '10/29/2025' format
	}: {
		placeholder: string;
		selected?: string;
		onUpdateValue: (val: any) => void;
		field: IFormField;
		minDate?: string;
		maxDate?: string;
	} = $props();

	let today: Date = new Date(),
		date: string = $state(''),
		selectedMonthYear: Date | null = $state(today),
		isCalendarOpen: boolean = $state(false),
		displayYMEdit: boolean = $state(false),
		optionsMY: ICalendarOption[] = $state([
			{
				key: 'month',
				options: MONTHS,
				value: ''
			},
			{
				key: 'year',
				options: Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i),
				// This gives a range of 100 years centered around the current year
				value: ''
			}
		]),
		currentDay: number = $state(today.getDate());

	// Initialize with field value if it exists
	$effect(() => {
		if (selected && typeof selected === 'string' && selected.trim() !== '') {
			const existingDate = new Date(selected);
			if (!isNaN(existingDate.getTime())) {
				date = existingDate.toLocaleDateString('en-US');
				selectedMonthYear = new Date(existingDate.getFullYear(), existingDate.getMonth(), 1);
				currentDay = existingDate.getDate();
			}
		}
		// else if (selected && selected instanceof Date && !isNaN(selected.getTime())) {
		// 	date = selected.toLocaleDateString('en-US');
		// 	selectedMonthYear = new Date(selected.getFullYear(), selected.getMonth(), 1);
		// 	currentDay = selected.getDate();
		// }
	});

	const dates = $derived(() => {
		const selected = selectedMonthYear || today;
		const month = selected.getMonth();
		const year = selected.getFullYear();

		const firstDayOfMonth = new Date(year, month, 1);
		const startWeekday = firstDayOfMonth.getDay(); // Sunday = 0

		const lastDayOfMonth = new Date(year, month + 1, 0);
		const daysInMonth = lastDayOfMonth.getDate();

		const daysInLastMonth = new Date(year, month, 0).getDate();

		let dates = [];

		// Add days from previous month (if month doesn't start on Sunday)
		if (startWeekday !== 0) {
			for (let i = daysInLastMonth - startWeekday + 1; i <= daysInLastMonth; i++) {
				const calendarDate = getDate(i, 'prev');
				dates.push({
					day: i,
					from: 'prev',
					date: calendarDate,
					isDisabled: disableDate(calendarDate)
				});
			}
		}

		// Add days from current month
		for (let i = 1; i <= daysInMonth; i++) {
			const calendarDate = getDate(i);
			dates.push({
				day: i,
				from: 'current',
				date: calendarDate,
				isDisabled: disableDate(calendarDate)
			});
		}

		// Add days from next month to fill 42-day grid (6 weeks × 7 days)
		let nextMonthDay = 1;
		while (dates.length < 42) {
			const calendarDate = getDate(nextMonthDay, 'next');
			dates.push({
				day: nextMonthDay,
				from: 'next',
				date: calendarDate,
				isDisabled: disableDate(calendarDate)
			});
			nextMonthDay++;
		}

		return dates as ICalendarDate[];
	});

	function getDate(day: number, month?: 'next' | 'prev') {
		const currentViewDate = selectedMonthYear || today;
		let selectedDate;
		if (month === 'next') {
			selectedDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, day);
		} else if (month === 'prev') {
			selectedDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, day);
		} else {
			selectedDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);
		}
		return selectedDate.toLocaleDateString('en-US');
	}

	function disableDate(date: string): boolean {
		if (!date) return true;
		let currDate = new Date(date);
		if (!isValidDateString(date)) return true; // Invalid date

		if (minDate) {
			const minimumDate = new Date(minDate);
			if (
				currDate <
				new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate())
			) {
				return true;
			}
		}

		if (maxDate) {
			const maximumDate = new Date(maxDate);
			if (
				currDate >
				new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate())
			) {
				return true;
			}
		}

		return false;
	}

	const footerBtns = [
		{
			label: 'Reset',
			click: () => {
				selectedMonthYear = new Date(today);
				currentDay = today.getDate();
				date = today.toLocaleDateString('en-US');
			}
		},
		{
			label: 'Close',
			click: () => {
				close();
			}
		},
		{
			label: 'Clear',
			click: () => {
				selectedMonthYear = new Date(today);
				currentDay = -1;
				date = '';
			}
		}
	];

	$effect(() => {
		if (!selectedMonthYear) return;
		const month = optionsMY.find(o => o.key === 'month');
		if (month) {
			month.value = MONTHS[selectedMonthYear.getMonth()];
		}
		const year = optionsMY.find(o => o.key === 'year');
		if (year) year.value = selectedMonthYear.getFullYear();
	});

	function getNextMonth() {
		let now = new Date(selectedMonthYear || today);
		selectedMonthYear = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	}

	function getPrevMonth() {
		let now = new Date(selectedMonthYear || today);
		selectedMonthYear = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	}

	function toggleCalendar() {
		if (!field.disabled) {
			isCalendarOpen = !isCalendarOpen;
		}
	}

	function selectDate(dateObj: ICalendarDate) {
		if (dateObj.isDisabled) {
			if (dateObj.from === 'prev') {
				getPrevMonth();
			} else if (dateObj.from === 'next') {
				getNextMonth();
			}
			return;
		}
		date = dateObj.date;
		currentDay = dateObj.day;
		close();
	}

	function close() {
		isCalendarOpen = false;
		displayYMEdit = false;
		onUpdateValue(date);
	}

	function handleYMChange(selector: ICalendarOption) {
		const currSelectedDate = new Date(selectedMonthYear || today);
		if (selector.key === 'month') {
			const monthInd = MONTHS.indexOf(selector.value as string);
			if (monthInd > -1) {
				currSelectedDate.setMonth(monthInd);
			}
		} else {
			currSelectedDate.setFullYear(selector.value as number);
		}
		selectedMonthYear = currSelectedDate;
	}
</script>

<div
	class="relative w-full"
	use:useClickOutside={() => {
		if (isCalendarOpen) close();
	}}
>
	<!-- Date Input Field -->
	<button
		aria-label="Toggle Calendar"
		aria-expanded={isCalendarOpen}
		disabled={field.disabled}
		onclick={toggleCalendar}
		class="group flex w-full items-center gap-2 rounded-lg border bg-background p-3 text-left transition
           hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
		class:border-red-300={field.errorMsg}
	>
		<i class="bi bi-calendar3 text-base text-slate-500 group-hover:text-slate-700"></i>

		<input
			type="text"
			readonly
			disabled={field.disabled}
			placeholder={placeholder ?? 'Select date'}
			bind:value={date}
			class="w-full cursor-pointer border-0 bg-transparent p-0! placeholder:text-slate-400"
			autocomplete="off"
		/>
	</button>
	<!-- Calendar Dropdown -->
	{#if isCalendarOpen}
		<div
			class="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-primary bg-primary p-4 shadow-2xl"
		>
			<!-- Calendar Header -->
			<div class="flex items-center justify-between gap-1 border-b border-primary py-1">
				<button
					onclick={getPrevMonth}
					aria-label="Previous month"
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:scale-110 hover:bg-blue-100! hover:text-blue-600"
				>
					<i class="bi bi-chevron-left text-sm font-bold"></i>
				</button>

				<div
					class={`w-full flex-auto text-center ${displayYMEdit && ' flex justify-between gap-2'}`}
				>
					{#if displayYMEdit}
						{#each optionsMY as selector (selector.key)}
							<select
								name={selector.key}
								id={selector.key}
								bind:value={selector.value}
								class="w-full rounded-lg border border-primary px-2 py-1"
								onchange={() => handleYMChange(selector)}
							>
								{#each selector.options as option, oInd (oInd)}
									<option value={option}>{option}</option>
								{/each}
							</select>
						{/each}
					{:else}
						<button class="text-center text-base font-bold" onclick={() => (displayYMEdit = true)}>
							{(selectedMonthYear || today)?.toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long'
							})}
						</button>
					{/if}
				</div>

				<button
					onclick={getNextMonth}
					aria-label="Next Month"
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:scale-110 hover:bg-blue-100! hover:text-blue-600"
				>
					<i class="bi bi-chevron-right text-sm font-bold"></i>
				</button>
			</div>

			<div>
				<!-- Day Labels -->
				<div class="mb-2 grid grid-cols-7 gap-1">
					{#each DAYS as day, dInd (dInd)}
						<div class="icon-color flex h-8 items-center justify-center text-xs font-semibold">
							{day.slice(0, 2)}
						</div>
					{/each}
				</div>
				<!-- Calendar Grid -->
				<div class="grid grid-cols-7 gap-2">
					{#each dates() as dateObj, ind (ind)}
						<button
							class={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
								dateObj.isDisabled
									? 'text-slate-300 hover:bg-slate-50! hover:text-slate-400'
									: dateObj.day === currentDay && dateObj.from === 'current'
										? 'bg-blue-500! text-white shadow-md hover:bg-blue-600!'
										: 'text-slate-700 hover:bg-blue-50! hover:text-blue-600'
							}`}
							onclick={() => selectDate(dateObj)}
						>
							{dateObj.day}

							<!-- Today indicator -->
							{#if dateObj.day === currentDay && dateObj.from === 'current'}
								<div
									class="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
								></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Calendar Footer -->
			<div class="flex items-center justify-end gap-4 border-t border-primary pt-2">
				{#each footerBtns as btn, bInd (bInd)}
					<div class="group relative inline-block cursor-pointer">
						<button
							class="icon-color text-xs transition-colors duration-200 hover:text-blue-600"
							onclick={btn.click}
						>
							{btn.label}
						</button>
						<span
							class="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"
						></span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

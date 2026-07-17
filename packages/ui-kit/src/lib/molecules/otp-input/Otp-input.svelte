<script lang="ts">
	let {
		length = 6,
		value = $bindable(''),
		disabled = false,
		autoFocus = true,
		klass = 'size-12 rounded-lg border text-center text-xl font-semibold transition duration-200 focus:ring-2',
		allowNumberOnly = true
	} = $props<{
		length?: number;
		value?: string;
		disabled?: boolean;
		autoFocus?: boolean;
		klass?: string;
		allowNumberOnly?: boolean;
	}>();

	let inputs = $state<HTMLInputElement[]>([]),
		error = $state<boolean[]>([]);
	// Directly manage boxes as state
	let boxes = $state(Array(length).fill(''));

	// Sync external value changes to boxes
	$effect(() => {
		const chars = (value ?? '').split('');
		for (let i = 0; i < length; i++) {
			boxes[i] = chars[i] ?? '';
		}
	});

	const updateValue = () => {
		value = boxes.join('');
	};

	const focusIndex = (i: number) => {
		inputs[i]?.focus();
	};

	// Inside handleInput, clear error when user types
const handleInput = (i: number, e: Event) => {
    error[i] = false; // Reset error when user starts typing again
    
    const input = e.target as HTMLInputElement;
    let v = input.value;

    if (allowNumberOnly && /\D/.test(v)) {
        input.value = '';
        boxes[i] = '';
        error[i] = true; // Set error if invalid character entered
        return;
    }

    if (v.length > 0) {
        boxes[i] = v.slice(-1);
        updateValue();
        if (i < length - 1) focusIndex(i + 1);
    }
};
	const handleKey = (i: number, e: KeyboardEvent) => {
		if (e.key === 'Backspace') {
			// If the current box is already empty, move to the previous one and clear it
			if (!boxes[i] && i > 0) {
				boxes[i - 1] = '';
				focusIndex(i - 1);
			}
			// If the current box has a value, clear it.
			// We do NOT move focus here, so the user can re-type in the same box.
			else {
				boxes[i] = '';
			}
			updateValue();
		} else if (e.key === 'ArrowLeft' && i > 0) {
			focusIndex(i - 1);
		} else if (e.key === 'ArrowRight' && i < length - 1) {
			focusIndex(i + 1);
		}
	};

	const handlePaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const data = e.clipboardData?.getData('text') ?? '';
		const cleaned = allowNumberOnly ? data.replace(/\D/g, '') : data;

		cleaned.split('').forEach((char, index) => {
			if (index < length) boxes[index] = char;
		});
		updateValue();
		focusIndex(Math.min(cleaned.length, length - 1));
	};

	 const setError = (index: number, isError: boolean) => {
    error[index] = isError;
};

	$effect(() => {
		if (autoFocus && inputs[0]) inputs[0].focus();
	});
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex gap-2" onpaste={handlePaste}>
		{#each boxes as _, i}
			<input
				bind:this={inputs[i]}
				value={boxes[i]}
				oninput={(e) => handleInput(i, e)}
				onkeydown={(e) => handleKey(i, e)}
				type="text"
				inputmode={allowNumberOnly ? 'numeric' : 'text'}
				maxlength="1"
				{disabled}
				class="{klass} {error[i]
					? 'border-error bg-error/10 ring-error'
					: boxes[i]
						? 'border-success/50 bg-success/50 ring-success'
						: 'ring-info'}"
				placeholder="0"
				aria-label="Digit {i + 1}"
			/>
		{/each}
	</div>
</div>

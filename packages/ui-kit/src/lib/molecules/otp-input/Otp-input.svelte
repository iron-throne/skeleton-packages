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
        allowNumberOnly?: boolean
    }>();

    let inputs = $state<HTMLInputElement[]>([]);
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

    const handleInput = (i: number, e: Event) => {
        const input = e.target as HTMLInputElement;
        let v = input.value;
        
        if (allowNumberOnly) v = v.replace(/\D/g, '');
        
        boxes[i] = v.slice(-1);
        updateValue();

        if (boxes[i] && i < length - 1) focusIndex(i + 1);
    };

    const handleKey = (i: number, e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!boxes[i] && i > 0) focusIndex(i - 1);
            else boxes[i] = '';
            updateValue();
        } else if (e.key === 'ArrowLeft' && i > 0) focusIndex(i - 1);
        else if (e.key === 'ArrowRight' && i < length - 1) focusIndex(i + 1);
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

    $effect(() => {
        if (autoFocus && inputs[0]) inputs[0].focus();
    });
</script>

<div class="flex flex-col items-center gap-3">
    <span class="text-sm font-medium text-gray-600">Enter Verification Code</span>
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
                class="{klass} {boxes[i] 
                    ? 'border-green-500 bg-green-50 ring-green-500' 
                    : 'border-gray-300 ring-blue-500'}"
                placeholder="0"
                aria-label="Digit {i + 1}"
            />
        {/each}
    </div>
</div>
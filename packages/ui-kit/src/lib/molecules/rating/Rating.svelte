<script lang="ts">
	import Icon from '$lib/atoms/icon/Icon.svelte';
	import { ICON_SIZE_CLASS } from '$lib/constants';
	import { ESize } from '@aryagg/types';
	import { Star, StarFill } from 'svelte-bootstrap-icons';
	import type { RatingProps } from './types';

	let {
		length = 5,
		value = $bindable(0),
		size = ESize.MD,
		icon = Star,
		selectedIcon = StarFill,
		readonly = false,
		disabled = false,
		allowClear = false,
		label = 'Rating',
		class: className = '',
		itemClass = '',
		iconClass = '',
		selectedClass = '',
		iconKlass = '',
		selectedKlass = '',
		onChange
	}: RatingProps = $props();

	let hoverValue = $state(0);
	const safeLength = $derived(Math.max(1, Math.floor(length)));
	const ratingValues = $derived(Array.from({ length: safeLength }, (_, index) => index + 1));
	const displayValue = $derived(hoverValue || Math.min(Math.max(value, 0), safeLength));
	const interactive = $derived(!readonly && !disabled);

	function select(nextValue: number) {
		if (!interactive) return;
		const next = allowClear && value === nextValue ? 0 : nextValue;
		value = next;
		onChange?.(next);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		// eslint-disable-next-line no-useless-assignment
		let next = value;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(value + 1, safeLength);
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(value - 1, 0);
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = safeLength;
		else return;
		event.preventDefault();
		value = next;
		onChange?.(next);
	}
</script>

<div
	class="inline-flex items-center gap-1 {disabled ? 'cursor-not-allowed opacity-50' : readonly ? '' : 'cursor-pointer'} {className}"
	role="radiogroup"
	tabindex="-1"
	aria-label={label}
	aria-readonly={readonly}
	aria-disabled={disabled}
	onmouseleave={() => (hoverValue = 0)}
	onkeydown={handleKeydown}
>
	{#each ratingValues as ratingValue, index (ratingValue)}
		{@const selected = displayValue >= ratingValue}
		<button
			type="button"
			role="radio"
			aria-checked={value === ratingValue}
			aria-label="{ratingValue} of {safeLength} stars"
			title="{ratingValue} of {safeLength}"
			tabindex={interactive && (value === ratingValue || (value === 0 && index === 0)) ? 0 : -1}
			disabled={disabled}
			class="grid place-items-center border-0! bg-transparent! p-0.5! transition duration-150 {interactive ? 'hover:scale-110 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-accent' : 'cursor-default'} {itemClass}"
			onmouseenter={() => interactive && (hoverValue = ratingValue)}
			onfocus={() => interactive && (hoverValue = ratingValue)}
			onblur={() => (hoverValue = 0)}
			onclick={() => select(ratingValue)}
		>
			<Icon
				icon={selected ? selectedIcon : icon}
				klass="{ICON_SIZE_CLASS[size] ?? ICON_SIZE_CLASS[ESize.MD]} {selected
					? selectedKlass || selectedClass || 'text-warning'
					: iconKlass || iconClass || 'text-tertiary'}"
			/>

		</button>
	{/each}
</div>

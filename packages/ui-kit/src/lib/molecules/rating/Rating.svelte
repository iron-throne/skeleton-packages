<script lang="ts">
	import { Icon } from '$lib/atoms';
	import { Star, StarFill } from 'svelte-bootstrap-icons';

	let {
		length = 5,
		value = $bindable(0),
		icon = Star,
		selectedIcon = StarFill,
		iconKlass = '',
		selectedKlass = 'text-accent',
		readonly = false
	}: {
		length?: number;
		value?: number;
		icon?: any;
		selectedIcon?: any;
		readonly?: boolean;
		iconKlass?: string;
		selectedKlass?: string;
	} = $props();

	let hoverIndex = $state(-1);

	const handleSelect = (index: number) => {
		if (!readonly) value = index + 1;
	};
</script>

<div class="flex gap-1 cursor-pointer">
	{#each Array(length) as _, i}
		{@const isSelected = hoverIndex >= i || value > i}
		<button
			type="button"
			class="border-none bg-transparent p-0 transition-transform hover:scale-110"
			onmouseenter={() => !readonly && (hoverIndex = i)}
			onmouseleave={() => !readonly && (hoverIndex = -1)}
			onclick={() => handleSelect(i)}
			aria-label="Rate {i + 1} stars"
		>
			<Icon
				icon={isSelected ? selectedIcon : icon}
				klass={isSelected ? selectedKlass : iconKlass}
			/>
		</button>
	{/each}
</div>

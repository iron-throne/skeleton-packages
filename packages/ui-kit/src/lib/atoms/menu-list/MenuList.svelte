<script lang="ts">
	import DropdownMenuItem from '../dropdown/DropdownMenuItem.svelte';
	import type { DropdownItem } from '../dropdown/types';
	import type { MenuListProps } from './types';

	let {
		menus,
		align = 'right',
		variant = 'v3',
		menuClass,
		activeKlass,
		selected = $bindable(),
		onSelect
	}: MenuListProps = $props();

	function selectItem(item: DropdownItem) {
		selected = item.id;
		item.onclick?.();
		onSelect?.(item);
	}
</script>

<div
	class="w-full overflow-auto border border-border-primary bg-surface-primary shadow-sm {variant ===
	'rounded'
		? 'rounded-xl'
		: 'rounded-lg'} {menuClass ?? ''}"
>
	{#each menus as menu, ind (menu.id ?? ind)}
		<DropdownMenuItem
			{menu}
			{align}
			{variant}
			onNavigate={selectItem}
			bind:selected
			{activeKlass}
		/>
	{/each}
</div>

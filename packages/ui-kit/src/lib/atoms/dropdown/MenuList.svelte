<script lang="ts">
	import DropdownMenuItem from './DropdownMenuItem.svelte';
	import type { DropdownItem, MenuListProps } from './types';

	let {
		menus,
		align = 'right',
		variant = 'v3',
		menuClass,
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
	class="w-full overflow-auto border border-border-primary bg-surface-primary shadow-lg {variant ===
	'rounded'
		? 'rounded-xl'
		: 'rounded-lg'} {menuClass ?? ''}"
>
	{#each menus as menu, ind (menu.id ?? ind)}
		<DropdownMenuItem {menu} {align} {variant} onNavigate={selectItem} bind:selected />
	{/each}
</div>

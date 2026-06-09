<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import clickOutside from '$lib/composables/clickOutside';

	type Align = 'left' | 'right';

	export interface MenuItem {
		label: string;
		icon?: any;
		onclick: () => void;
		divider?: boolean; // render a divider BEFORE this item
		danger?: boolean;
		disabled?: boolean;
	}

	let {
		items,
		align = 'right',
		trigger,
	}: {
		items: MenuItem[];
		align?: Align;
		/** The element that opens/closes the menu */
		trigger: Snippet<[{ open: boolean; toggle: () => void }]>;
	} = $props();

	let open = $state(false);
	const toggle = () => (open = !open);
	const close = () => (open = false);

	const alignClass: Record<Align, string> = {
		right: 'right-0',
		left: 'left-0',
	};
</script>

<div class="relative inline-block" use:clickOutside={close}>
	<!-- Trigger slot -->
	{@render trigger({ open, toggle })}

	<!-- Menu panel -->
	{#if open}
		<div
			transition:slide={{ duration: 300 }}
			class="bg-surface-primary! border-border-primary absolute z-50 mt-2 min-w-44
                   rounded-xl p-2 shadow-lg {alignClass[align]}"
			role="menu"
		>
			{#each items as item, ind (ind)}
				{#if item.divider}
					<div class="border-border-primary my-1 border-t"></div>
				{/if}
				<button
					role="menuitem"
					disabled={item.disabled}
					onclick={() => {
						item.onclick();
						close();
					}}
					class="group flex w-full justify-normal border-0 p-2 text-xs transition-colors rounded-2xl
                           {item.danger
						? 'text-error hover:bg-error/10'
						: 'hover:text-primary hover:bg-surface-secondary text-secondary '}"
				>
					{#if item.icon}
						<item.icon width={15} height={15} class="shrink-0 opacity-70" />
					{/if}
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

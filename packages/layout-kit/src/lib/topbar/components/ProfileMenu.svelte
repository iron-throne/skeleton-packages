<script lang="ts">
	import { Avatar, DropdownMenu } from '@aryagg/ui-kit';
	import { EMenuAlign, ESize, ESwitchLayout, type IMenu } from '@aryagg/types';
	import { CaretDownFill } from 'svelte-bootstrap-icons';

	let {
		src = '',
		name = '',
		label = '',
		items = [],
		onclick,
		avatarKlass = '',
		layout = ESwitchLayout.HORIZONTAL,
		klass = ''
	}: {
		src?: string;
		name?: string;
		label?: string;
		items?: IMenu[];
		onclick?: () => void;
		avatarKlass?: string;
		layout?: ESwitchLayout;
		klass?: string;
	} = $props();

	const isDropdown = $derived(items.length > 0);
	const isStacked = $derived(layout === ESwitchLayout.STACKED);
	const btnKlass = $derived(
		`flex items-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-1.5 text-secondary transition-colors hover:bg-surface-tertiary hover:text-accent ${isStacked ? 'text-[11px]!' : 'flex-row text-sm'} ${klass}`
	);
</script>

{#snippet avatarContent()}
	<div class="flex {isStacked ? 'flex-col' : ''}">
		<Avatar {src} {name} size={ESize.XS} {avatarKlass} />
		{#if label}
			<span class="hidden sm:inline {isStacked ? 'pt-1' : ''}">{label}</span>
		{/if}
	</div>
{/snippet}

{#if isDropdown}
	<DropdownMenu menus={items} align={EMenuAlign.RIGHT}>
		{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
			<button
				type="button"
				onclick={toggle}
				aria-label="Account"
				aria-expanded={open}
				class={btnKlass}
			>
				{@render avatarContent()}
				<CaretDownFill class="size-3 transition-transform {open ? 'rotate-180' : ''}" />
			</button>
		{/snippet}
	</DropdownMenu>
{:else if onclick}
	<button type="button" {onclick} aria-label="Account" class={btnKlass}>
		{@render avatarContent()}
	</button>
{:else}
	<div class={btnKlass}>
		{@render avatarContent()}
	</div>
{/if}

<script lang="ts">
	import { Avatar, DropdownMenu } from '@aryagg/ui-kit';
	import { EMenuAlign, ESize, type IMenu } from '@aryagg/types';
	import { CaretDownFill } from 'svelte-bootstrap-icons';

	let {
		avatarSrc = '',
		userName = '',
		profileLabel = '',
		profileItems = [],
		avatarKlass = '',
		klass = ''
	}: {
		avatarSrc?: string;
		userName?: string;
		profileLabel?: string;
		profileItems?: IMenu[];
		avatarKlass?: string;
		klass?: string;
	} = $props();

	const isDropdown = $derived(profileItems.length > 0);
</script>

{#snippet avatarTrigger(open: boolean, toggle?: () => void)}
	<button
		type="button"
		onclick={toggle}
		aria-label="User menu"
		aria-expanded={isDropdown ? open : undefined}
		class="flex items-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-1.5 text-secondary transition-colors hover:bg-surface-tertiary hover:text-accent {klass}"
	>
		<Avatar src={avatarSrc} name={userName} size={ESize.XS} {avatarKlass} />
		{#if profileLabel}
			<span class="hidden text-sm sm:inline">{profileLabel}</span>
		{/if}
		{#if isDropdown}
			<CaretDownFill class="size-3 transition-transform {open ? 'rotate-180' : ''}" />
		{/if}
	</button>
{/snippet}

{#if isDropdown}
	<DropdownMenu menus={profileItems} align={EMenuAlign.RIGHT}>
		{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
			{@render avatarTrigger(open, toggle)}
		{/snippet}
	</DropdownMenu>
{:else}
	{@render avatarTrigger(false)}
{/if}

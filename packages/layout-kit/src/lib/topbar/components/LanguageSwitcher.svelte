<script lang="ts">
	import { DropdownMenu } from '@aryagg/ui-kit';
	import { EPosition, ESwitchLayout, type IMenu } from '@aryagg/types';
	import { Globe2 } from 'svelte-bootstrap-icons';

	let {
		languages,
		currentLanguage = '',
		onLanguageChange,
		display = 'label',
		layout = ESwitchLayout.HORIZONTAL,
		klass = ''
	}: {
		languages: { label?: string; value?: string }[];
		currentLanguage?: string;
		onLanguageChange?: (value?: string) => void;
		display?: 'icon' | 'label' | 'both';
		layout?: ESwitchLayout;
		klass?: string;
	} = $props();
</script>

<DropdownMenu
	menus={languages.map((l) => ({
		label: l.label,
		id: l.value ?? l.label,
		onclick: () => onLanguageChange?.(l.value)
	})) as IMenu[]}
	align={EPosition.RIGHT}
>
	{#snippet trigger({ toggle }: { toggle: () => void })}
		<button
			type="button"
			onclick={toggle}
			aria-label="Switch language"
			class="flex items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 py-1.5 text-secondary transition-colors hover:bg-surface-tertiary hover:text-accent {layout ===
			'stacked'
				? 'flex-col text-[11px]!'
				: 'flex-row text-sm'} {klass}"
		>
			{#if display !== 'label'}<Globe2 class="size-5" />{/if}
			{#if display !== 'icon'}<span class="uppercase pt-1">{currentLanguage}</span>{/if}
		</button>
	{/snippet}
</DropdownMenu>

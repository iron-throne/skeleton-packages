<script lang="ts">
	import { ETheme, EStorageKey } from '@aryagg/types';
	import { Moon, Sun } from 'svelte-bootstrap-icons';
	import { enableDarkTheme, enableLightTheme } from '@aryagg/utils';

	let {
		theme = $bindable(ETheme.LIGHT),
		themeStorageKey = EStorageKey.THEME,
		onThemeChange,
		display = 'icon',
		layout = 'horizontal',
		klass = ''
	}: {
		theme?: ETheme;
		themeStorageKey?: string;
		onThemeChange?: (theme?: ETheme) => void;
		display?: 'icon' | 'label' | 'both';
		layout?: 'stacked' | 'horizontal';
		klass?: string;
	} = $props();

	function toggle() {
		theme = theme === ETheme.DARK ? ETheme.LIGHT : ETheme.DARK;
		if (theme === ETheme.DARK) {
			enableDarkTheme(themeStorageKey);
		} else {
			enableLightTheme(themeStorageKey);
		}
		onThemeChange?.(theme);
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label="Toggle theme"
	class="flex items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 py-1.5 text-secondary transition-colors hover:bg-surface-tertiary hover:text-accent {layout ===
	'stacked'
		? 'flex-col text-[11px]!'
		: 'flex-row text-sm'} {klass}"
>
	{#if theme === ETheme.LIGHT}
		{#if display !== 'label'}<Sun class="size-5" />{/if}
		{#if display !== 'icon'}<span>Light</span>{/if}
	{:else}
		{#if display !== 'label'}<Moon class="size-5" />{/if}
		{#if display !== 'icon'}<span>Dark</span>{/if}
	{/if}
</button>

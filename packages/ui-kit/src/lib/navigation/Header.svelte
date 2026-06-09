<script lang="ts">
	import { browser } from '$app/environment';
	import Globe2 from 'svelte-bootstrap-icons/lib/Globe2.svelte';
	import { Sun, Moon } from 'svelte-bootstrap-icons';
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime';
	import { enableDarkTheme, enableLightTheme } from '$lib/utils/theme';
	import { getItem, setItem } from '$lib/utils';
	import { EStorageKey, EThemes } from '$lib/types';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	/**
	 * When true (default) the header floats fixed in the top-right corner of the viewport.
	 * Set to false to render the controls inline (e.g. inside a top bar).
	 */
	let { floating = true }: { floating?: boolean } = $props();

	let currentLocale = $state('en');
	let isDarkMode = $state(false);

	onMount(() => {
		if (browser) {
			const savedLocale = getItem(EStorageKey.LANGUAGE);
			currentLocale = savedLocale ?? getLocale();
			if (savedLocale) setLocale(savedLocale);
			isDarkMode =
				getItem(EStorageKey.THEME) === EThemes.DARK ||
				(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	});

	const handleThemeToggle = () => {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			enableDarkTheme();
		} else {
			enableLightTheme();
		}
		setItem(EStorageKey.THEME, isDarkMode ? EThemes.DARK : EThemes.LIGHT);
	};

	const handleLanguageChange = (locale: string) => {
		currentLocale = locale;
		setLocale(locale);
		setItem(EStorageKey.LANGUAGE, locale);
	};
</script>

<div
	class="{floating
		? 'sticky top-0 z-50'
		: 'relative'} bg-surface-secondary flex w-full items-center gap-2 px-10 py-4"
>
	<div class="">
		{env.PUBLIC_SITE_NAME}
	</div>
	<div class="flex flex-1 justify-end gap-4">
		<!-- Language switcher -->
		<div class="group relative">
			<button
				class="btn hover:bg-surface-secondary flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
			>
				<Globe2 width="16" height="16" />
				<span class="uppercase">{currentLocale}</span>
			</button>
			<div
				class="bg-surface-primary absolute top-full right-0 mt-1 hidden min-w-24 flex-col overflow-hidden rounded-lg border shadow-lg group-focus-within:flex"
			>
				{#each locales as locale, ind (ind)}
					<button
						onclick={() => handleLanguageChange(locale)}
						class="hover:bg-surface-secondary px-4 py-2 text-left text-sm transition-colors {locale ===
						currentLocale
							? 'text-accent font-semibold'
							: 'text-content-primary'}"
					>
						{locale.toUpperCase()}
					</button>
				{/each}
			</div>
		</div>

		<!-- Theme toggle -->
		<button
			onclick={handleThemeToggle}
			class="btn btn-ghost hover:bg-surface-secondary rounded-lg border p-2 transition-colors"
			aria-label="Toggle theme"
		>
			{#if isDarkMode}
				<Sun width="18" height="18" />
			{:else}
				<Moon width="18" height="18" />
			{/if}
		</button>
	</div>
</div>

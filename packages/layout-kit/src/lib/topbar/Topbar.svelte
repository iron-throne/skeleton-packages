<script lang="ts">
	import type { TopbarProps } from './types';
	import HeaderNavList from './components/HeaderNavList.svelte';
	import LanguageSwitcher from './components/LanguageSwitcher.svelte';
	import ThemeToggle from './components/ThemeToggle.svelte';
	import ProfileMenu from './components/ProfileMenu.svelte';

	let {
		title = '',
		logoSrc = '',
		logoAlt = 'Logo',
		href = '/',

		variant = 'inline',

		klass = '',
		classes = {},

		leftSlot,
		midSlot,
		children,

		nav,
		languageSwitch,
		themeSwitch,

		profile
	}: TopbarProps = $props();
</script>

<header class="flex w-full flex-col bg-surface-primary  {klass}">
	<div
		class="flex w-full items-center gap-4 px-4 {variant === 'stacked'
			? 'py-2'
			: ''} {classes.main}"
	>
		{#if leftSlot}
			<div class="flex shrink-0 items-center gap-2">{@render leftSlot()}</div>
		{/if}

		{#if logoSrc || title}
			<a {href} class="flex shrink-0 items-center gap-2 text-primary no-underline">
				{#if logoSrc}
					<img src={logoSrc} alt={logoAlt} class="size-8 object-contain" />
				{/if}
				{#if title}
					<span class="text-sm font-bold whitespace-nowrap">{title}</span>
				{/if}
			</a>
		{/if}

		{#if midSlot}
			{@render midSlot()}
		{/if}

		{#if nav && variant !== 'stacked'}
			<HeaderNavList {...nav} />
		{/if}

		<div class="ml-auto flex min-w-0 items-center gap-3">
			{@render children?.()}

			{#if languageSwitch}
				<LanguageSwitcher {...languageSwitch} />
			{/if}

			{#if themeSwitch}
				<ThemeToggle {...themeSwitch} />
			{/if}
			{#if profile}
				<ProfileMenu {...profile} />
			{/if}
		</div>
	</div>

	{#if nav && variant === 'stacked'}
		<div class="flex w-full items-center border-y border-border-primary px-4 py-1.5 {classes.nav}">
			<HeaderNavList {...nav} />
		</div>
	{/if}
</header>

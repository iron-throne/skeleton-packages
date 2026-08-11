<script lang="ts">
	import { Avatar } from '@aryagg/ui-kit';
	import { ESize } from '@aryagg/types';
	import type { TopbarProps } from './types';
	import HeaderNavList from './components/HeaderNavList.svelte';
	import LanguageSwitcher from './components/LanguageSwitcher.svelte';
	import ThemeToggle from './components/ThemeToggle.svelte';

	let {
		title = '',
		logoSrc = '',
		logoAlt = 'Logo',
		href = '/',

		klass = '',

		leftSlot,
		midSlot,
		children,

		nav,
		languageSwitch,
		themeSwitch,

		avatarSrc = '',
		avatarName = '',
		avatarKlass = '',
		onAvatarClick
	}: TopbarProps = $props();
</script>

<header
	class="flex w-full items-center gap-4 border-b border-border-primary bg-surface-primary px-4 {klass}"
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

	{#if nav}
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
		{#if avatarSrc || avatarName}
			{#if onAvatarClick}
				<button
					type="button"
					onclick={onAvatarClick}
					aria-label="Account"
					class="rounded-full border-0 bg-transparent p-0"
				>
					<Avatar src={avatarSrc} name={avatarName} size={ESize.XS} klass={avatarKlass} />
				</button>
			{:else}
				<Avatar src={avatarSrc} name={avatarName} size={ESize.XS} klass={avatarKlass} />
			{/if}
		{/if}
	</div>
</header>

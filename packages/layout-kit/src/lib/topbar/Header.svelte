<script lang="ts">
	import { Avatar, DropdownMenu, Input } from '@aryagg/ui-kit';
	import { EInputType, EMenuAlign, ETheme, type IMenu } from '@aryagg/types';
	import { CaretDownFill, Globe2, Moon, Search, Sun } from 'svelte-bootstrap-icons';
	import HeaderNavList from './components/HeaderNavList.svelte';
	import type { HeaderProps } from './types';

	let {
		homeHref = '/',
		homeClass = '',
		logoSrc = '',
		logoAlt = 'Logo',
		brand = '',
		brandClass = '',
		brandHref,
		brandIcon,
		tagline = '',

		menus = [],
		items = [],
		activeHref = '',

		searchField,
		searchSlot = null,

		languages = [],
		currentLanguage = '',
		onLanguageChange,

		theme = ETheme.LIGHT,
		onThemeChange,

		avatarSrc = '',
		userName = '',
		profileLabel = '',
		profileItems = [],
		profileSlot = null,

		leftSlot = null,
		midSlot = null,
		rightSlot = null,
		actions,
		variant = 'default',
		hclass = '',
		klass = '',
		class: headerClass = ''
	}: HeaderProps = $props();

	const brandLink = $derived(brandHref ?? homeHref);
	const navItems = $derived((menus.length ? menus : items) as IMenu[]);

	function toggleTheme() {
		const next = theme === ETheme.DARK ? ETheme.LIGHT : ETheme.DARK;
		onThemeChange?.(next);
	}

</script>

{#snippet BrandMark()}
	{#if logoSrc || brand || brandIcon}
		<a
			href={brandLink}
			class="flex shrink-0 items-center gap-2 no-underline opacity-100 transition-opacity hover:opacity-80 {homeClass}"
			aria-label={brand}
			title={brand}
		>
			{#if logoSrc}
				<img alt={logoAlt} class="size-10 object-contain" src={logoSrc} />
			{:else if brandIcon}
				{@const BrandIcon = brandIcon}
				<BrandIcon class="size-5 text-accent" />
			{/if}
			{#if brand}
				<span class="text-primary text-sm font-bold whitespace-nowrap {brandClass}">{brand}</span>
			{/if}
		</a>
	{/if}
{/snippet}

{#snippet searchBar()}
	{#if searchSlot}
		{@render searchSlot()}
	{:else if searchField}
		<!-- <div class="relative min-w-45 sm:min-w-60 md:min-w-75"> -->
			<Input
				field={searchField}
			/>
		<!-- </div> -->
	{/if}
{/snippet}

{#snippet navList()}
	{#if navItems.length}
		<HeaderNavList items={navItems} {activeHref} />
	{/if}
{/snippet}

{#snippet profileMenu()}
	{#if profileSlot}
		{@render profileSlot()}
	{:else if userName || profileItems.length}
		<DropdownMenu menus={profileItems} align={EMenuAlign.RIGHT}>
			{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
				<button
					onclick={toggle}
					aria-label="User menu"
					aria-expanded={open}
					class="group text-secondary hover:text-accent/80! flex flex-col items-center gap-1 border-0 px-3 pt-0 pb-1 text-[11px] font-medium transition-colors"
				>
					<Avatar src={avatarSrc} name={userName} size="xs" />
					<div class="flex items-center gap-1">
						<span class="hidden sm:block">{profileLabel}</span>
						<CaretDownFill class="mt-0.5 size-3 transition-transform {open ? 'rotate-180' : ''}" />
					</div>
				</button>
			{/snippet}
		</DropdownMenu>
	{/if}
{/snippet}

{#snippet actionBar()}
	<div class="flex items-center gap-2">
		{#if actions}
			{@render actions()}
		{/if}

		{#if languages.length}
			<DropdownMenu
				menus={languages.map((l) => ({
					label: l.label,
					id: l.value ?? l.label,
					onclick: () => onLanguageChange?.(l.value)
				})) as IMenu[]}
				align={EMenuAlign.RIGHT}
			>
				{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
					<button
						onclick={toggle}
						aria-label="Switch language"
						aria-expanded={open}
						class="btn-ghost text-secondary hover:text-primary flex flex-col items-center gap-1 border-0 px-2 text-[11px] font-semibold"
					>
						<Globe2 class="size-5" />
						<div class="hidden uppercase sm:block">{currentLanguage}</div>
					</button>
				{/snippet}
			</DropdownMenu>
		{/if}

		{#if onThemeChange}
			<button
				onclick={toggleTheme}
				aria-label="Toggle theme"
				class="btn-ghost text-secondary hover:text-primary flex flex-col items-center gap-1 border-0 px-3 py-1 text-[11px] font-semibold"
			>
				{#if theme === ETheme.LIGHT}
					<Sun class="size-5" /><span class="hidden sm:block">Light</span>
				{:else}
					<Moon class="size-5" /><span class="hidden sm:block">Dark</span>
				{/if}
			</button>
		{/if}

		{@render profileMenu()}

		{#if rightSlot}
			{@render rightSlot()}
		{/if}
	</div>
{/snippet}

<header
	class="w-full border-b border-border-primary bg-surface-primary px-2 shadow-2xs backdrop-blur-sm {hclass} {headerClass}"
>
	{#if variant === 'stacked'}
		<div class="container mx-auto flex h-12 items-center gap-4 p-2 {klass}">
			{#if leftSlot}
				<div class="flex items-center gap-2">{@render leftSlot()}</div>
			{/if}
			{@render BrandMark()}
			<div class="ml-auto flex items-center gap-3">
				{@render searchBar()}
				{@render actionBar()}
			</div>
		</div>
		<div class="border-t border-border-primary">
			<div class="container mx-auto flex h-10 items-center justify-center px-2">
				{@render navList()}
			</div>
		</div>
	{:else if variant === 'centered'}
		<div
			class="container mx-auto grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4 px-2 {klass}"
		>
			<div class="flex items-center gap-2">
				{#if leftSlot}{@render leftSlot()}{/if}
				{@render BrandMark()}
			</div>
			<div class="flex items-center justify-center gap-4">
				{@render navList()}
				{#if midSlot}{@render midSlot()}{/if}
			</div>
			<div class="flex items-center gap-3">
				{@render searchBar()}
				{@render actionBar()}
			</div>
		</div>
	{:else if variant === 'minimal'}
		<div
			class="container mx-auto grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4 px-2 {klass}"
		>
			<div class="flex items-center gap-2">
				{#if leftSlot}{@render leftSlot()}{/if}
				{@render BrandMark()}
			</div>
			{#if midSlot}
				<div class="flex justify-center">{@render midSlot()}</div>
			{:else if tagline}
				<p class="text-tertiary text-center text-sm">{tagline}</p>
			{:else}
				<span></span>
			{/if}
			<div class="flex items-center gap-3">
				{@render searchBar()}
				{@render actionBar()}
			</div>
		</div>
	{:else}
		<div class="container mx-auto flex h-14 items-center gap-4 px-2 {klass}">
			{#if leftSlot}
				<div class="flex items-center gap-2">{@render leftSlot()}</div>
			{/if}
			{@render BrandMark()}
			{@render navList()}
			{#if midSlot}
				<div class="flex items-center gap-2">{@render midSlot()}</div>
			{/if}
			<div class="ml-auto flex items-center gap-3">
				{@render searchBar()}
				{@render actionBar()}
			</div>
		</div>
	{/if}
</header>

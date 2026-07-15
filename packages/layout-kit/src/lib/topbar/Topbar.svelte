<script lang="ts">
	import { Avatar, DropdownMenu, Input } from '@aryagg/ui-kit';
	import { EMenuAlign, ETheme, type IMenu } from '@aryagg/types';
	import { CaretDownFill, Globe2, Moon, Search, Sun } from 'svelte-bootstrap-icons';
	import type { TopbarProps } from './types';
	import HeaderNavList from './components/HeaderNavList.svelte';

	let {
		homeHref = '/',
		homeClass = '',
		logoSrc = '',
		logoAlt = 'Logo',
		brand = '',
		brandClass = '',
		brandHref,
		tagline = '',

		menus = [],
		menuClass = '',
		menuLayout = 'stacked',
		activeHref = '',

		searchField = $bindable(),
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
		headerClass = ''
	}: TopbarProps = $props();

	const brandLink = $derived(brandHref ?? homeHref);

	function toggleTheme() {
		const next = theme === ETheme.DARK ? ETheme.LIGHT : ETheme.DARK;
		onThemeChange?.(next);
	}
</script>

{#snippet BrandMark()}
	{#if logoSrc || brand}
		<a
			href={brandLink}
			class="flex shrink-0 items-center gap-2 no-underline opacity-100 transition-opacity hover:opacity-80 mr-3 {homeClass}"
			aria-label={brand}
			title={brand}
		>
			{#if logoSrc}
				<img alt={logoAlt} class="size-10 object-contain" src={logoSrc} />
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
		<div class="min-w-45 sm:min-w-60 md:min-w-75 relative {searchField.classes}">
			<Input bind:field={searchField} />
		</div>
	{/if}
{/snippet}

{#snippet navList()}
	{#if menus.length}
		<HeaderNavList items={menus} {activeHref} {menuClass} layout={menuLayout} />
	{/if}
{/snippet}

{#snippet profileMenu()}
	{#if profileSlot}
		{@render profileSlot()}
	{:else if userName || profileItems.length}
		{@const isDropdown = profileItems.length > 0}
		<DropdownMenu menus={profileItems} align={EMenuAlign.RIGHT}>
			{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
				<button
					onclick={isDropdown ? toggle : null}
					aria-label="User menu"
					aria-expanded={open}
					class="group hover:text-accent! relative flex flex-col items-center border-transparent bg-transparent px-3 pb-1 pt-0 text-[11px]! gap-0 font-medium transition-colors hover:bg-transparent {open
						? 'text-accent'
						: 'text-secondary'}"
				>
					<Avatar src={avatarSrc} name={userName} size="xs" />
					{#if isDropdown}
						<div class="flex items-center gap-1">
							<span class="hidden sm:block">{profileLabel}</span>
							<CaretDownFill
								class="mt-0.5 size-3 transition-transform group-hover:text-accent {open
									? 'rotate-180'
									: ''}"
							/>
						</div>
					{/if}
					<!-- <span
						class="absolute bottom-0 h-0.5 w-full rounded-full transition-opacity {open
							? 'bg-accent opacity-100'
							: 'bg-transparent opacity-0 group-hover:bg-accent/40 group-hover:opacity-100'}"
					></span> -->
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
						class="group hover:text-accent! relative flex flex-col items-center border-transparent bg-transparent px-2 pb-1 pt-0 text-[11px]! gap-0 font-medium transition-colors hover:bg-transparent {open
							? 'text-accent'
							: 'text-secondary'}"
					>
						<Globe2 class="size-5 group-hover:text-accent" />
						<div class="hidden uppercase sm:block">{currentLanguage}</div>
						<span
							class="absolute bottom-0 h-0.5 w-full rounded-full transition-opacity {open
								? 'bg-accent opacity-100'
								: 'bg-transparent opacity-0 group-hover:bg-accent/40 group-hover:opacity-100'}"
						></span>
					</button>
				{/snippet}
			</DropdownMenu>
		{/if}

		{#if onThemeChange}
			<button
				onclick={toggleTheme}
				aria-label="Toggle theme"
				class="group hover:text-accent! text-secondary relative flex flex-col items-center border-transparent bg-transparent px-3 pb-1 pt-0 text-[11px]! gap-0 font-medium transition-colors hover:bg-transparent"
			>
				{#if theme === ETheme.LIGHT}
					<Sun class="size-5 group-hover:text-accent" /><span class="hidden sm:block">Light</span>
				{:else}
					<Moon class="size-5 group-hover:text-accent" /><span class="hidden sm:block">Dark</span>
				{/if}
				<span
					class="absolute bottom-0 h-0.5 w-full rounded-full bg-transparent opacity-0 transition-opacity group-hover:bg-accent/40 group-hover:opacity-100"
				></span>
			</button>
		{/if}

		{@render profileMenu()}

		{#if rightSlot}
			{@render rightSlot()}
		{/if}
	</div>
{/snippet}

<header
	class="w-full border-b border-border-primary bg-surface-primary px-2 shadow-2xs flex-none {hclass} {headerClass}"
>
	{#if variant === 'stacked'}
		<div class="container mx-auto flex h-14 items-center gap-4 p-2 {klass}">
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
				{@render searchBar()}
			</div>
			<div class="flex items-center justify-center gap-4">
				{@render navList()}
				{#if midSlot}{@render midSlot()}{/if}
			</div>
			<div class="flex items-center gap-3">
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
				{@render searchBar()}
			</div>
			{#if midSlot}
				<div class="flex justify-center">{@render midSlot()}</div>
			{:else if tagline}
				<p class="text-tertiary text-center text-sm">{tagline}</p>
			{:else}
				<span></span>
			{/if}
			<div class="flex items-center gap-3">
				{@render actionBar()}
			</div>
		</div>
	{:else}
		<div class="container mx-auto flex h-14 items-center gap-4 px-2 {klass}">
			{#if leftSlot}
				<div class="flex items-center gap-2">{@render leftSlot()}</div>
			{/if}
			{@render BrandMark()}
			{@render searchBar()}
			{@render navList()}
			{#if midSlot}
				<div class="flex items-center gap-2">{@render midSlot()}</div>
			{/if}
			<div class="ml-auto flex items-center gap-3">
				{@render actionBar()}
			</div>
		</div>
	{/if}
</header>

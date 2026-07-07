<script lang="ts">
	import { CaretDownFill, Globe2, Moon, Search, Sun } from 'svelte-bootstrap-icons';
	import { Avatar, DropdownMenu } from '@aryagg/ui-kit';
	import { EMenuAlign, ETheme, type IMenu } from '@aryagg/types';
	import type { TopbarProps } from './types';

	let {
		homeHref = '/',
		homeAriaLabel = 'Home',
		homeClass = '',
		logoSrc = '',
		logoAlt = 'Logo',
		brand = '',
		brandClass = '',

		menus = [],
		activeHref = '',

		searchPlaceholder = 'Search...',
		searchClass = '',
		searchIconClass = '',
		searchValue = '',
		onSearchInput,

		languages = [],
		currentLanguage = '',
		onLanguageChange,

		theme = ETheme.LIGHT,
		onThemeChange,

		avatarSrc = '',
		userName = '',
		profileLabel = '',
		profileItems = [],

		leftSlot = null,
		midSlot = null,
		rightSlot = null,
		hclass = '',
		klass = ''
	}: TopbarProps = $props();

	function toggleTheme() {
		const next = theme === ETheme.DARK ? ETheme.LIGHT : ETheme.DARK;
		onThemeChange?.(next);
	}

	function handleSearchInput(e: Event) {
		onSearchInput?.((e.currentTarget as HTMLInputElement).value);
	}
</script>

<header class="h-14 bg-transparent px-2 shadow-2xs backdrop-blur-sm {hclass}">
	<div class="container mx-auto flex items-center justify-between {klass}">
		{#if leftSlot}
			<div class="flex items-center gap-2">
				{@render leftSlot()}
			</div>
		{/if}
		<div class="flex flex-none items-center gap-3 py-2">
			{#if logoSrc}
				<a
					href={homeHref}
					class="flex aspect-square size-10 items-center justify-center rounded-md transition-colors {homeClass}"
					aria-label={homeAriaLabel}
					title={homeAriaLabel}
				>
					<img alt={logoAlt} class="size-full object-contain" src={logoSrc} />
				</a>
			{/if}

			{#if brand}
				<h5 class="font-bold whitespace-nowrap {brandClass}">{brand}</h5>
			{/if}

			{#if onSearchInput}
				<div class="relative min-w-45 sm:min-w-60 md:min-w-75 {searchClass}">
					<Search
						class="text-tertiary/70 absolute top-1/2 left-3 size-4 -translate-y-1/2 {searchIconClass}"
					/>
					<input
						type="search"
						placeholder={searchPlaceholder}
						value={searchValue}
						oninput={handleSearchInput}
						class="text-secondary/80 rounded-2xl py-2 pl-8"
					/>
				</div>
			{/if}
		</div>
		{#if midSlot}
			<div class="flex items-center gap-2">
				{@render midSlot()}
			</div>
		{/if}
		<div class="flex items-center gap-2">
			{#if menus.length}
				<nav class="flex items-end justify-center">
					{#each menus as menu (menu.id)}
						{@const isActive = activeHref === menu.href}
						<a
							href={menu.href}
							class="group hover:text-accent/80! relative flex flex-col items-center justify-between pb-1 text-[11px]! font-medium transition-colors {isActive
								? 'text-accent'
								: 'text-secondary'}"
						>
							{#if isActive && menu.selectedIcon}
								<menu.selectedIcon class="size-5" />
							{:else if menu.icon}
								<menu.icon class="size-5" />
							{/if}
							<span class="hidden px-4 pt-1 sm:block">{menu.label}</span>
							<span
								class="absolute -bottom-1 h-0.5 w-full rounded-full transition-opacity {isActive
									? 'bg-accent opacity-100'
									: 'bg-transparent opacity-0'}"
							></span>
						</a>
					{/each}
				</nav>
			{/if}

			{#if languages.length}
				<DropdownMenu
					menus={languages.map((l) => ({
						label: l.label,
						id: l.value,
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
					class="btn-ghost text-secondary hover:text-primary flex flex-col items-center gap-1 border-0 px-4 py-1 text-[11px] font-semibold"
				>
					{#if theme === ETheme.LIGHT}
						<Sun class="size-5" /><span class="hidden sm:block">Light</span>
					{:else}
						<Moon class="size-5" /><span class="hidden sm:block">Dark</span>
					{/if}
				</button>
			{/if}

			{#if userName || profileItems.length}
				<DropdownMenu menus={profileItems} align={EMenuAlign.RIGHT}>
					{#snippet trigger({ open, toggle }: { open: boolean; toggle: () => void })}
						<button
							onclick={toggle}
							aria-label="User menu"
							aria-expanded={open}
							class="group text-secondary hover:text-accent/80! flex flex-col items-center gap-1 border-0 px-4 pt-0 pb-1 text-[11px] font-medium transition-colors"
						>
							<Avatar src={avatarSrc} name={userName} size="xs" />
							<div class="flex items-center gap-1">
								<span class="hidden sm:block">{profileLabel}</span>
								<CaretDownFill
									class="mt-0.5 size-3 transition-transform {open ? 'rotate-180' : ''}"
								/>
							</div>
						</button>
					{/snippet}
				</DropdownMenu>
			{/if}
		</div>
		{#if rightSlot}
			<div class="flex items-center gap-2">
				{@render rightSlot()}
			</div>
		{/if}
	</div>
</header>

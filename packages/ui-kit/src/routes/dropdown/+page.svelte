<script lang="ts">
	import DropdownMenu from '$lib/atoms/dropdown/DropdownMenu.svelte';
	import type { DropdownItem } from '$lib/atoms/dropdown/types';
	import {
		Bell,
		BoxArrowRight,
		ChevronDown,
		Folder,
		Gear,
		Person,
		ShieldLock,
		ThreeDotsVertical
	} from 'svelte-bootstrap-icons';

	let selected = $state('profile');

	const userMenu: DropdownItem[] = [
		{ id: 'profile', label: 'My profile', icon: Person },
		{ id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
		{
			id: 'workspace',
			label: 'Switch workspace',
			icon: Folder,
			children: [
				{ id: 'crossrail', label: 'Crossrail 2', selected: true },
				{ id: 'dubai-metro', label: 'Dubai Metro' }
			]
		},
		{ id: 'settings', label: 'Settings', icon: Gear },
		{ id: 'admin', label: 'Admin console', icon: ShieldLock },
		{ id: 'divider-signout', label: '', divider: true },
		{ id: 'signout', label: 'Sign out', icon: BoxArrowRight, danger: true }
	];

	const actionMenu: DropdownItem[] = [
		{ id: 'open', label: 'Open project', icon: Folder },
		{ id: 'settings-action', label: 'Project settings', icon: Gear, shortcut: '⌘,' },
		{ id: 'divider-delete', label: '', divider: true },
		{ id: 'leave', label: 'Leave project', icon: BoxArrowRight, danger: true }
	];
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Atom</p>
			<h1>Dropdown</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				V3-style dropdown menus with dynamic placement, width, selected items, icons, badges, nested
				menus, custom headers, and danger actions.
			</p>
		</header>

		<section
			class="min-h-80 space-y-5 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">V3 example</p>
				<h2 class="mt-1 text-lg">User menu</h2>
			</div>

			<div class="flex justify-end">
				<DropdownMenu menus={userMenu} bind:selected width={220}>
					{#snippet trigger({ open, toggle })}
						<button
							type="button"
							class="inline-flex h-10 items-center gap-2 rounded-full border-0 bg-transparent pr-2 text-sm text-secondary"
							aria-expanded={open}
							onclick={toggle}
						>
							<span
								class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-white"
								>SC</span
							>
							<span class="hidden font-semibold text-primary sm:inline">Sarah Chen</span>
							<ChevronDown
								width={12}
								height={12}
								class={open ? 'rotate-180 transition-transform' : 'transition-transform'}
							/>
						</button>
					{/snippet}

					{#snippet header()}
						<p class="text-[13px] font-bold text-primary">Sarah Chen</p>
						<p class="mt-0.5 text-[11px] text-tertiary">cde-dxb@pinnacleinfotech.com</p>
					{/snippet}
				</DropdownMenu>
			</div>

			<p class="text-xs text-tertiary">Selected item: {selected}</p>
		</section>

		<section
			class="min-h-64 space-y-5 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm"
		>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-secondary">
					Placement and trigger
				</p>
				<h2 class="mt-1 text-lg">Action menu</h2>
			</div>

			<DropdownMenu menus={actionMenu} align="left" width="240px">
				{#snippet trigger({ open, toggle })}
					<button
						type="button"
						class="btn btn-outline inline-flex w-fit items-center gap-2"
						aria-expanded={open}
						onclick={toggle}
					>
						<ThreeDotsVertical width={14} height={14} /> Actions
					</button>
				{/snippet}
			</DropdownMenu>
		</section>
	</div>
</main>

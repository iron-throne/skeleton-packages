<script lang="ts">
	import { CollapsibleSidebar, Topbar, type SidebarMenuItem } from '$lib';
	import {
		House,
		HouseFill,
		Folder,
		FolderFill,
		BarChart,
		BarChartFill,
		People,
		PeopleFill,
		ImageFill,
		Gear,
		GearFill,
		Image
	} from 'svelte-bootstrap-icons';

	let isCollapsed = $state(false);
	let mobileOpen = $state(false);

	const menus: SidebarMenuItem[] = [
		{
			label: 'Home',
			id: 'home',
			href: '/',
			icon: House,
			selectedIcon: HouseFill,
			selected: true,
			heading: 'Overview'
		},
		{
			label: 'Projects',
			id: 'projects',
			href: '/projects',
			icon: Folder,
			selectedIcon: FolderFill,
			badge: 3,
			children: [
				{
					label: 'Active Projects',
					id: 'projects-active',
					href: '/projects/active',
					icon: BarChart,
					selectedIcon: BarChartFill
				},
				{
					label: 'Archived',
					id: 'projects-archived',
					href: '/projects/archived',
					icon: Folder,
					selectedIcon: FolderFill
				}
			]
		},
		{
			label: 'Team',
			id: 'team',
			href: '/team',
			icon: People,
			selectedIcon: PeopleFill,
			disabled: true
		},
		{
			label: 'Media',
			id: 'media',
			href: '/media',
			icon: Image,
			selectedIcon: ImageFill,
			heading: 'Content',
			children: [
				{
					label: 'Gallery',
					id: 'media-gallery',
					href: '/media/gallery',
					icon: Image,
					selectedIcon: ImageFill,
					children: [
				{
					label: 'Gallery',
					id: 'media-gallery',
					href: '/media/gallery',
					icon: Image,
					selectedIcon: ImageFill
				},
				{
					label: 'Uploads',
					id: 'media-uploads',
					href: '/media/uploads',
					icon: Folder,
					selectedIcon: FolderFill
				}
			]
				},
				{
					label: 'Uploads',
					id: 'media-uploads',
					href: '/media/uploads',
					icon: Folder,
					selectedIcon: FolderFill
				}
			]
		},
		{
			label: 'Settings',
			id: 'settings',
			href: '/settings',
			icon: Gear,
			selectedIcon: GearFill,
			divider: true
		}
	];
</script>

<main class="flex h-screen bg-surface-tertiary text-primary">
	<CollapsibleSidebar {menus} bind:collapsed={isCollapsed} logosrc="https://upload.wikimedia.org/wikipedia/commons/e/e0/SNice.svg" />

	<div class="flex-1 overflow-auto p-6">
		<button
			type="button"
			class="rounded-lg border border-border-primary px-3 py-1.5 text-sm"
			onclick={() => (mobileOpen = true)}
		>
			Open mobile sidebar
		</button>
		<h1 class="mt-4 text-xl font-bold">Content area</h1>
		<p class="text-secondary">Toggle the desktop sidebar's collapse button, or open the mobile drawer above.</p>
	</div>
</main>

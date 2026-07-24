<script lang="ts">
	import { Tabs } from '$lib';
	import { ESize } from '@aryagg/types';
	import { Person, PersonArmsUp, GearFill } from 'svelte-bootstrap-icons';

	const demoTabs = [
		{ id: 'overview', label: 'Overview', icon: Person },
		{ id: 'tasks', label: 'Tasks', badge: 12, icon: PersonArmsUp },
		{ id: 'settings', label: 'Settings', icon: GearFill },
		{ id: 'archive', label: 'Archived', badge: '34', icon: PersonArmsUp, disabled: true }
	];

	let variantSurface = $state('tasks');
	let variantClassic = $state('tasks');

	let sizeXs = $state('tasks');
	let sizeSm = $state('tasks');
	let sizeMd = $state('tasks');
	let sizeLg = $state('tasks');
	let sizeXl = $state('tasks');

	let radiusNone = $state('tasks');
	let radiusSmall = $state('tasks');
	let radiusMedium = $state('tasks');
	let radiusLarge = $state('tasks');
	let radiusFull = $state('tasks');

	let disabledActive = $state('tasks');
</script>

<div class="min-h-screen bg-surface-tertiary p-8 space-y-10">
	<h1 class="text-xl font-semibold text-content-primary">Tabs</h1>

	<!-- Variant -->
	<section class="space-y-4">
		<h2 class="text-sm font-semibold text-content-secondary">Variant</h2>
		<div class="space-y-4">
			<Tabs tabs={demoTabs} bind:active={variantSurface} variant="surface" />
			<Tabs tabs={demoTabs} bind:active={variantClassic} variant="classic" />
		</div>
	</section>

	<!-- Size -->
	<section class="space-y-4">
		<h2 class="text-sm font-semibold text-content-secondary">Size</h2>
		<div class="space-y-4">
			<Tabs tabs={demoTabs} bind:active={sizeXs} size={ESize.XS} />
			<Tabs tabs={demoTabs} bind:active={sizeSm} size={ESize.SM} />
			<Tabs tabs={demoTabs} bind:active={sizeMd} size={ESize.MD} />
			<Tabs tabs={demoTabs} bind:active={sizeLg} size={ESize.LG} />
			<Tabs tabs={demoTabs} bind:active={sizeXl} size={ESize.XL} />
		</div>
	</section>

	<!-- Radius -->
	<section class="space-y-4">
		<h2 class="text-sm font-semibold text-content-secondary">Radius</h2>
		<div class="space-y-4">
			<Tabs tabs={demoTabs} bind:active={radiusNone} radius="none" />
			<Tabs tabs={demoTabs} bind:active={radiusSmall} radius="small" />
			<Tabs tabs={demoTabs} bind:active={radiusMedium} radius="medium" />
			<Tabs tabs={demoTabs} bind:active={radiusLarge} radius="large" />
			<Tabs tabs={demoTabs} bind:active={radiusFull} radius="full" />
		</div>
	</section>

	<!-- Disabled -->
	<section class="space-y-4">
		<h2 class="text-sm font-semibold text-content-secondary">Disabled</h2>
		<Tabs tabs={demoTabs} bind:active={disabledActive} disabled />
	</section>
</div>

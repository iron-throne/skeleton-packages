<script lang="ts">
	import Card from '$lib/atoms/card/Card.svelte';
	import Pagination from '$lib/organisms/pagination/Pagination.svelte';
	import Tabs from '$lib/organisms/tabs/Tabs.svelte';
	import type { TabItem } from '$lib/organisms/tabs/types';
	import { ClockHistory, FileEarmarkText, InfoCircle } from 'svelte-bootstrap-icons';

	const requestTabs: TabItem[] = [
		{ id: 'rfi', label: 'RFI', badge: 4 },
		{ id: 'rfp', label: 'RFP', badge: 2 },
		{ id: 'rfa', label: 'RFA', badge: 1 },
		{ id: 'closed', label: 'Closed', disabled: true }
	];

	const documentTabs: TabItem[] = [
		{ id: 'structured', label: 'Structured', badge: '14,240', icon: FileEarmarkText },
		{ id: 'unstructured', label: 'Unstructured', badge: '4,180', icon: InfoCircle },
		{ id: 'history', label: 'History', icon: ClockHistory }
	];

	let requestTab = $state('rfi');
	let classicTab = $state('rfp');
	let documentTab = $state('structured');
	let surfaceTab = $state('history');
	let currentPage = $state(5);
	let pageSize = $state(25);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organisms</p>
			<h1>Tabs and pagination</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Underline, classic, segmented and surface tabs, plus responsive bordered pagination
				controls.
			</p>
		</header>

		<Card variant="panel" title="Underline tabs">
			<Tabs
				tabs={requestTabs}
				bind:active={requestTab}
				showIcons={false}
				tabKlass="uppercase tracking-wide"
				panelKlass="mt-1"
			>
				<p class="text-sm text-secondary">Active request view: <strong>{requestTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="Segmented document tabs">
			<Tabs
				tabs={documentTabs}
				bind:active={documentTab}
				variant="segmented"
				radius="full"
				showIcons
				iconPosition="left"
				activeKlass="ring-2 ring-accent/40"
			>
				<p class="text-sm text-secondary">Active document view: <strong>{documentTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="Classic tabs">
			<Tabs
				tabs={requestTabs}
				bind:active={classicTab}
				variant="classic"
				showIcons={false}
				parentKlass="overflow-hidden rounded-t-lg"
			>
				<p class="text-sm text-secondary">Active classic view: <strong>{classicTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="Surface tabs">
			<Tabs
				tabs={documentTabs}
				bind:active={surfaceTab}
				variant="surface"
				showIcons
				klass="rounded-xl border border-border-primary p-2"
			>
				<p class="text-sm text-secondary">Active surface view: <strong>{surfaceTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="V3 pagination">
			<Pagination bind:currentPage bind:pageSize totalPages={24} totalItems={578} showGoTo />
		</Card>
	</div>
</main>

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
	let documentTab = $state('structured');
	let currentPage = $state(5);
	let pageSize = $state(25);
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl space-y-8">
		<header class="space-y-2">
			<p class="section-label">Organisms</p>
			<h1>Tabs and pagination</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				V3 underline and segmented tabs, plus responsive bordered pagination controls.
			</p>
		</header>

		<Card variant="panel" title="Underline tabs">
			<Tabs tabs={requestTabs} bind:active={requestTab} showIcons={false}>
				<p class="text-sm text-secondary">Active request view: <strong>{requestTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="Segmented document tabs">
			<Tabs
				tabs={documentTabs}
				bind:active={documentTab}
				variant="segmented"
				borderRadius="20px"
				containerBorderRadius="20px"
				showIcons 
				iconPosition="left"
			>
				<p class="text-sm text-secondary">Active document view: <strong>{documentTab}</strong></p>
			</Tabs>
		</Card>

		<Card variant="panel" title="V3 pagination">
			<Pagination bind:currentPage bind:pageSize totalPages={24} totalItems={578} showGoTo />
		</Card>
	</div>
</main>

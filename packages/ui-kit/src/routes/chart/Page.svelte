<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import Chart from '$organisms/chart/Chart.svelte';
	import type { ChartData } from 'chart.js';

	const barData: ChartData = {
		labels: ['Architecture', 'Structure', 'MEP', 'Civil'],
		datasets: [{ label: 'Open RFIs', data: [12, 7, 15, 4] }]
	};

	const lineData: ChartData = {
		labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
		datasets: [
			{ label: 'Issued', data: [8, 14, 10, 18, 22] },
			{ label: 'Closed', data: [4, 9, 12, 15, 20] }
		]
	};

	const doughnutData: ChartData = {
		labels: ['Approved', 'In Review', 'Draft'],
		datasets: [{ data: [58, 27, 15] }]
	};
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Organism</p>
			<h1>Chart</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Reusable Chart.js wrapper with sensible default colors and options for any chart type.
			</p>
		</header>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="panel" title="Bar">
				<Chart type="bar" data={barData} />
			</Card>

			<Card variant="panel" title="Doughnut">
				<Chart type="doughnut" data={doughnutData} />
			</Card>
		</div>

		<Card variant="panel" title="Line">
			<Chart type="line" data={lineData} />
		</Card>
	</div>
</main>

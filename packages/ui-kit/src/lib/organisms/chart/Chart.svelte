<script lang="ts">
	import {
		Chart as ChartJS,
		registerables,
		type ChartData,
		type ChartDataset,
		type ChartOptions,
		type ChartType
	} from 'chart.js';
	import { merge } from 'chart.js/helpers';
	import { onDestroy } from 'svelte';

	ChartJS.register(...registerables);

	let {
		type = 'bar',
		data,
		options,
		class: className = '',
		height,
		width
	}: {
		type?: ChartType;
		data: ChartData;
		options?: ChartOptions;
		class?: string;
		height?: number;
		width?: number;
	} = $props();

	const DEFAULT_PALETTE = [
		{ bg: 'rgba(99, 102, 241, 0.2)', border: 'rgba(99, 102, 241, 1)' }, // indigo
		{ bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 1)' }, // pink
		{ bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' }, // emerald
		{ bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 1)' }, // amber
		{ bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }, // blue
		{ bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 1)' } // red
	];

	const DEFAULT_OPTIONS: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: true, position: 'top' },
			tooltip: { enabled: true, mode: 'index', intersect: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.06)' } }
		}
	};

	// pie/doughnut/polarArea color each slice of a dataset rather than each dataset
	const SLICE_CHART_TYPES: ChartType[] = ['pie', 'doughnut', 'polarArea'];

	const withDefaultColors = (input: ChartData, chartType: ChartType): ChartData => {
		const isSliceChart = SLICE_CHART_TYPES.includes(chartType);
		return {
			...input,
			datasets: input.datasets.map((dataset, i): ChartDataset => {
				if (isSliceChart) {
					const sliceCount = Array.isArray(dataset.data) ? dataset.data.length : 1;
					const palette = Array.from(
						{ length: sliceCount },
						(_, j) => DEFAULT_PALETTE[j % DEFAULT_PALETTE.length]
					);
					return {
						backgroundColor: palette.map((c) => c.bg),
						borderColor: palette.map((c) => c.border),
						borderWidth: 1,
						...dataset
					};
				}
				const palette = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
				return {
					backgroundColor: palette.bg,
					borderColor: palette.border,
					borderWidth: 1,
					...dataset
				};
			})
		};
	};

	let canvas: HTMLCanvasElement;
	let chart: ChartJS | undefined;
	let renderedType: ChartType | undefined;

	$effect(() => {
		const currentType = type;
		const currentData = withDefaultColors(data, currentType);
		const currentOptions: ChartOptions = merge({}, [DEFAULT_OPTIONS, options ?? {}] as any);

		if (!chart || renderedType !== currentType) {
			chart?.destroy();
			chart = new ChartJS(canvas, {
				type: currentType,
				data: currentData,
				options: currentOptions
			});
			renderedType = currentType;
		} else {
			chart.data = currentData;
			chart.options = currentOptions;
			chart.update();
		}
	});

	onDestroy(() => {
		chart?.destroy();
		chart = undefined;
	});
</script>

<div class="relative h-64 w-full {className}">
	<canvas bind:this={canvas} {width} {height}></canvas>
</div>

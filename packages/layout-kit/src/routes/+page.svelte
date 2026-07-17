<script lang="ts">
	import { Chart, OtpInput } from '@aryagg/ui-kit';
	import { type ChartData } from 'chart.js';
	// Sample Data for iReview Comment Status
	const iReviewData: ChartData<'bar', number[], string> = {
		labels: ['Submission', 'Technical Review', 'Response', 'Closure'],
		datasets: [
			{
				label: 'Comments Resolved',
				data: [15, 25, 40, 65],
				backgroundColor: 'rgba(75, 192, 192, 0.6)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1
			}
		]
	};
</script>

<main class="flex h-screen bg-surface-tertiary text-primary">
	<OtpInput />
</main>

<script lang="ts">
	import { Chart, OtpInput } from '@aryagg/ui-kit';
	import { LoginSimple, LoginSplit, LoginCover, type LoginCredentials } from '$lib/login';
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

	// ── Login demo ─────────────────────────────────────────────
	const loginVariants = [
		{ key: 'simple', label: 'Simple' },
		{ key: 'split', label: 'Split' },
		{ key: 'cover', label: 'Cover' }
	] as const;

	let activeLogin = $state<(typeof loginVariants)[number]['key']>('simple');
	let demoLoading = $state(false);
	let demoError = $state('');

	// Sample onSubmit callback — logs the parsed credentials instead of hitting a real backend
	async function handleDemoSubmit(credentials: LoginCredentials) {
		demoError = '';
		demoLoading = true;
		await new Promise((r) => setTimeout(r, 800));
		demoLoading = false;

		if (credentials.password.length < 4) {
			demoError = 'Password must be at least 4 characters.';
			return;
		}
		console.log('[LoginDemo] submitted', credentials);
		alert(`Signed in as ${credentials.email} (remember me: ${credentials.rememberMe})`);
	}
</script>

<!-- ── Login component demos ─────────────────────────────────── -->
<section class="border-border-primary relative border-t">
	<div
		class="bg-surface-primary sticky top-0 z-20 flex items-center gap-2 border-b border-border-primary p-4"
	>
		<span class="text-secondary mr-2 text-sm font-semibold">Login demo:</span>
		{#each loginVariants as variant (variant.key)}
			<button
				type="button"
				class="btn btn-sm {activeLogin === variant.key ? 'btn-primary' : ''}"
				onclick={() => (activeLogin = variant.key)}
			>
				{variant.label}
			</button>
		{/each}
	</div>

	{#if activeLogin === 'simple'}
		<LoginSimple
			appName="Acme"
			title="Welcome back"
			subtitle="Sign in to your Acme account"
			loading={demoLoading}
			error={demoError}
			onSubmit={handleDemoSubmit}
		/>
	{:else if activeLogin === 'split'}
		<LoginSplit
			appName="Acme"
			title="Welcome back"
			subtitle="Sign in to your Acme account"
			panelHeading="Build something great"
			panelDescription="Sign in to pick up right where you left off."
			loading={demoLoading}
			error={demoError}
			onSubmit={handleDemoSubmit}
		/>
	{:else}
		<LoginCover
			appName="Acme"
			title="Welcome back"
			subtitle="Sign in to your Acme account"
			loading={demoLoading}
			error={demoError}
			onSubmit={handleDemoSubmit}
		/>
	{/if}
</section>

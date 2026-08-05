<script lang="ts">
	import Card from '$atoms/card/Card.svelte';
	import OtpInput from '$molecules/otp-input/Otp-input.svelte';

	let code = $state('');
	let alphaCode = $state('');
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl space-y-6">
		<header class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wider text-secondary">Molecule</p>
			<h1>OTP Input</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Multi-cell verification code input with auto-advance, paste support and backspace
				navigation.
			</p>
		</header>

		<Card variant="panel" title="6-digit numeric code">
			<OtpInput length={6} bind:value={code} />
			<p class="mt-3 text-xs text-secondary">Value: {code || '(empty)'}</p>
		</Card>

		<Card variant="panel" title="4-character alphanumeric code">
			<OtpInput length={4} allowNumberOnly={false} bind:value={alphaCode} />
			<p class="mt-3 text-xs text-secondary">Value: {alphaCode || '(empty)'}</p>
		</Card>
	</div>
</main>

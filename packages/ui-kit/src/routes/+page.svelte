<script lang="ts">
	import { Card, Badge, Button, Avatar, Icon } from '$lib';
	import { PersonArmsUp, StarFill, ThreeDotsVertical, ArrowRight } from 'svelte-bootstrap-icons';

	let selectedPlan = $state('pro');
	let liked = $state(false);
</script>

<div class="min-h-screen bg-surface-tertiary p-8">
	<div class="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Basic: title + subtitle + body -->
		<Card title="Course Progress" subtitle="Intro to Algebra">
			<p class="text-sm text-secondary">You've completed 12 of 15 lessons.</p>
		</Card>

		<!-- Variant: elevated + actions snippet -->
		<Card variant="elevated" title="Weekly Report" subtitle="Jul 14 - Jul 20">
			{#snippet actions()}
				<Badge variant="success">On track</Badge>
			{/snippet}
			<p class="text-sm text-secondary">Attendance and scores are trending up this week.</p>
		</Card>

		<!-- Variant: flat, no header, just body -->
		<Card variant="flat" padding="lg">
			<p class="text-sm text-secondary">
				A flat card with no header — useful for quotes, tips, or plain content blocks.
			</p>
		</Card>

		<!-- Clickable card (onClick) -->
		<Card
			title="Notifications"
			subtitle="3 unread messages"
			hoverable
			onClick={() => alert('Card clicked')}
		>
			{#snippet actions()}
				<Icon icon={ThreeDotsVertical} />
			{/snippet}
			<p class="text-sm text-secondary">Click anywhere on this card to open the inbox.</p>
		</Card>

		<!-- Link card (href) -->
		<Card
			title="Documentation"
			subtitle="Read the getting-started guide"
			href="https://example.com"
			target="_blank"
		>
			<p class="text-sm text-secondary">Renders as a real anchor, so it's fully keyboard/SEO friendly.</p>
			{#snippet footer()}
				<span class="text-xs font-medium text-accent inline-flex items-center gap-1">
					Open guide <ArrowRight width={12} height={12} />
				</span>
			{/snippet}
		</Card>

		<!-- Selected / selectable plan card -->
		<Card
			title="Pro Plan"
			subtitle="$19 / month"
			selected={selectedPlan === 'pro'}
			onClick={() => {
				selectedPlan = 'pro';
			}}
		>
			<ul class="text-sm text-secondary list-disc pl-4 space-y-1">
				<li>Unlimited courses</li>
				<li>Priority support</li>
			</ul>
			{#snippet footer()}
				<Button
					label={selectedPlan === 'pro' ? 'Selected' : 'Choose plan'}
					klass="w-full justify-center"
				/>
			{/snippet}
		</Card>

		<!-- Disabled card -->
		<Card
			title="Archived Class"
			subtitle="This class has ended"
			disabled
			onClick={() => alert('should not fire')}
		>
			<p class="text-sm text-secondary">Disabled cards are dimmed and ignore clicks/keyboard.</p>
		</Card>

		<!-- Loading skeleton state -->
		<Card loading padding="lg" />

		<!-- Media (banner image) + custom body + footer -->
		<Card padding="none" variant="outlined">
			{#snippet media()}
				<div
					class="h-32 w-full bg-gradient-to-br from-accent/70 to-accent flex items-center justify-center"
				>
					<PersonArmsUp width={40} height={40} class="text-on-accent" />
				</div>
			{/snippet}
			<div class="p-5">
				<p class="text-sm font-semibold text-primary">New Student Orientation</p>
				<p class="text-xs text-tertiary mt-0.5">Starts Mon, 9:00 AM</p>
				<p class="text-sm text-secondary mt-2">Everything new students need before day one.</p>
			</div>
			{#snippet footer()}
				<Button label="Register" klass="w-full justify-center" />
			{/snippet}
		</Card>

		<!-- Fully custom header snippet (avatar + name + like button) -->
		<Card>
			{#snippet header()}
				<div class="flex items-center gap-3">
					<Avatar name="Riya Sharma" size="md" status="online" />
					<div class="min-w-0">
						<p class="text-sm font-semibold text-primary truncate">Riya Sharma</p>
						<p class="text-xs text-tertiary">Mathematics Teacher</p>
					</div>
					<button
						class="ml-auto border-0 bg-transparent p-1 text-tertiary hover:text-accent"
						aria-pressed={liked}
						onclick={() => (liked = !liked)}
					>
						<StarFill width={16} height={16} class={liked ? 'text-warning' : ''} />
					</button>
				</div>
			{/snippet}
			<p class="text-sm text-secondary mt-3">
				"Great progress this term — keep up the consistent practice!"
			</p>
		</Card>

		<!-- Ghost variant, no border/shadow -->
		<Card variant="ghost" padding="sm" title="Quick Tip">
			<p class="text-sm text-secondary">Ghost cards blend into the page background.</p>
		</Card>
	</div>
</div>

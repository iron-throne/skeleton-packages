<script lang="ts">
	import Avatar from '$lib/atoms/avatar/Avatar.svelte';
	import Badge from '$lib/atoms/badge/Badge.svelte';
	import Button from '$lib/atoms/button/Button.svelte';
	import Card from '$lib/atoms/card/Card.svelte';
	import { Building, Clock, Folder2Open, Stars, ThreeDotsVertical } from 'svelte-bootstrap-icons';
</script>

<main class="min-h-screen overflow-auto bg-surface-tertiary px-4 py-6 text-primary sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl space-y-6">
		<header class="space-y-2">
			<p class="section-label">Atom</p>
			<h1>Card</h1>
			<p class="max-w-2xl text-sm leading-6 text-secondary">
				Reusable card styles for metrics, project summaries, panels, insights, and feature callouts.
			</p>
		</header>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card variant="content" title="Discipline breakdown">
				{#snippet actions()}
					<Button
						label="More actions"
						icon={ThreeDotsVertical}
						iconOnly
						size="icon"
						variant="ghost"
					/>
				{/snippet}

				<div class="space-y-3 text-xs">
					<div class="flex items-center justify-between gap-4">
						<span>Architecture</span>
						<strong>4,820</strong>
					</div>
					<div class="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
						<div class="h-full w-[92%] bg-accent"></div>
					</div>
					<div class="flex items-center justify-between gap-4">
						<span>Structural</span>
						<strong>3,120</strong>
					</div>
					<div class="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
						<div class="h-full w-[60%] bg-info"></div>
					</div>
				</div>
			</Card>

			<Card
				variant="content"
				title="Custom project card"
				backgroundColor="#fff8ed"
				borderColor="#f0b45f"
				borderRadius="16px"
				paddingInline="22px"
				shadow="0 6px 20px rgb(161 96 0 / 12%)"
			>
				<p class="text-sm leading-6 text-secondary">
					A project can introduce a completely new card appearance without adding another library
					variant.
				</p>
			</Card>
		</section>

		<section class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<Card
				variant="metric"
				eyebrow="Active Projects"
				value="47"
				trend="up"
				trendLabel="+3 vs last week"
				tone="accent"
				icon={Building}
				chartValues={[47, 49, 48, 52, 57, 55, 61, 59, 64, 67]}
				interactive
			/>

			<Card
				variant="metric"
				eyebrow="Live Models"
				value="2,418"
				trend="up"
				trendLabel="+128 synced today"
				tone="success"
				icon={Folder2Open}
				chartValues={[20, 24, 22, 28, 31, 29, 37, 41, 39, 45]}
				interactive
			/>

			<Card
				variant="metric"
				eyebrow="At Risk"
				value="6"
				trend="down"
				trendLabel="-2 from yesterday"
				tone="warning"
				icon={Clock}
				chartValues={[12, 10, 11, 8, 9, 7, 6, 7, 5, 6]}
				interactive
			/>
		</section>

		<section class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
			<Card
				variant="project"
				title="Crossrail 2 - Tottenham Court Station"
				subtitle="London, UK - Stage 4 Technical Design"
				eyebrow="LDN-CRL-01"
				badge="active"
				tone="success"
				href="/card"
				interactive
			>
				<div class="space-y-3">
					<div class="h-2 overflow-hidden rounded-full bg-surface-tertiary">
						<div class="h-full w-[64%] rounded-full bg-accent"></div>
					</div>
					<div class="flex flex-wrap items-center gap-2 text-xs text-secondary">
						<Badge variant="success">64% complete</Badge>
						<span>1,284 documents</span>
						<span>24 open RFIs</span>
					</div>
				</div>
			</Card>

			<Card variant="panel" title="Quick access" badge="2 pinned" icon={Folder2Open}>
				<ul class="divide-y divide-border-primary text-sm">
					<li class="flex items-center gap-3 py-2.5">
						<Avatar name="Sarah Chen" size="xs" />
						<div class="min-w-0 flex-1">
							<div class="truncate font-medium">Dubai Opera District - Tower 2</div>
							<div class="text-[10px] text-tertiary">DXB-OPR-02 - Stage 5</div>
						</div>
						<span class="text-xs font-semibold">78%</span>
					</li>
					<li class="flex items-center gap-3 py-2.5">
						<Avatar name="Marcus Weber" size="xs" />
						<div class="min-w-0 flex-1">
							<div class="truncate font-medium">Berlin Data Campus</div>
							<div class="text-[10px] text-tertiary">BER-DC-04 - Handover</div>
						</div>
						<span class="text-xs font-semibold">91%</span>
					</li>
				</ul>
			</Card>
		</section>

		<section class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Card variant="insight" title="AI insights" icon={Stars} tone="accent">
				<ul class="space-y-2 text-xs leading-5 text-secondary">
					<li>Manchester Hospital is trending at risk from unresolved coordination clashes.</li>
					<li>Crossrail 2 federation freshness fell below the 24h SLA twice this week.</li>
				</ul>
			</Card>

			<Card
				variant="feature"
				title="New card feature"
				subtitle="Use snippets for actions, media, body content, and footer while keeping one shared card surface."
				badge="new"
				tone="info"
				interactive
			>
				{#snippet footer()}
					<div class="flex items-center justify-between gap-3 text-xs text-tertiary">
						<span>Designed for reusable UI-kit patterns</span>
						<button class="btn btn-muted btn-sm">Preview</button>
					</div>
				{/snippet}
			</Card>
		</section>
	</div>
</main>

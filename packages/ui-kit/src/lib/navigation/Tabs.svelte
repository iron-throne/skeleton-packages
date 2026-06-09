<script lang="ts">
	import type { Tab } from '$lib/types';
	import type { Snippet } from 'svelte';

	let {
		tabs,
		active = $bindable(),
		children,
		parentClass,
		tabClass
	}: {
		tabs: Tab[];
		active: string;
		parentClass?: string;
		tabClass?: string;
		children?: Snippet;
	} = $props();

	// Initialise to first enabled tab if not set
	if (!active) active = tabs.find((t) => !t.disabled)?.id ?? '';
</script>

<div>
	<!-- Tab bar -->
	<div role="tablist" class="bg-surface-primary flex w-fit rounded-full p-1 text-xs shadow {parentClass}">
		{#each tabs as tab (tab.id)}
			<button
				role="tab"
				aria-selected={active === tab.id}
				aria-disabled={tab.disabled}
				onclick={() => {
					if (!tab.disabled) active = tab.id;
				}}
				class="rounded-full px-4 py-1.5 font-medium transition-all duration-300 text-xs {tabClass} {tab.id ===
				active
					? 'bg-primary text-surface-primary shadow-sm'
					: 'text-secondary hover:text-primary border-0 bg-transparent'}"
			>
				{#if tab.icon}
					<tab.icon width={15} height={15} class="shrink-0" />
				{/if}
				{tab.label}
				{#if tab.badge != null}
					<span
						class="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold
                        {tab.id === active
							? 'bg-primary text-surface-primary shadow-sm'
							: 'text-secondary hover:text-primary border-0 bg-transparent'}"
					>
						{tab.badge}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Tab panel -->
	{#if children}
		<div role="tabpanel" class="mt-4">
			{@render children()}
		</div>
	{/if}
</div>

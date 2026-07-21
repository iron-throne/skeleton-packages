<script lang="ts">
	import Icon from '$lib/atoms/icon/Icon.svelte';
import type { ITab } from '@aryagg/types';
	import type { Snippet } from 'svelte';

	let {
		tabs,
		active = $bindable(),
		children,
		parentKlass,
		tabKlass
	}: {
		tabs: ITab[];
		active: string;
		parentKlass?: string;
		tabKlass?: string;
		children?: Snippet;
	} = $props();

	// Initialise to first enabled tab if not set
	$effect.pre(() => {
		if (!active) active = tabs.find((t) => !t.disabled)?.id ?? '';
	});
</script>

<div>
	<!-- ITab bar -->
	<div
		role="tablist"
		class="bg-surface-primary flex w-fit rounded-full p-1 text-xs shadow {parentKlass}"
	>
		{#each tabs as tab (tab.id)}
			<button
				role="tab"
				aria-selected={active === tab.id}
				aria-disabled={tab.disabled}
				onclick={() => {
					if (!tab.disabled) active = tab.id;
				}}
				class="rounded-full px-4 py-1.5 font-medium transition-colors duration-300 ease-in-out text-xs {tabKlass} {tab.id ===
				active
					? 'bg-primary text-surface-primary shadow-sm'
					: 'text-secondary hover:text-primary border-0 bg-transparent'}"
			>
				<Icon icon={tab.icon} klass="size-4 shrink-0"/>
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

	<!-- ITab panel -->
	{#if children}
		<div role="tabpanel" class="mt-4">
			{@render children()}
		</div>
	{/if}
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		// Text content
		title = 'Discover Your New Home',
		placeholder = 'City, address, or ZIP',
		buttonText = 'Search',
		inputLabel = 'Search properties',

		// Background image
		backgroundImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
		// Event handlers
		onSubmit,

		// CSS class overrides
		sectionClass,
		overlayClass,
		headerClass,
		searchFormClass,
		inputClass,
		buttonClass,

		// Slots
		headerSlot,
		searchSlot,
		footerSlot,

		// UI toggles
		showSearch
	}: {
		title?: string;
		placeholder?: string;
		buttonText?: string;
		inputLabel?: string;
		backgroundImage?: string;

		onSubmit?: (value: string) => void;

		sectionClass?: string;
		overlayClass?: string;
		headerClass?: string;
		searchFormClass?: string;
		inputClass?: string;
		buttonClass?: string;

		headerSlot?: Snippet;
		searchSlot?: Snippet;
		footerSlot?: Snippet;

		showSearch?: boolean;
	} = $props();

	let searchQuery = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit?.(searchQuery);
	}
</script>

<section class="size-full {sectionClass}">
	<div
		class="size-full opacity-90 bg-cover bg-no-repeat bg-center flex flex-col justify-center items-center {overlayClass}"
		style={`background-image: url('${backgroundImage}')`}
	>
		<!-- Header -->
		{#if title}
			<h1
				class="text-white text-center xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl text-xl font-semibold p-2 rounded-sm {headerClass}"
			>
				{title}
			</h1>
		{/if}

		{@render headerSlot?.()}

		<!-- Search Form -->
		<div class="w-full mx-auto {searchFormClass}">
			<form onsubmit={handleSubmit}>
				<div class="xl:w-1/2 lg:w-[60%] sm:w-[70%] w-[90%] mx-auto flex gap-2 md:mt-6 mt-4">
					<label for="landing-search-input" class="sr-only">{inputLabel}</label>

					<input
						id="landing-search-input"
						type="text"
						bind:value={searchQuery}
						class="border w-full p-2 rounded-md text-xl pl-2 {inputClass}"
						{placeholder}
					/>

					{#if showSearch}
						<button type="submit" class="btn btn-primary {buttonClass}">
							{buttonText}
						</button>
					{/if}

					{@render searchSlot?.()}
				</div>
			</form>

			{@render footerSlot?.()}
		</div>
	</div>
</section>

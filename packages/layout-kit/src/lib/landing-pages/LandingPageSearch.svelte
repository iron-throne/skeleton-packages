<script lang="ts">
	let {
		title = 'Discover Your New Home',
		backgroundImage = 'https://images.unsplash.com/photo-1449844908441-8829872d2607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw2fHxob21lfGVufDB8MHx8fDE3MTA0MDE1NDZ8MA&ixlib=rb-4.0.3&q=80&w=1080',
		placeholder = 'City, address, or ZIP',
		buttonText = 'Search',
		inputLabel = 'Search properties',
		onSubmit,
		sectionCls,
		overlayCls,
		titleCls,
		formCls,
		inputCls,
		ctaCls
	}: {
		title?: string;
		backgroundImage?: string;
		placeholder?: string;
		buttonText?: string;
		inputLabel?: string;
		onSubmit?: (value: string) => void;
		sectionCls?: string;
		overlayCls?: string;
		titleCls?: string;
		formCls?: string;
		inputCls?: string;
		ctaCls?: string;
	} = $props();

	let searchValue = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit?.(searchValue);
	}
</script>

<section class="w-full h-screen {sectionCls}">
	<div
		class="w-full h-full opacity-90 bg-cover bg-no-repeat bg-center flex flex-col justify-center items-center {overlayCls}"
		style={`background-image: url('${backgroundImage}')`}
	>
		<!-- Title -->
		{#if title}
			<h1
				class="text-white text-center xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl text-xl font-semibold p-2 rounded-sm {titleCls}"
			>
				{title}
			</h1>
		{/if}

		<!-- Search Form -->
		<div class="w-full mx-auto {formCls}">
			<form onsubmit={handleSubmit}>
				<div class="xl:w-1/2 lg:w-[60%] sm:w-[70%] w-[90%] mx-auto flex gap-2 md:mt-6 mt-4">
					<label for="landing-search-input" class="sr-only">{inputLabel}</label>
					<input
						id="landing-search-input"
						type="text"
						bind:value={searchValue}
						class="border w-full p-2 rounded-md text-xl pl-2 {inputCls}"
						{placeholder}
					/>
					<button type="submit" class="btn btn-primary {ctaCls}">
						{buttonText}
					</button>
				</div>
			</form>
		</div>
	</div>
</section>

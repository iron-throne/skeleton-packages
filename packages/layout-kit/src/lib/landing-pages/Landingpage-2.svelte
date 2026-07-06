<script lang="ts">
	let {
		title = 'Discover Your New Home',
		backgroundImage = 'https://images.unsplash.com/photo-1449844908441-8829872d2607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw2fHxob21lfGVufDB8MHx8fDE3MTA0MDE1NDZ8MA&ixlib=rb-4.0.3&q=80&w=1080',
		placeholder = 'City, address, or ZIP',
		buttonText = 'Search',
		inputLabel = 'Search properties',
		onSubmit
	}: {
		title?: string;
		backgroundImage?: string;
		placeholder?: string;
		buttonText?: string;
		inputLabel?: string;
		onSubmit?: (value: string) => void;
	} = $props();

	let searchValue = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit?.(searchValue);
	}
</script>

<section class="w-full h-screen">
	<div
		class="w-full h-full opacity-90 bg-cover bg-no-repeat bg-center flex flex-col justify-center items-center"
		style={`background-image: url('${backgroundImage}')`}
	>
		<!-- Title -->
		<h1
			class="text-white text-center xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl text-xl font-semibold p-2 rounded-sm"
		>
			{title}
		</h1>

		<!-- Search Form -->
		<div class="w-full mx-auto">
			<form onsubmit={handleSubmit}>
				<div class="xl:w-1/2 lg:w-[60%] sm:w-[70%] w-[90%] mx-auto flex gap-2 md:mt-6 mt-4">
					<label for="lp2-search" class="sr-only">{inputLabel}</label>
					<input
						id="lp2-search"
						type="text"
						bind:value={searchValue}
						class="border w-full p-2 rounded-md text-xl pl-2"
						{placeholder}
					/>
					<button type="submit" class="btn btn-primary">
						{buttonText}
					</button>
				</div>
			</form>
		</div>
	</div>
</section>

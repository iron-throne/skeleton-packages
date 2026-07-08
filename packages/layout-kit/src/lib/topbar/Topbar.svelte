<script lang="ts">
	import Header from './Header.svelte';
	import type { TopbarProps } from './types';

	let props: TopbarProps = $props();
</script>

<Header {...props} />

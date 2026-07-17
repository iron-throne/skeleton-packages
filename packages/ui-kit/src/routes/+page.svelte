<script lang="ts">
	import { Tabs } from '$lib';
	import { Person, PersonArmsUp } from 'svelte-bootstrap-icons';
	let active = $state('tasks');
</script>

<Tabs
	tabs={[
		{
			id: 'overview',
			label: 'Project Overview',
			icon: Person
		},
		{
			id: 'tasks',
			label: 'Pending Reviews',
			badge: 12,
			icon: PersonArmsUp
		},
		{
			id: 'settings',
			label: 'Configuration',
			icon: PersonArmsUp
		},
		{
			id: 'archive',
			label: 'Archived',
			badge: '34',
			icon: PersonArmsUp
		}
	]}
	bind:active
/>

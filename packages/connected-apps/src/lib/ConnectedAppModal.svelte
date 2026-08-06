<script lang="ts">
	import { Dialog } from '@aryagg/ui-kit';
	import { ESize } from '@aryagg/types';
	import ConnectedAppHost from './ConnectedAppHost.svelte';
	import type { ActiveConnectedApp } from './store.svelte';
	import type { ConnectedAppHostInfo, ConnectedAppUser } from './types';

	let {
		active,
		hostInfo,
		user,
		theme,
		locale,
		navigate,
		onClose,
	}: {
		/** Pass `yourConnectedAppStore.current` here. */
		active: ActiveConnectedApp | null;
		hostInfo: ConnectedAppHostInfo;
		user: ConnectedAppUser | null;
		theme: 'light' | 'dark';
		locale: string;
		navigate: (path: string) => void;
		onClose: () => void;
	} = $props();
</script>

{#if active}
	<Dialog
		open={true}
		title={active.manifest.name}
		description={active.manifest.description ?? ''}
		size={ESize.XL3}
		bodyClass="p-0! h-[70vh]"
		dismissible
		closeOnBackdrop
		closeOnEsc
		{onClose}
	>
		<ConnectedAppHost
			manifest={active.manifest}
			mode="modal"
			params={active.params}
			{hostInfo}
			{user}
			{theme}
			{locale}
			{navigate}
			{onClose}
		/>
	</Dialog>
{/if}

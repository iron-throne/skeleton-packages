import type { ISnackData } from '@aryagg/types';

function createSnackStore() {
	let current = $state<ISnackData | null>(null);

	return {
		get current() { return current; },
		show(data: ISnackData) { current = data; },
		close() { current = null; }
	};
}

export const snackStore = createSnackStore();

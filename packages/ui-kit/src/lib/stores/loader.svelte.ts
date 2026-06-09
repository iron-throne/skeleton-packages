function createLoaderStore() {
	let isVisible = $state(false);

	return {
		get isVisible() { return isVisible; },
		show() { isVisible = true; },
		hide() { isVisible = false; }
	};
}

export const loaderStore = createLoaderStore();

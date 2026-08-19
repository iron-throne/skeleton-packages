import { ESnackType, type ISnackData } from "@aryagg/types";

const DEFAULT_TIMEOUT = 3000;

const createSnackStore = () => {
	let current = $state<ISnackData | null>(null);

	return {
		get current() { return current; },
		show(data: ISnackData) { current = data; },
		showSuccess(message: string, timeOut: number = DEFAULT_TIMEOUT) { current = { message, timeOut, type: ESnackType.SUCCESS } },
		showWarning(message: string, timeOut: number = DEFAULT_TIMEOUT) { current = { message, timeOut, type: ESnackType.WARNING } },
		showInfo(message: string, timeOut: number = DEFAULT_TIMEOUT) { current = { message, timeOut, type: ESnackType.INFO } },
		showError(message: string, timeOut: number = DEFAULT_TIMEOUT) { current = { message, timeOut, type: ESnackType.DANGER } },
		close() { current = null; }
	};
}

export const snackStore = createSnackStore();

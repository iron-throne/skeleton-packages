import type { ConnectedAppBus } from './types';

/** Minimal typed pub/sub — one instance per mounted connected app. */
export function createConnectedAppBus(): ConnectedAppBus {
	const listeners = new Map<string, Set<(payload: unknown) => void>>();

	return {
		emit(event, payload) {
			listeners.get(event)?.forEach((handler) => handler(payload));
		},
		on(event, handler) {
			let set = listeners.get(event);
			if (!set) {
				set = new Set();
				listeners.set(event, set);
			}
			set.add(handler);
			return () => set!.delete(handler);
		},
	};
}

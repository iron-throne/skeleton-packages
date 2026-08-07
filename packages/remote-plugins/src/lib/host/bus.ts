// on(event, handler) → subscribe
// emit(event, payload) → notify subscribers
// unsubscribe() → remove handler
// clear() → remove everything during destruction

import type { IRemotePluginBus } from "../types";

export const createRemotePluginBus = (): IRemotePluginBus => {
    // Map of event name -> set of handlers listening for it.
    // A Set (vs. an array) makes unsubscribe an O(1) delete instead of an
    // indexOf + splice, and silently ignores the same handler being
    // registered twice.
    const handlers = new Map<string, Set<(payload?: unknown) => void>>();

    const unsubscribe = (event: string, handler: (payload?: unknown) => void) => {
        handlers.get(event)?.delete(handler);
    };

    return {
        // Emit an event to all subscribers. Copy to an array first so a
        // handler that subscribes/unsubscribes mid-emit can't corrupt the
        // Set we're currently iterating.
        emit(event: string, payload?: unknown) {
            const eventHandlers = handlers.get(event);
            if (eventHandlers) {
                Array.from(eventHandlers).forEach((handler) => handler(payload));
            }
        },
        // Subscribe to an event with a handler function. Returns an
        // unsubscribe function — this is the primary way to unsubscribe,
        // no need to hold onto the original handler reference.
        on(event: string, handler: (payload?: unknown) => void) {
            let eventHandlers = handlers.get(event);
            if (!eventHandlers) {
                eventHandlers = new Set();
                handlers.set(event, eventHandlers);
            }
            eventHandlers.add(handler);
            return () => unsubscribe(event, handler);
        },
        // Unsubscribe a specific handler from an event.
        unsubscribe,
        // Remove every handler for every event. Called once when a plugin
        // instance is destroyed so it can't leak listeners (or keep
        // receiving events) after it's gone.
        clear() {
            handlers.clear();
        }
    };
};

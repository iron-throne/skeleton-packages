// on(event, handler) → subscribe
// emit(event, payload) → notify subscribers
// unsubscribe() → remove handler
// clear() → remove everything during destruction

import type { IRemotePluginBus } from "../types";

export const createRemotePluginBus = (): IRemotePluginBus => {
    // Map of event names to arrays of handlers [A list of functions that should run when a specific event happens]
    const handlers: Record<string, Array<(payload?: unknown) => void>> = {};

    return {
        // Emit an event to all subscribers
        emit(event: string, payload?: unknown) {
            const eventHandlers = handlers[event];
            if (eventHandlers) {
                eventHandlers.forEach((handler) => handler(payload));
            }
        },
        // Subscribe to an event with a handler function
        on(event: string, handler: (payload?: unknown) => void) {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event].push(handler);
            return () => this.unsubscribe(event, handler);
        },
        // Unsubscribe a specific handler from an event
        unsubscribe(event: string, handler: (payload: unknown) => void) {
            const eventHandlers = handlers[event];
            if (eventHandlers) {
                const index = eventHandlers.indexOf(handler);
                if (index !== -1) {
                    eventHandlers.splice(index, 1);
                }
            }
        },
        // Clear all handlers for all events
        clear() {
            Object.keys(handlers).forEach((event) => {
                handlers[event].length = 0;
            });
        }
    };

}
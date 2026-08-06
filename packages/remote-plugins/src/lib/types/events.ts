/** Bidirectional pub/sub shared between host and remote for the lifetime of one mount. */
export interface IRemotePluginBus {
    emit(event: string, payload?: unknown): void;
    /** Returns an unsubscribe function. */
    on(event: string, handler: (payload?: unknown) => void): () => void;
    unsubscribe(event: string, handler: (payload?: unknown) => void): void;
    clear(): void;
}
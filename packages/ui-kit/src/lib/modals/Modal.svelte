<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import type { Snippet } from 'svelte';
    import { XLg } from 'svelte-bootstrap-icons';

    let {
        open = $bindable(false),
        title = '',
        size = 'md',
        closeOnBackdrop = true,
        closeOnEsc = true,
        children,
        footer,
    }: {
        open: boolean;
        title?: string;
        /** sm | md | lg | xl | full */
        size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
        closeOnBackdrop?: boolean;
        closeOnEsc?: boolean;
        children: Snippet;
        footer?: Snippet<[{ close: () => void }]>;
    } = $props();

    const sizeClass: Record<string, string> = {
        sm:   'max-w-sm',
        md:   'max-w-md',
        lg:   'max-w-lg',
        xl:   'max-w-2xl',
        full: 'max-w-full mx-4',
    };

    function close() { open = false; }

    function handleBackdrop() { if (closeOnBackdrop) close(); }

    function handleKeydown(e: KeyboardEvent) {
        if (closeOnEsc && e.key === 'Escape') close();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        class="fixed inset-0 z-200 flex items-center justify-center p-4"
        transition:fade={{ duration: 180 }}
    >
        <!-- Dim layer -->
        <div
            class="absolute inset-0 bg-black/50"
            onclick={handleBackdrop}
        ></div>

        <!-- Panel -->
        <div
            class="relative w-full {sizeClass[size]} bg-surface-primary rounded-2xl shadow-2xl border  flex flex-col max-h-[90vh]"
            transition:scale={{ duration: 220, easing: cubicOut, start: 0.95 }}
        >
            <!-- Header -->
            {#if title}
                <div class="flex items-center justify-between px-6 py-4 border-b  shrink-0">
                    <h2 id="modal-title" class="text-base font-semibold text-content-primary">
                        {title}
                    </h2>
                    <button
                        onclick={close}
                        class="p-1.5 rounded-md text-content-tertiary hover:text-content-primary hover:bg-surface-secondary transition"
                        aria-label="Close modal"
                    >
                        <XLg width={16} height={16} />
                    </button>
                </div>
            {:else}
                <!-- No title: show close button in absolute corner -->
                <button
                    onclick={close}
                    class="absolute top-3 right-3 p-1.5 rounded-md text-content-tertiary hover:text-content-primary hover:bg-surface-secondary transition z-10"
                    aria-label="Close modal"
                >
                    <XLg width={16} height={16} />
                </button>
            {/if}

            <!-- Body -->
            <div class="flex-1 overflow-y-auto px-6 py-5 text-sm text-content-primary">
                {@render children()}
            </div>

            <!-- Footer (optional) -->
            {#if footer}
                <div class="px-6 py-4 border-t  shrink-0 flex items-center justify-end gap-3">
                    {@render footer({ close })}
                </div>
            {/if}
        </div>
    </div>
{/if}

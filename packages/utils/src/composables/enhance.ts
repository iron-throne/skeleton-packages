import type { ActionResult } from "@aryagg/types";

export interface EnhanceSubmitContext {
    formData: FormData;
    cancel: () => void;
}

export type EnhanceResultHandler = (input: {
    result: ActionResult;
    update: () => Promise<void>;
}) => void | Promise<void>;

export type EnhanceSubmitFn = (
    context: EnhanceSubmitContext
) => void | EnhanceResultHandler | Promise<void | EnhanceResultHandler>;

/**
 * Drop-in replacement for SvelteKit's `use:enhance` that doesn't rely on
 * `$app/forms` (only available inside a running SvelteKit app, not in a
 * component library). Submits via `fetch` using the same wire protocol
 * SvelteKit's own form actions expect, so it still works against a real
 * `+page.server.ts` action — the host app just needs to be SvelteKit,
 * this package itself doesn't.
 *
 * Use as a directive:
 *   <form use:enhance={handleSubmit}>
 */
export function enhance(
    form: HTMLFormElement,
    submit: EnhanceSubmitFn
): { destroy: () => void } {
    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        let cancelled = false;
        const formData = new FormData(form, event.submitter);
        const callback = await submit({ formData, cancel: () => (cancelled = true) });
        if (cancelled) return;

        const actionUrl = new URL(form.action);
        let result: ActionResult;
        try {
            const response = await fetch(actionUrl, {
                method: "POST",
                body: formData,
                headers: { "x-sveltekit-action": "true" }
            });
            result = await response.json();
        } catch (error) {
            result = { type: "error", error };
        }

        const update = async () => {
            if (result.type === "redirect") {
                window.location.href = result.location;
            } else {
                window.location.reload();
            }
        };

        if (callback) {
            await callback({ result, update });
        } else {
            await update();
        }
    }

    form.addEventListener("submit", handleSubmit);

    return {
        destroy() {
            form.removeEventListener("submit", handleSubmit);
        }
    };
}

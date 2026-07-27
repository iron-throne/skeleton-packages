/**
 * Svelte action that moves `node` to `target` (default: `document.body`) once mounted,
 * so it escapes any ancestor's `overflow: hidden/auto/scroll` clipping - e.g. a flyout
 * submenu nested inside a scrollable dropdown panel.
 *
 * Use as a directive:
 *   <div use:portal>...</div>
 *   <div use:portal={'#my-overlay-root'}>...</div>
 */
export function portal(
    node: HTMLElement,
    target: HTMLElement | string = 'body'
): { destroy: () => void } {
    function resolveTarget(t: HTMLElement | string): HTMLElement | null {
        return typeof t === 'string' ? document.querySelector(t) : t;
    }

    resolveTarget(target)?.appendChild(node);

    return {
        destroy() {
            node.parentNode?.removeChild(node);
        }
    };
}

/**
 * Svelte action that calls `callback` whenever the user clicks outside `node`.
 *
 * Use as a directive:
 *   <div use:clickOutside={() => open = false}>
 *
 * Or call manually (e.g. inside onMount) and store the returned `destroy`:
 *   const { destroy } = clickOutside(el, () => open = false);
 */
export function clickOutside(
    node: HTMLElement,
    callback: () => void
): { destroy: () => void } {
    function handleClick(event: MouseEvent) {
        if (node && !node.contains(event.target as Node)) {
            callback();
        }
    }

    document.addEventListener('mousedown', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('mousedown', handleClick, true);
        }
    };
}

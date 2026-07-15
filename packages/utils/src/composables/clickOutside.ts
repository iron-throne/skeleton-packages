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
        const target = event.target as Node;
        if (node.contains(target)) return;

        // Portaled content (e.g. a nested dropdown flyout moved to <body> to escape a
        // scrollable ancestor) is no longer a DOM descendant of `node`, so it's tagged with
        // `data-dropdown-menu` and treated as "inside" regardless of where it was moved to.
        if (target instanceof Element && target.closest('[data-dropdown-menu]')) return;

        callback();
    }

    document.addEventListener('mousedown', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('mousedown', handleClick, true);
        }
    };
}

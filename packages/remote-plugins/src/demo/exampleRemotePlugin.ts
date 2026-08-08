// This file stands in for a REMOTE plugin — i.e. code that, in production,
// would live in a totally separate repo/deploy (its own build, its own
// server) and only be loaded by the host at runtime via `manifest.entryUrl`.
// It is kept in this repo purely so `App.svelte` has something real to load
// and you can see the whole round trip without standing up a second server.
//
// Notice this file never imports Svelte, and never imports anything from
// `../lib/host`. A remote plugin only ever talks to `../lib/remote` (for
// `defineRemotePlugin`) and `../lib/types` (for type hints) — it must not
// reach into host internals.

import { defineRemotePlugin } from '../lib/remote';
import { ERemoteAppEvent, type IRemotePluginContext } from '../lib/types';

export default defineRemotePlugin((target, context) => {
	const root = document.createElement('div');
	root.className = 'remote-plugin-card';
	root.innerHTML = `
		<p class="remote-plugin-card__badge">remote plugin</p>
		<h3>Hello from across the network 👋</h3>
		<p>theme: <strong data-field="theme"></strong></p>
		<p>user: <strong data-field="user"></strong></p>
		<button type="button" data-action="emit">Send an event to the host</button>
		<button type="button" data-action="navigate">Ask the host to navigate</button>
	`;
	target.appendChild(root);

	const themeEl = root.querySelector<HTMLElement>('[data-field="theme"]')!;
	const userEl = root.querySelector<HTMLElement>('[data-field="user"]')!;
	const emitBtn = root.querySelector<HTMLButtonElement>('[data-action="emit"]')!;
	const navigateBtn = root.querySelector<HTMLButtonElement>('[data-action="navigate"]')!;

	const render = (ctx: IRemotePluginContext) => {
		themeEl.textContent = ctx.theme;
		userEl.textContent = ctx.user?.name ?? 'anonymous';
	};
	render(context);

	const onEmitClick = () => {
		context.bus.emit(ERemoteAppEvent.CUSTOM_EVENT, {
			message: 'The remote plugin says hi!',
			at: new Date().toLocaleTimeString()
		});
	};
	const onNavigateClick = () => context.bus.emit(ERemoteAppEvent.NAVIGATE, { path: '/apps/demo' });

	emitBtn.addEventListener('click', onEmitClick);
	navigateBtn.addEventListener('click', onNavigateClick);

	// Tell the host we finished mounting and are visible.
	context.bus.emit(ERemoteAppEvent.READY);

	return {
		// Called by the host whenever it re-mounts with a fresh context
		// (theme toggled, user changed, etc.) — no full remount needed.
		update(nextContext) {
			render(nextContext);
		},
		// Called once by mountRemotePlugin()'s returned controller.
		// Must undo everything mount() did: DOM nodes and listeners.
		destroy() {
			emitBtn.removeEventListener('click', onEmitClick);
			navigateBtn.removeEventListener('click', onNavigateClick);
			target.removeChild(root);
		}
	};
});

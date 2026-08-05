import type { Handle } from '@sveltejs/kit';

/**
 * A hooks.server.ts `handle` that CORS-allows a fixed set of origins to load this
 * app's connected-app remote bundles under `/remote/*` (never `*` — a connected
 * app's remote entry executes arbitrary code in whatever page loads it).
 *
 * NOTE: this only takes effect while requests pass through SvelteKit's `handle`
 * — true in dev (`vite dev`), but adapter-node's production server serves
 * /static assets via its own middleware *before* `handle` runs, so a real
 * deployment needs the same allowlist applied at the reverse proxy/CDN in front
 * of it (or serve the remote bundle from a `+server.ts` route instead of a
 * static asset if that's not available).
 */
export function createConnectedAppsCorsHandle(allowedOrigins: string[]): Handle {
	return async ({ event, resolve }) => {
		// event.url.pathname still carries kit.paths.base (e.g. "/app/remote/...")
		// when one is configured, so check for the segment rather than a strict prefix.
		if (!event.url.pathname.includes('/remote/')) return resolve(event);

		const requestOrigin = event.request.headers.get('origin');
		const response = await resolve(event);
		if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
			response.headers.set('Access-Control-Allow-Origin', requestOrigin);
			response.headers.set('Vary', 'Origin');
		}
		return response;
	};
}

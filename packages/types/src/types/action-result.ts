/**
 * Mirrors SvelteKit's own `ActionResult` shape, defined here so packages
 * that need it don't have to depend on `@sveltejs/kit` directly.
 */
export type ActionResult<
  Success extends Record<string, unknown> | undefined = Record<string, unknown>,
  Failure extends Record<string, unknown> | undefined = Record<string, unknown>,
> =
  | { type: "success"; status: number; data?: Success }
  | { type: "failure"; status: number; data?: Failure }
  | { type: "redirect"; status: number; location: string }
  | { type: "error"; status?: number; error: unknown };

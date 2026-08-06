# layout-kit

A Svelte 5 layout component library (topbar, sidebar, login screens, error pages, landing pages) for aryagg projects. Built with Tailwind CSS v4 and TypeScript. No SvelteKit dependency — works in any Svelte 5 app.

## Stack

- **Svelte 5** with runes mode enforced across the project
- **Vite** — dev server and packaging (via `@sveltejs/package`)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **TypeScript** with strict config
- **ESLint + Prettier** (with `eslint-plugin-svelte`)
- **`@aryagg/theme`**, **`@aryagg/types`**, **`@aryagg/utils`**, **`@aryagg/ui-kit`** — shared design system packages

## Getting started

Install dependencies:

```sh
npm install
```

Start the dev server (a live component showcase at `src/routes`):

```sh
npm run dev

# open in browser automatically
npm run dev -- --open
```

## Project structure

```
src/
  lib/        ← library source (exported to consumers)
  routes/     ← showcase / preview app (not published)
  App.svelte  ← dev-only preview shell that mounts the showcase
  main.ts     ← dev-only Vite entry point
```

Everything inside `src/lib` is part of the published library. `src/routes`, `src/App.svelte` and `src/main.ts` only exist to preview components locally and are never published.

## Building

Build and package the library:

```sh
npm run build
```

This runs `svelte-package` + `publint` to produce the published output in `dist/`.

## Type checking & linting

```sh
npm run check          # svelte-check + tsc
npm run check:watch    # watch mode

npm run lint           # prettier + eslint
npm run format         # auto-format with prettier
```

## Publishing

1. Set the `"name"` field in `package.json` to your desired package name.
2. Add a `"license"` field and a `LICENSE` file (e.g. [MIT](https://opensource.org/license/mit/)).
3. Publish to npm:

```sh
npm publish
```

The `"exports"` field in `package.json` exposes `./dist/index.js` (Svelte) and `./dist/index.d.ts` (types) for consumers.

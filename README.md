# skeleton-packages

A monorepo of shared npm packages for the Skeleton Svelte project.

## Packages

| Package | Description |
|---|---|
| [`@aryagg/types`](packages/types) | Shared TypeScript types and interfaces |
| [`@aryagg/utils`](packages/utils) | Shared utility functions |

## Structure

```
skeleton-packages/
├── packages/
│   ├── types/     # @aryagg/types
│   └── utils/     # @aryagg/utils
└── package.json   # workspace root
```

## Getting Started

```bash
npm install
```

## Publishing

Each package is versioned and published independently under the `@aryagg` scope.

### Prerequisites

- Node.js 18+
- An [npmjs.com](https://www.npmjs.com) account with access to the `@aryagg` scope

### Steps

**1. Login to npm**
```bash
npm login
```

**2. Build the package**
```bash
# build a specific package
npm run build -w packages/types
npm run build -w packages/utils
```

**3. Bump the version**
```bash
# patch = bug fix (1.0.0 → 1.0.1)
# minor = new feature (1.0.0 → 1.1.0)
# major = breaking change (1.0.0 → 2.0.0)
npm version patch -w packages/types
```

**4. Publish**
```bash
npm publish -w packages/types --access public
npm publish -w packages/utils --access public
```

> `--access public` is required for scoped packages (`@aryagg/*`) on a free npm account.

### Verify

```bash
npm view @aryagg/types
```

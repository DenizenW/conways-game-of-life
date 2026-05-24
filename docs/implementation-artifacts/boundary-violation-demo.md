# Module Boundary Violation Demonstration

Proof that `@nx/enforce-module-boundaries` catches cross-boundary imports in this workspace.

## Setup

The Nx tag taxonomy assigns each project a `scope:*` tag. The `depConstraints` in `eslint.config.mjs` restrict which scopes can import from which. For `scope:sim`, the rule is:

```js
{ sourceTag: 'scope:sim', onlyDependOnLibsWithTags: ['scope:types'] }
```

This means `libs/sim` can only import from `libs/types` — no other workspace project.

## Deliberate violation

Two imports were added to `libs/sim/src/index.ts` on a throwaway branch:

```ts
// Workspace project import (should trigger boundary rule)
import { apiClient } from '@conways-game-of-life/api-client';

// npm package import (should NOT trigger boundary rule)
import * as React from 'react';
```

## Lint output

```
$ pnpm nx lint sim

> nx run @conways-game-of-life/sim:lint

> eslint .

/libs/sim/src/index.ts
  4:1   error    A project tagged with "scope:sim" can only depend on libs tagged with "scope:types"  @nx/enforce-module-boundaries
  4:10  warning  'apiClient' is defined but never used                                                @typescript-eslint/no-unused-vars
  5:13  warning  'React' is defined but never used                                                    @typescript-eslint/no-unused-vars

✖ 3 problems (1 error, 2 warnings)

NX   Running target lint for project @conways-game-of-life/sim failed
```

## Findings

1. The workspace import (`@conways-game-of-life/api-client`) correctly triggers `@nx/enforce-module-boundaries` with a clear error message explaining which tag constraint was violated.
2. The npm package import (`react`) does **not** trigger the boundary rule. This is expected: `@nx/enforce-module-boundaries` only governs imports between Nx workspace projects, not bare npm dependencies. A separate `no-restricted-imports` ESLint rule (planned for the sim library) will close this gap.
3. The violation produces a hard lint **error** (not warning), which means CI would block any PR containing this import.

## Verification: clean state passes

After reverting the violation on the feature branch:

```
$ pnpm nx lint sim

> nx run @conways-game-of-life/sim:lint
> eslint .

NX   Successfully ran target lint for project @conways-game-of-life/sim
```

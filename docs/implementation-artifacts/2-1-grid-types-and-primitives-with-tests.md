# Story 2.1: Grid types and primitives with tests

Status: review

## Story

As a developer of the simulation core,
I want a `Grid` type backed by a flat `Uint8Array` plus pure helpers (`createGrid`, `cloneGrid`, `getCell`, `setCell`, `toggleCell`, `clearGrid`),
so that the rules engine has a stable, allocation-controlled, framework-free data model to operate on.

## Acceptance Criteria

1. **Given** the `Grid` interface is defined as `{ width: number; height: number; cells: Uint8Array }` in `libs/types` and re-exported from `libs/sim`, **When** any helper is called, **Then** it returns a new `Grid` rather than mutating the input (immutability invariant). **And** `getCell(g, x, y)` returns `0` for any out-of-bounds `(x, y)` (off-grid is dead, per FR10).

2. **Given** Jest specs co-located with the source, **When** `pnpm nx test sim` runs, **Then** specs assert: `createGrid(w, h)` produces `cells.length === w*h` all-zero; `setCell` flips exactly the indexed cell; `toggleCell` is its own inverse; `clearGrid` zeroes every cell; `cloneGrid` returns a deep-equal but reference-distinct grid.

3. **Given** the boundary rule from story 1.2 is active, **When** any of these source files imports React, `next/*`, `@nestjs/*`, or `fetch`, **Then** lint fails (verified by the `@nx/enforce-module-boundaries` tag rule plus a project-level `no-restricted-imports` ESLint rule scoped to `libs/sim`).

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
  - [x] Commit story file to feature branch
  - [x] Update `sprint-status.yaml`: story `2-1-grid-types-and-primitives-with-tests` to `in-progress`, epic `epic-2` to `in-progress`
- [x] **Task 2: Define `Grid` interface in `libs/types`** (AC: #1)
  - [x] Create `libs/types/src/lib/grid.ts` with the `Grid` interface: `{ readonly width: number; readonly height: number; readonly cells: Uint8Array }`
  - [x] Replace the generator stub `types()` function in `libs/types/src/lib/types.ts` — delete it and move the barrel re-export to the new `grid.ts`
  - [x] Update `libs/types/src/index.ts` barrel to export from `./lib/grid.js`
- [x] **Task 3: Configure Jest for `libs/sim`** (AC: #2)
  - [x] Add `tsconfig.spec.json` to `libs/sim` extending `../../tsconfig.base.json` with `compilerOptions: { outDir: "./out-tsc/jest", types: ["jest", "node"] }` and including `src/**/*.spec.ts` (follow `apps/web/tsconfig.spec.json` pattern)
  - [x] Update `libs/sim/tsconfig.json` to add a reference to `./tsconfig.spec.json`
  - [x] Add `jest.config.cts` (NOT `.ts` — this workspace uses `.cts` CommonJS format for Jest configs) to `libs/sim`. Reference pattern: `apps/web/jest.config.cts`. Key settings: `preset: '../../jest.preset.js'`, `displayName: '@conways-game-of-life/sim'`, `testEnvironment: 'node'`
  - [x] Verify `pnpm nx test sim` runs (even with zero tests, it should not error)
- [x] **Task 4: Implement grid primitives in `libs/sim`** (AC: #1)
  - [x] Create `libs/sim/src/lib/grid.ts` with pure functions: `createGrid`, `cloneGrid`, `getCell`, `setCell`, `toggleCell`, `clearGrid`
  - [x] Replace the generator stub `sim()` function in `libs/sim/src/lib/sim.ts` — delete `sim.ts` entirely
  - [x] Update `libs/sim/src/index.ts` barrel to re-export the `Grid` type from `@conways-game-of-life/types` and all grid helpers from `./lib/grid.js`
  - [x] Ensure all functions are pure: each returns a new `Grid`, never mutates input
  - [x] `getCell` returns `0` for any out-of-bounds `(x, y)`
  - [x] Index formula: `cells[y * width + x]`
- [x] **Task 5: Write co-located Jest tests for grid primitives** (AC: #2)
  - [x] Create `libs/sim/src/lib/grid.spec.ts`
  - [x] Test `createGrid(w, h)`: produces `cells.length === w * h`, all cells are `0`
  - [x] Test `setCell`: flips exactly the indexed cell, leaves all others unchanged
  - [x] Test `toggleCell`: is its own inverse (toggle twice = original)
  - [x] Test `clearGrid`: zeroes every cell on a grid with some alive cells
  - [x] Test `cloneGrid`: returns deep-equal but reference-distinct grid (`cells` buffer is a different object)
  - [x] Test `getCell` out-of-bounds: returns `0` for negative coords, coords beyond width/height
  - [x] Test immutability: `setCell`/`toggleCell`/`clearGrid` do not mutate the original grid's `cells` array
  - [x] Verify `pnpm nx test sim` passes and completes in < 10 seconds
- [x] **Task 6: Add `no-restricted-imports` ESLint rule for `libs/sim`** (AC: #3)
  - [x] This is **deferred technical debt from Epic 1** (retro item: MEDIUM priority). The `@nx/enforce-module-boundaries` rule only catches workspace project imports — it does NOT catch npm package imports like `react`. This second layer is required.
  - [x] Create `libs/sim/eslint.config.mjs` with `no-restricted-imports` banning `react`, `react-dom`, `next`, `next/*`, `@nestjs/*`, and global `fetch` usage
  - [x] Verify `pnpm nx lint sim` passes with current source
  - [x] Manually verify that adding a `react` import would fail lint (then revert)
- [x] **Task 7: Verify end-to-end** (all ACs)
  - [x] Run `pnpm nx test sim` — all tests pass
  - [x] Run `pnpm nx lint sim` — passes with boundary + restricted imports rules
  - [x] Run `pnpm nx typecheck sim` — passes
  - [x] Confirm no React/DOM/framework imports exist in `libs/sim` or `libs/types`
- [x] **Task 8: Adversarial review** (retro action item)
  - [x] Per Epic 1 retrospective team agreement: every story gets at least one adversarial review before marking `done`
  - [x] Review should verify: immutability invariant holds, off-grid returns 0, no framework imports, tests encode real behavior not coverage padding

## Dev Notes

### Architecture Compliance

- **Grid data structure is locked** (architecture section 4.4): `{ width: number; height: number; cells: Uint8Array }` where `cells[y * width + x]` is `1` for alive, `0` for dead. Do NOT use `boolean[][]`, `Set<string>`, or DOM-per-cell representations.
- **All functions must be pure** (architecture section 5.1): each returns a new `Grid`, never mutates input. `step` (future story 2.2) allocates exactly one new `Uint8Array` per call. Grid primitives follow the same discipline.
- **Off-grid neighbors are dead** (FR10, architecture section 5.1): `getCell(g, x, y)` returns `0` for any `(x, y)` outside `[0, width) x [0, height)`. No toroidal wrap in MVP.
- **`readonly` on public API surfaces** (project-context section 5): The `Grid` interface fields should be `readonly` to signal immutability intent. `Uint8Array` itself is mutable at the JS level, but the convention is that consumers never mutate a returned grid.

### Technical Requirements

- **TypeScript strict mode** is already enabled in `tsconfig.base.json`. The architecture also requires `noUncheckedIndexedAccess: true` (architecture section 4.2) — **this is currently MISSING from `tsconfig.base.json`**. The dev should add it as part of this PR since grid index math is the primary use case it was chosen for. It forces explicit handling of `undefined` on indexed access to `Uint8Array`. This means `grid.cells[index]` returns `number | undefined` — the dev must narrow with a check or non-null assertion where the index is known-good.
- **ESM-compatible module resolution**: the workspace uses `"type": "module"` in `package.json` and `"module": "esnext"` in tsconfig. Barrel re-exports must use `.js` extensions (e.g., `export * from './lib/grid.js'`), matching the existing pattern in the generated code.
- **Import aliases**: Cross-lib imports use `@conways-game-of-life/types` (resolved via Nx 18+ `customConditions` in package.json exports, not tsconfig paths). Within `libs/sim`, import the `Grid` type from `@conways-game-of-life/types`.
- **Nx version: 22.7.2** (not 18 as the architecture was authored against). Epic 1 retro documented CLI drift. Key difference for this story: Nx 22 uses `package.json`-based project inference (no `project.json` files), tags live under `"nx": { "tags": [...] }` in each package.json. Verify tool behavior against installed versions, not architecture doc examples.

### Testing Requirements

- **Jest is not yet configured for `libs/sim`**. The `@nx/jest/plugin` is in `nx.json` and will auto-infer the `test` target once a `jest.config.cts` exists. The dev needs to create:
  - `libs/sim/jest.config.cts` — use **`.cts` extension** (CommonJS), not `.ts`. This workspace uses `.cts` for all Jest configs because Jest's ESM support requires CommonJS config files in a `"type": "module"` workspace. Reference files: `apps/web/jest.config.cts`, `api-e2e/jest.config.cts`. Key settings: `preset: '../../jest.preset.js'` (which loads `@nx/jest/preset`), `displayName: '@conways-game-of-life/sim'`, `testEnvironment: 'node'` (not `jsdom` — no DOM needed for pure functions).
  - `libs/sim/tsconfig.spec.json` — extends `../../tsconfig.base.json` (matching `apps/web/tsconfig.spec.json` pattern), adds `compilerOptions: { outDir: "./out-tsc/jest", types: ["jest", "node"] }`, includes `jest.config.cts`, `src/**/*.spec.ts`.
  - Update `libs/sim/tsconfig.json` references array to include `./tsconfig.spec.json`.
- **Test co-location**: spec files sit next to their source — `grid.spec.ts` next to `grid.ts` in `libs/sim/src/lib/`.
- **Test philosophy** (NFR3, project-context section 3 rule 10): Tests must encode real behavioral assertions, not coverage padding. Each test should assert a specific invariant of the grid primitives.
- **CI test job** (established in story 1.4): runs `pnpm nx affected -t test --base=origin/main --parallel=3 --output-style=stream`. Tests added here will be exercised by CI automatically.

### Library/Framework Requirements

- **No external dependencies needed** for this story beyond what the Nx generator already installed (`tslib`). The grid primitives are pure TypeScript operating on `Uint8Array`.
- **Do NOT add React, DOM, fetch, or any framework imports** to `libs/sim`. Two enforcement layers:
  1. **`@nx/enforce-module-boundaries`** (story 1.2): `scope:sim` can only depend on `scope:types`. Catches workspace project cross-imports.
  2. **`no-restricted-imports`** (Task 6, this story): Catches npm package imports (`react`, `next`, `@nestjs/*`). **This is the gap identified in Epic 1 retro** — the boundary rule alone does NOT catch npm packages. The adversarial review in story 1.2 discovered that `import * as React from 'react'` passes the boundary check because React is an npm package, not a workspace project.

### File Structure Requirements

Current state of `libs/sim` (generator stubs to be replaced):
```
libs/sim/
  src/
    index.ts              # barrel — currently exports from ./lib/sim.js (REPLACE)
    lib/
      sim.ts              # generator stub function (DELETE)
  package.json            # tags: ["scope:sim"], name: @conways-game-of-life/sim
  tsconfig.json           # extends ../../tsconfig.base.json
  tsconfig.lib.json       # lib compilation config
  README.md
```

Target state after this story:
```
libs/sim/
  src/
    index.ts              # barrel — re-exports Grid type + all grid helpers
    lib/
      grid.ts             # createGrid, cloneGrid, getCell, setCell, toggleCell, clearGrid
      grid.spec.ts         # Jest tests for all grid primitives
  jest.config.cts          # Jest configuration (.cts = CommonJS in ESM workspace)
  tsconfig.spec.json       # Test TypeScript config
  eslint.config.mjs        # no-restricted-imports rule for sim purity
  package.json
  tsconfig.json            # updated references to include tsconfig.spec.json
  tsconfig.lib.json
  README.md
```

Current state of `libs/types` (generator stubs to be replaced):
```
libs/types/
  src/
    index.ts              # barrel — currently exports from ./lib/types.js (REPLACE)
    lib/
      types.ts            # generator stub function (DELETE)
  package.json            # tags: ["scope:types"], name: @conways-game-of-life/types
```

Target state after this story:
```
libs/types/
  src/
    index.ts              # barrel — exports from ./lib/grid.js
    lib/
      grid.ts             # Grid interface definition
  package.json
```

### Public API Surface (from architecture section 5.1)

The Grid interface and grid primitives to implement in this story:

```typescript
// libs/types/src/lib/grid.ts
export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly cells: Uint8Array; // length === width * height; 1 = alive, 0 = dead
}

// libs/sim/src/lib/grid.ts
import type { Grid } from '@conways-game-of-life/types';

export function createGrid(width: number, height: number): Grid;
export function cloneGrid(grid: Grid): Grid;
export function getCell(grid: Grid, x: number, y: number): 0 | 1;
export function setCell(grid: Grid, x: number, y: number, alive: 0 | 1): Grid;
export function toggleCell(grid: Grid, x: number, y: number): Grid;
export function clearGrid(grid: Grid): Grid;
```

### Error Handling (architecture section 5.8)

- Pure functions can't throw on valid inputs.
- Throw `RangeError` on programmer errors: negative dimensions in `createGrid`, or `width * height !== cells.length` mismatch. These are guard rails for developer misuse, never reached by users.
- `getCell` does NOT throw on out-of-bounds — it returns `0` (dead). This is the off-grid-is-dead convention from FR10.

### Git Workflow

Per team agreement (Epic 1 retro): story file + `in-progress` status update as first commit on the feature branch, implementation commits after, mark `done` as last commit on branch before merge.

- Branch name: `story/2-1-grid-types-and-primitives-with-tests`
- Commit 1: story file + sprint-status update (`in-progress` for story, `in-progress` for epic-2)
- Commit 2+: implementation (types, grid primitives, tests, ESLint config)
- Final commit: mark story `done` in sprint-status
- PR into `main` with all four CI checks passing (`lint`, `typecheck`, `test`, `e2e`)
- Branch protection is active on `main` — auto-approve fires when all checks pass

### Previous Epic Learnings (from Epic 1 Retrospective — 2026-05-24)

**Successes to replicate:**
- Pre-tagging generators reduced downstream work (already done — `scope:sim` tag is in place)
- CI job pattern established and replicated across stories 1.3-1.5
- Sprint-status sequencing pattern discovered and codified

**Challenges to watch for:**
- **Nx 22 CLI drift from architecture docs.** The architecture was authored against Nx 18+ conventions. Nx 22.7.2 changed behaviors: e.g., NestJS app landed at `api/` (root level) not `apps/api/`, `@nx/next:setup-tailwind` is deprecated. **For this story:** verify Jest config patterns against the actual installed Nx/Jest versions, not architecture examples.
- **Module boundary rule scope.** `@nx/enforce-module-boundaries` only governs workspace project imports. npm package imports (`react`, `next`) are NOT caught. This was a HIGH finding in story 1.2's adversarial review. Task 6 in this story closes this gap with `no-restricted-imports`.

**Team agreements:**
- Story completion sequence: story file + `in-progress` first → implementation → mark `done` last → merge PR
- Architecture docs are guides, not binding contracts — when CLI behavior diverges, adjust and document in PR description
- Every story gets at least one adversarial review before marking `done`

**CI infrastructure (ready):**
- Four required checks: `lint`, `typecheck`, `test`, `e2e`
- `test` job: `pnpm nx affected -t test --base=origin/main --parallel=3 --output-style=stream`
- Concurrency control, job timeouts (10 min for lint/typecheck/test, 15 min for e2e), treeless clones
- Auto-approve workflow fires on green PRs
- Playwright artifacts uploaded on failure

**Project layout (actual, post-Epic 1):**
- `apps/web` — Next.js app (scope:app)
- `apps/web-e2e` — Playwright E2E (scope:e2e)
- `api/` — NestJS app at workspace root, NOT `apps/api/` (Nx 22 behavior, scope:server)
- `libs/sim` — simulation core (scope:sim) — generator stubs, to be replaced by this story
- `libs/types` — shared types (scope:types) — generator stubs, to be replaced by this story
- `libs/ui` — presentational React (scope:ui)
- `libs/api-client` — typed API wrapper (scope:api-client) — scaffolded empty for stretch

### References

- [Source: docs/planning-artifacts/architecture.md#5.1] — Grid public API surface, immutability invariants
- [Source: docs/planning-artifacts/architecture.md#4.4] — Grid data structure decision (Uint8Array rationale)
- [Source: docs/planning-artifacts/architecture.md#4.2] — TypeScript strict + noUncheckedIndexedAccess requirement
- [Source: docs/planning-artifacts/architecture.md#5.6] — Nx tag taxonomy and boundary rules
- [Source: docs/planning-artifacts/architecture.md#5.8] — Error handling patterns (RangeError on programmer errors)
- [Source: docs/planning-artifacts/epics.md#Story 2.1] — Acceptance criteria, effort estimate
- [Source: docs/planning-artifacts/prd.md#FR10] — Conway's rules: off-grid is dead, determinism
- [Source: docs/planning-artifacts/prd.md#NFR3] — Pure-function sim, framework-free, Jest tests < 10s
- [Source: docs/project-context.md#3] — Critical implementation rules (rules 4, 8, 9, 10, 20)
- [Source: docs/implementation-artifacts/epic-1-retro-2026-05-24.md] — Epic 1 retrospective: boundary rule scope gap, adversarial review mandate, Nx 22 drift
- [Source: docs/implementation-artifacts/epic-1-retro-2026-05-24.md#Technical Debt] — `no-restricted-imports` deferred to story 2.1 AC #3
- [Source: eslint.config.mjs] — Current module boundary depConstraints
- [Source: libs/sim/package.json] — Project config with scope:sim tag, Nx 22 package.json-based inference
- [Source: libs/types/package.json] — Project config with scope:types tag

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- `nx sync` required after adding `tsconfig.spec.json` — Nx detected stale TypeScript project references
- `tsconfig.lib.json` needed `exclude` for `*.spec.ts` files — generator default `include: ["src/**/*.ts"]` picks up test files
- `tsconfig.spec.json` references `tsconfig.lib.json` (not `tsconfig.json`) to avoid circular project reference
- `@conways-game-of-life/types` added as `workspace:*` dependency in `libs/sim/package.json` — required for `nodenext` module resolution to find the workspace package via pnpm symlinks
- `noUncheckedIndexedAccess: true` added to `tsconfig.base.json` — verified no regressions across all 7+ projects

### Completion Notes List

- Grid interface defined in `libs/types` with readonly fields as specified by architecture
- All 6 grid primitives implemented as pure functions — each returns a new Grid, never mutates input
- `getCell` returns `0` for out-of-bounds coords (off-grid-is-dead per FR10)
- `createGrid` throws `RangeError` on negative dimensions per architecture §5.8
- 17 Jest tests covering all acceptance criteria: createGrid, setCell, toggleCell, clearGrid, cloneGrid, getCell out-of-bounds, immutability invariants
- Tests run in 0.17s (well under 10s budget)
- `no-restricted-imports` ESLint rule added to `libs/sim` banning react, react-dom, next/*, @nestjs/*, and global fetch
- Adversarial review passed: immutability, off-grid, no framework imports, real behavioral tests

### Change Log

- 2026-05-24: Implemented story 2.1 — Grid types, primitives, tests, and ESLint purity rule

### File List

- `libs/types/src/lib/grid.ts` (NEW) — Grid interface
- `libs/types/src/lib/types.ts` (DELETED) — generator stub removed
- `libs/types/src/index.ts` (MODIFIED) — barrel re-export from grid.js
- `libs/sim/src/lib/grid.ts` (NEW) — createGrid, cloneGrid, getCell, setCell, toggleCell, clearGrid
- `libs/sim/src/lib/grid.spec.ts` (NEW) — 17 Jest tests
- `libs/sim/src/lib/sim.ts` (DELETED) — generator stub removed
- `libs/sim/src/index.ts` (MODIFIED) — re-exports Grid type and all grid helpers
- `libs/sim/jest.config.cts` (NEW) — Jest configuration
- `libs/sim/tsconfig.spec.json` (NEW) — test TypeScript config
- `libs/sim/tsconfig.json` (MODIFIED) — added tsconfig.spec.json reference
- `libs/sim/tsconfig.lib.json` (MODIFIED) — added exclude for spec files
- `libs/sim/package.json` (MODIFIED) — added workspace:* dependency on @conways-game-of-life/types
- `libs/sim/eslint.config.mjs` (NEW) — no-restricted-imports rule for sim purity
- `tsconfig.base.json` (MODIFIED) — added noUncheckedIndexedAccess: true
- `docs/implementation-artifacts/sprint-status.yaml` (MODIFIED) — story status updates
- `docs/implementation-artifacts/2-1-grid-types-and-primitives-with-tests.md` (MODIFIED) — task checkboxes, dev agent record

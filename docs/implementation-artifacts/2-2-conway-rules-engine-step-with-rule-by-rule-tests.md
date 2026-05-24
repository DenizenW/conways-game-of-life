# Story 2.2: Conway rules engine `step()` with rule-by-rule tests

Status: review

## Story

As a developer of the simulation core,
I want a pure `step(grid: Grid): Grid` that applies Conway's four rules with off-grid neighbors treated as dead,
so that FR10 has a single canonical implementation that both the web app and (stretch) the API can reuse.

## Acceptance Criteria

1. **Given** a 3x3 grid with a single live cell, **When** `step()` is applied, **Then** the resulting grid has zero live cells (rule 1: underpopulation — fewer than 2 neighbors).

2. **Given** a 3x3 grid with a 2x2 block of live cells, **When** `step()` is applied repeatedly across five generations, **Then** the grid is unchanged each generation (rule 2: survival — 2 or 3 neighbors survive; canonical still life).

3. **Given** a 5x5 grid with a horizontal blinker (three live cells in a row), **When** `step()` is applied, **Then** the next generation has a vertical blinker, and the generation after returns to horizontal (rule 4 reproduction + rule 1 underpopulation; period-2 oscillator).

4. **Given** a 5x5 grid where a live cell has 4+ live neighbors, **When** `step()` is applied, **Then** that cell is dead in the next generation (rule 3: overpopulation).

5. **Given** a grid configured per the canonical glider pattern on a sufficiently large grid, **When** `step()` is applied four times, **Then** the live-cell positions translate by `(1, 1)` relative to the start (canonical spaceship).

6. **Given** the same input grid, **When** `step()` is called 100 times in a loop on independent copies, **Then** all 100 outputs are byte-identical (determinism).

7. **Given** all the above tests are co-located in `libs/sim/src/lib/rules/conway.spec.ts`, **When** `pnpm nx test sim` runs, **Then** all tests pass and the suite completes in under 10 seconds.

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
  - [x] Commit story file to feature branch
  - [x] Update `sprint-status.yaml`: story `2-2-conway-rules-engine-step-with-rule-by-rule-tests` to `in-progress`
- [x] **Task 2: Add `RuleSet` interface to `libs/types`** (forward-compatibility for stretch story 8.1)
  - [x] Create `libs/types/src/lib/rule-set.ts` with the `RuleSet` interface from architecture §5.1
  - [x] Update `libs/types/src/index.ts` barrel to export from `./lib/rule-set.js`
- [x] **Task 3: Create `libs/sim/src/lib/rules/` directory and implement `countNeighbors`** (AC: all)
  - [x] Create `libs/sim/src/lib/rules/conway.ts`
  - [x] Implement internal `countNeighbors(grid, x, y): number` helper using `getCell` (off-grid returns 0)
  - [x] The neighbor check examines all 8 surrounding cells: `(x-1,y-1)`, `(x,y-1)`, `(x+1,y-1)`, `(x-1,y)`, `(x+1,y)`, `(x-1,y+1)`, `(x,y+1)`, `(x+1,y+1)`
- [x] **Task 4: Implement `step(grid: Grid): Grid`** (AC: #1–#6)
  - [x] Allocate exactly one new `Uint8Array` (same dimensions as input)
  - [x] For each cell `(x, y)`, count live neighbors and apply Conway's four rules:
    - Rule 1 (underpopulation): live cell with < 2 neighbors → dead
    - Rule 2 (survival): live cell with 2 or 3 neighbors → alive
    - Rule 3 (overpopulation): live cell with > 3 neighbors → dead
    - Rule 4 (reproduction): dead cell with exactly 3 neighbors → alive
  - [x] Return a new `Grid` — never mutate input
  - [x] Export `conwayRules` object conforming to `RuleSet` interface
  - [x] Export standalone `step` function as alias for `conwayRules.step`
- [x] **Task 5: Update barrel exports** (public API)
  - [x] Update `libs/sim/src/index.ts` to re-export `step`, `conwayRules`, and `RuleSet` type
  - [x] Ensure `.js` extension on barrel import path (ESM convention): `export { step, conwayRules } from './lib/rules/conway.js'`
  - [x] Re-export `RuleSet` type from `@conways-game-of-life/types`
- [x] **Task 6: Write rule-by-rule Jest tests** (AC: #1–#7)
  - [x] Create `libs/sim/src/lib/rules/conway.spec.ts`
  - [x] `describe('Rule 1: underpopulation')` — single live cell on 3x3 dies
  - [x] `describe('Rule 2: survival')` — 2x2 block still-life stable for 5 gens
  - [x] `describe('Rule 3: overpopulation')` — live cell with 4+ neighbors dies
  - [x] `describe('Rule 4: reproduction')` — dead cell with exactly 3 neighbors becomes alive
  - [x] `describe('Blinker oscillator')` — horizontal→vertical→horizontal (period 2)
  - [x] `describe('Glider spaceship')` — translates by (1,1) every 4 steps
  - [x] `describe('Determinism')` — 100 independent `step()` calls on same input produce byte-identical output
- [x] **Task 7: Verify end-to-end** (all ACs)
  - [x] Run `pnpm nx test sim` — all tests pass, suite < 10s
  - [x] Run `pnpm nx lint sim` — passes (no restricted imports in new files)
  - [x] Run `pnpm nx typecheck sim` — passes
- [x] **Task 8: Adversarial review** (team agreement from Epic 1 retro)
  - [x] Verify: `step()` is pure — allocates exactly one new `Uint8Array`, never mutates input
  - [x] Verify: off-grid neighbors are dead (no toroidal wrap)
  - [x] Verify: all four Conway rules are correct with hand-verified expected outputs
  - [x] Verify: no framework imports in new files
  - [x] Verify: tests encode real behavior — each `describe` block tests one rule in isolation

## Dev Notes

### Architecture Compliance

- **`step(grid: Grid): Grid` is pure** (architecture §5.1 invariant): allocates exactly one new `Uint8Array` per call. No mutation of the input grid. No I/O, no `Date.now`, no `Math.random`.
- **Off-grid neighbors are dead** (FR10, architecture §5.1): when counting neighbors at edges/corners, `getCell(grid, x, y)` already returns `0` for out-of-bounds coordinates. Leverage this — do NOT add special-case boundary logic.
- **No toroidal wrap in MVP** (explicit exclusion per PRD and architecture §8).
- **`RuleSet` interface** (architecture §5.1): `{ readonly id: string; readonly name: string; step(grid: Grid): Grid }`. Define in `libs/types` since it's a shared interface used by both `libs/sim` (implements) and future `apps/web` (consumes for the stretch rule-selector in story 8.2).
- **One allocation per `step()` call** — create the output `Uint8Array` once at the start, write directly into it during the nested loop, then construct the result `Grid`. Do NOT allocate intermediate grids or per-cell copies.

### Conway's Four Rules (canonical reference)

For any cell at position `(x, y)`:
1. **Underpopulation:** A live cell with fewer than 2 live neighbors dies.
2. **Survival:** A live cell with 2 or 3 live neighbors survives.
3. **Overpopulation:** A live cell with more than 3 live neighbors dies.
4. **Reproduction:** A dead cell with exactly 3 live neighbors becomes alive.

Equivalently for implementation: a cell is alive in the next generation if and only if:
- It has exactly 3 neighbors (alive regardless of current state), OR
- It has exactly 2 neighbors AND is currently alive.

This condensed form is more efficient to implement but the test suite must still verify all four rules independently.

### Implementation Strategy

```typescript
// Pseudocode — the canonical efficient form
function step(grid: Grid): Grid {
  const { width, height, cells } = grid;
  const next = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(grid, x, y);
      const alive = cells[y * width + x];
      // Cell is alive next gen if: 3 neighbors, or (2 neighbors AND currently alive)
      if (neighbors === 3 || (neighbors === 2 && alive)) {
        next[y * width + x] = 1;
      }
      // else next[y * width + x] remains 0 (Uint8Array default)
    }
  }

  return { width, height, cells: next };
}
```

**`countNeighbors` helper:** Use `getCell` from `../grid.js` — it already handles out-of-bounds by returning `0`. This means no boundary checks needed inside `countNeighbors`. Simply sum all 8 surrounding cell values.

### `noUncheckedIndexedAccess` Implications

With `noUncheckedIndexedAccess: true` in `tsconfig.base.json`, direct array indexing on `Uint8Array` returns `number | undefined`. Two safe approaches:
1. Use `getCell(grid, x, y)` which already handles the type narrowing via its bounds check.
2. For the inner loop where indices are guaranteed valid, use a non-null assertion (`cells[y * width + x]!`) or cast (`as number`) — acceptable since the loop bounds guarantee `0 <= index < cells.length`.

Story 2.1 established the pattern: `grid.cells[y * grid.width + x] as 0 | 1` (see `getCell` implementation). Follow the same convention.

### Technical Requirements

- **TypeScript strict mode** with `noUncheckedIndexedAccess: true` — already enabled by story 2.1.
- **ESM-compatible module resolution**: barrel re-exports must use `.js` extensions. The `rules/conway.ts` file will be imported in the barrel as `'./lib/rules/conway.js'`.
- **Import aliases**: Import `Grid` type from `@conways-game-of-life/types`. Import `getCell` and `createGrid` from sibling `../grid.js` (within `libs/sim`, relative imports are fine).
- **Jest config**: Already configured in story 2.1 (`libs/sim/jest.config.cts`). Tests in subdirectories (`rules/conway.spec.ts`) will be picked up automatically by the `src/**/*.spec.ts` pattern in `tsconfig.spec.json`.

### Testing Requirements

**Test structure mirrors the four rules — each rule gets its own `describe` block:**

- **Rule 1 (underpopulation):** 3x3 grid, single live center cell → all dead after one step. Also test: live cell with exactly 1 neighbor → dead.
- **Rule 2 (survival):** 2x2 block (each cell has exactly 3 neighbors) → stable. Run for 5 generations, assert grid unchanged each time. This also implicitly tests that dead cells with 2 neighbors don't spontaneously come alive.
- **Rule 3 (overpopulation):** Construct a 5x5 grid where a center cell has 4+ neighbors → dies. For clarity, use a plus/cross pattern where the center has 4 neighbors.
- **Rule 4 (reproduction):** Dead cell with exactly 3 live neighbors → becomes alive. The blinker test covers this: the empty cells above and below a horizontal line of 3 each have exactly 3 neighbors and come alive.
- **Blinker (period-2 oscillator):** Horizontal blinker on 5x5 at row 2 → vertical blinker → back to horizontal. Assert exact cell positions each generation.
- **Glider (canonical spaceship):** Standard glider pattern on a 10x10 grid. After 4 steps, all live cells translate by `(+1, +1)`. Assert exact live-cell coordinates.
- **Determinism:** Create a specific grid state. Run `step()` 100 times on independent copies (use `cloneGrid`). Assert all 100 output `cells` buffers are byte-identical using `toEqual`.

**Test patterns established by story 2.1 to follow:**
- Use `createGrid` + `setCell` to construct test fixtures (not raw `Uint8Array` construction)
- Use `getCell` to inspect results
- No mocking — these are pure function tests
- Keep tests behavioral and minimal — each test asserts one thing clearly
- **Test imports use extensionless paths** (Jest/ts-jest resolves `.ts` directly): `import { step } from './conway'` and `import { createGrid, setCell, getCell, cloneGrid } from '../grid'` — do NOT use `.js` extensions in spec files

### Library/Framework Requirements

- **No external dependencies needed.** The implementation uses only `Grid` from `@conways-game-of-life/types` and `getCell`/`createGrid` from the sibling `grid.ts` module (both already in-workspace).
- **Do NOT import React, DOM, fetch, or any framework.** The `no-restricted-imports` and `@nx/enforce-module-boundaries` rules will catch violations.

### File Structure Requirements

Current state of `libs/sim/src/lib/` (from story 2.1):
```
libs/sim/src/
  index.ts              # barrel — re-exports Grid type + grid helpers
  lib/
    grid.ts             # createGrid, cloneGrid, getCell, setCell, toggleCell, clearGrid
    grid.spec.ts        # 17 Jest tests for grid primitives
```

Target state after this story:
```
libs/sim/src/
  index.ts              # barrel — UPDATED: also re-exports step, conwayRules, RuleSet type
  lib/
    grid.ts             # (unchanged)
    grid.spec.ts        # (unchanged)
    rules/
      conway.ts         # countNeighbors (internal), step, conwayRules
      conway.spec.ts    # rule-by-rule Jest tests (7+ describe blocks)
```

Also in `libs/types`:
```
libs/types/src/
  index.ts              # barrel — UPDATED: also exports from ./lib/rule-set.js
  lib/
    grid.ts             # (unchanged) Grid interface
    rule-set.ts         # (NEW) RuleSet interface
```

### Public API Surface (from architecture §5.1)

```typescript
// libs/types/src/lib/rule-set.ts (NEW)
import type { Grid } from './grid.js';

export interface RuleSet {
  readonly id: string;
  readonly name: string;
  step(grid: Grid): Grid;
}

// libs/sim/src/lib/rules/conway.ts (NEW)
import type { Grid } from '@conways-game-of-life/types';
import type { RuleSet } from '@conways-game-of-life/types';

export const conwayRules: RuleSet;
export function step(grid: Grid): Grid; // alias for conwayRules.step
```

### Error Handling

- `step()` is pure and cannot throw on valid `Grid` inputs. If `grid.cells.length !== grid.width * grid.height`, behavior is undefined (programmer error — not validated inside `step()` for performance; the constructor `createGrid` already validates on creation).
- No user-facing errors from this function — it's an internal library consumed by the web app's reducer.

### Git Workflow

Per team agreement (Epic 1 retro): story file + `in-progress` status update as first commit on the feature branch, implementation commits after, mark `done` as last commit on branch before merge.

- Branch name: `story/2-2-conway-rules-engine-step-with-rule-by-rule-tests`
- Commit 1: story file + sprint-status update (`in-progress` for story)
- Commit 2+: implementation (RuleSet interface, conway.ts, conway.spec.ts, barrel updates)
- Final commit: mark story `done` in sprint-status
- PR into `main` with all four CI checks passing (`lint`, `typecheck`, `test`, `e2e`)

### Previous Story Intelligence (from 2.1)

**Patterns to replicate:**
- Jest config is ready — tests in subdirectories (`rules/conway.spec.ts`) will be picked up by the existing `src/**/*.spec.ts` include pattern
- Use `.cts` Jest config (already done in 2.1)
- `tsconfig.spec.json` `include` pattern: `["jest.config.cts", "src/**/*.spec.ts"]` — already covers nested directories
- `tsconfig.lib.json` has `exclude: ["src/**/*.spec.ts"]` — correctly excludes tests from lib compilation

**Debug learnings from 2.1:**
- `@conways-game-of-life/types` was added as `"workspace:*"` dependency in `libs/sim/package.json` — already in place, no action needed for this story
- `noUncheckedIndexedAccess` means indexed access returns `T | undefined` — use type assertion where bounds are guaranteed (loop variables)
- `nx sync` may be required if TypeScript project references change — watch for this if updating `tsconfig.json`

**No changes needed to:**
- `libs/sim/jest.config.cts` — already configured
- `libs/sim/tsconfig.spec.json` — glob already covers nested dirs
- `libs/sim/eslint.config.mjs` — `no-restricted-imports` already in place
- `libs/sim/package.json` — `@conways-game-of-life/types` dependency already present

### Canonical Test Fixtures (hand-verified)

**Block still life (2x2):**
```
. . .     . . .
. X X  →  . X X   (stable)
. X X     . X X
```
Each live cell has exactly 3 neighbors → survives. Each dead neighbor-cell has at most 2 live neighbors → stays dead.

**Horizontal blinker → vertical (on 5x5, center row):**
```
. . . . .     . . . . .
. . . . .     . . X . .
. X X X .  →  . . X . .   (period 2)
. . . . .     . . X . .
. . . . .     . . . . .
```
Center cell: 2 neighbors → survives. Left/right cells: 1 neighbor → die. Cells above/below center: exactly 3 neighbors → born.

**Canonical glider (on 10x10, anchored at top-left):**
```
Gen 0:          Gen 4 (translated +1,+1):
. X .           . . . .
. . X           . . X .
X X X           . . . X
                . X X X
```
Starting positions: `(1,0), (2,1), (0,2), (1,2), (2,2)`
After 4 steps: `(2,1), (3,2), (1,3), (2,3), (3,3)`

### References

- [Source: docs/planning-artifacts/architecture.md#5.1] — Pure-function sim public API, `step` invariants, `RuleSet` interface
- [Source: docs/planning-artifacts/architecture.md#4.4] — Grid data structure (Uint8Array, `cells[y*width+x]`)
- [Source: docs/planning-artifacts/architecture.md#5.1] — "step allocates exactly one new Uint8Array per call. No mutation of input grid."
- [Source: docs/planning-artifacts/epics.md#Story 2.2] — Full acceptance criteria
- [Source: docs/planning-artifacts/prd.md#FR10] — Conway's rules deterministic, off-grid is dead, canonical patterns
- [Source: docs/planning-artifacts/prd.md#NFR3] — Pure-function sim, framework-free, Jest tests < 10s
- [Source: docs/project-context.md#3 rule 9] — "step(grid) is pure, allocates exactly one new Uint8Array, off-grid dead, no toroidal wrap"
- [Source: docs/project-context.md#3 rule 10] — Tests land in same PR, behavior-first, no coverage padding
- [Source: docs/implementation-artifacts/2-1-grid-types-and-primitives-with-tests.md] — Previous story: patterns, debug log, file structure
- [Source: docs/implementation-artifacts/epic-1-retro-2026-05-24.md] — Adversarial review mandate, story completion sequence
- [Source: libs/sim/src/lib/grid.ts] — `getCell` returns 0 for OOB (used by countNeighbors)
- [Source: libs/sim/eslint.config.mjs] — no-restricted-imports rule (already covers new files in libs/sim)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

(none — clean implementation, no blockers encountered)

### Completion Notes List

- Implemented `RuleSet` interface in `libs/types` for forward-compatibility with story 8.1
- Implemented `countNeighbors` helper using `getCell` (off-grid returns 0, no special boundary logic)
- Implemented `step(grid: Grid): Grid` using the condensed form: alive if 3 neighbors OR (2 neighbors AND currently alive)
- Exported `conwayRules` object conforming to `RuleSet` interface with id `'conway'`
- All 7 describe blocks pass: underpopulation, survival, overpopulation, reproduction, blinker, glider, determinism
- 32 total tests pass in 0.318s (well under 10s budget)
- Adversarial review passed: purity verified, no framework imports, off-grid=dead, rules correct

### Change Log

- 2026-05-24: Implemented Conway rules engine with rule-by-rule tests (all 8 tasks complete)

### File List

- libs/types/src/lib/rule-set.ts (new)
- libs/types/src/index.ts (modified — added rule-set barrel export)
- libs/sim/src/lib/rules/conway.ts (new)
- libs/sim/src/lib/rules/conway.spec.ts (new)
- libs/sim/src/index.ts (modified — added step, conwayRules, RuleSet re-exports)
- docs/implementation-artifacts/sprint-status.yaml (modified)
- docs/implementation-artifacts/2-2-conway-rules-engine-step-with-rule-by-rule-tests.md (new)

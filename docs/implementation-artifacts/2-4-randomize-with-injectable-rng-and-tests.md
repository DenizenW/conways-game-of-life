# Story 2.4: Randomize with injectable RNG and tests

Status: done

## Story

As a developer of the simulation core,
I want `randomizeGrid(grid, density?, rng?)` that accepts a seedable RNG,
So that production uses `Math.random` while tests use a deterministic seed for reproducibility.

## Acceptance Criteria

1. **Given** the function signature `randomizeGrid(grid, density = 0.3, rng = Math.random): Grid`, **When** called without arguments beyond `grid`, **Then** each cell is independently alive with probability ~0.3 (verified statistically with a fixed seed in tests, not asserted on a single draw).

2. **Given** a deterministic seeded RNG (e.g., a tiny `mulberry32`), **When** `randomizeGrid` is called twice with the same seed and same dimensions, **Then** the two output grids are byte-identical.

3. **Given** `density = 0` or `density = 1`, **When** `randomizeGrid` is called, **Then** the grid is all-dead or all-alive respectively (boundary cases of the density parameter).

4. **Given** the spec lives at `libs/sim/src/lib/grid.spec.ts` (or sibling), **When** `pnpm nx test sim` runs, **Then** all randomize-related assertions pass.

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
- [x] **Task 2: Implement `randomizeGrid` in `libs/sim/src/lib/grid.ts`**
  - [x] Pure function returning new Grid, never mutates input
  - [x] Short-circuit boundary densities (0 → all-dead, 1 → all-alive)
  - [x] RangeError on density outside [0, 1] or NaN
  - [x] Injectable RNG defaulting to Math.random
- [x] **Task 3: Add tests to `grid.spec.ts`**
  - [x] Determinism: same seed → identical grids
  - [x] Different seeds → different grids
  - [x] Density = 0 → all dead
  - [x] Density = 1 → all alive
  - [x] Statistical density check (~0.3 with seeded RNG)
  - [x] Immutability: input grid unchanged
  - [x] Math.random default (spy test)
  - [x] 0-dimension grid
  - [x] RangeError on invalid density (negative, >1, NaN)
- [x] **Task 4: Extract `mulberry32` to shared test-utils**
- [x] **Task 5: Export `randomizeGrid` from barrel index**
- [x] **Task 6: Run tests and verify green**

## Dev Notes

- `mulberry32` seeded PRNG extracted to `libs/sim/src/lib/test-utils.ts` for reuse across test files.
- Density validation added during adversarial code review (F2) — consistent with defensive pattern in other grid functions.
- Boundary short-circuits added during review (F1) — avoids reliance on RNG returning strictly `[0, 1)`.

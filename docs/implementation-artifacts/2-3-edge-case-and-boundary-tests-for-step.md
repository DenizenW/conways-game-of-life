# Story 2.3: Edge-case and boundary tests for `step()`

Status: done

## Story

As a developer of the simulation core,
I want explicit Jest coverage of edge cases the four rules don't visibly exercise,
So that the test suite constrains real behavior, not just the happy path.

## Acceptance Criteria

1. **Given** an empty grid (all cells dead), **When** `step()` is applied, **Then** the result is still empty (no spontaneous life).

2. **Given** a 3x3 grid with all cells alive, **When** `step()` is applied, **Then** the output matches a hand-computed cell-by-cell reference (corners survive with 3 neighbors; edges die with 5 neighbors; center dies with 8 neighbors).

3. **Given** a live cell at the corner `(0, 0)` of a 5x5 grid with no other live cells, **When** `step()` is applied, **Then** the cell dies (off-grid neighbors are treated as dead, so neighbor count is 0, rule 1).

4. **Given** a 1x1 grid with a single live cell, **When** `step()` is applied, **Then** the cell dies (rule 1, no neighbors).

5. **Given** a non-square grid (e.g. 1x5), **When** `step()` is applied, **Then** the row-major `y*width+x` indexing works correctly (verifies asymmetric dimensions).

6. **Given** a dead cell at the grid edge with exactly 3 live neighbors, **When** `step()` is applied, **Then** the cell becomes alive (reproduction works at boundaries, not just interior).

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
  - [x] Commit story file to feature branch
  - [x] Update `sprint-status.yaml`: story `2-3` to `in-progress`
- [x] **Task 2: Add edge-case tests to `conway.spec.ts`**
  - [x] AC #1: Empty grid stays empty
  - [x] AC #2: 3x3 all-alive hand-computed reference
  - [x] AC #3: Corner cell (0,0) on 5x5 dies
  - [x] AC #4: 1x1 single live cell dies
  - [x] AC #5: Non-square grid step
  - [x] AC #6: Birth at grid edge
- [x] **Task 3: Run tests and verify green**

## Dev Notes

- Tests go in the existing `libs/sim/src/lib/rules/conway.spec.ts`
- Follow the existing describe/it pattern with full-grid verification where applicable
- Hand-computed 3x3 all-alive reference:
  ```
  Input:        Output:
  1 1 1         1 0 1
  1 1 1    →    0 0 0
  1 1 1         1 0 1
  ```
  Corners: 3 neighbors each → survive (rule 2). Edges: 5 neighbors each → die (rule 3). Center: 8 neighbors → dies (rule 3).
- ACs #5 (non-square grid) and #6 (birth at grid edge) were added beyond the epic's 4-AC spec to strengthen boundary coverage per architecture §5.1 test requirements.

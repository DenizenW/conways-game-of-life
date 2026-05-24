# Story 3.2: Canvas render and click/tap-to-toggle cells

Status: ready-for-dev

## Story

As Casey,
I want to click (or tap) a cell on the canvas to toggle it alive/dead before pressing play,
So that I can paint a starting state I'm interested in.

## Acceptance Criteria

1. **Given** the simulation is paused and the canvas has rendered the current grid, **When** the user clicks a dead cell (mouse) or taps it (touch), **Then** the cell becomes alive, is visibly distinguishable from dead cells (cyan-on-near-black per architecture §7.5), and the visible state change occurs within 50ms of the input event.

2. **Given** the simulation is paused, **When** the user clicks an alive cell, **Then** the cell becomes dead.

3. **Given** the simulation is running, **When** the user clicks the canvas, **Then** the toggle is a no-op (controls disabled while running, per FR2 default).

4. **Given** the rendering implementation, **When** the grid state changes, **Then** a `useEffect([grid])` triggers a Canvas redraw using `fillRect` per architecture §5.3 (no DOM-per-cell rendering).

5. **Given** the click-to-grid-coordinate conversion, **When** the canvas is scaled by CSS to fit its container, **Then** `getBoundingClientRect()` is used so coordinates remain accurate at any rendered size.

## Tasks / Subtasks

- [ ] **Task 1: Extend reducer with TOGGLE_CELL action** (AC: 1, 2)
  - [ ] Add `TOGGLE_CELL` action type with `x: number` and `y: number` payload to the Action union in `page.tsx`
  - [ ] Import `toggleCell` from `@conways-game-of-life/sim`
  - [ ] Handle in reducer: return `{ ...state, grid: toggleCell(state.grid, action.x, action.y) }`
  - [ ] genCount is NOT reset on toggle (only the grid changes)

- [ ] **Task 2: Add pointer event handling to Canvas component** (AC: 1, 2, 5)
  - [ ] Add `onCellToggle?: (x: number, y: number) => void` prop to `CanvasProps`
  - [ ] Attach `onPointerDown` handler to the `<canvas>` element
  - [ ] Use `canvas.getBoundingClientRect()` to get canvas position on screen
  - [ ] Compute grid coords: `x = Math.floor((event.clientX - rect.left) / cellSize)`, same for y
  - [ ] Bounds check: only call `onCellToggle` if `x >= 0 && x < grid.width && y >= 0 && y < grid.height`
  - [ ] Add `touch-action: none` CSS to canvas to prevent browser scroll/zoom on touch

- [ ] **Task 3: Wire toggle from page to Canvas** (AC: 1, 2, 3)
  - [ ] Create `handleCellToggle` callback using `useCallback` in `page.tsx`
  - [ ] Guard: if `state.running`, return early (no-op per FR2)
  - [ ] Otherwise dispatch `{ type: 'TOGGLE_CELL', x, y }`
  - [ ] Pass `onCellToggle={handleCellToggle}` to `<Canvas />`
  - [ ] Dynamic cursor: `cursor-pointer` when paused, `cursor-default` when running

- [ ] **Task 4: Change initial state to paused with empty grid** (AC: 1, 2)
  - [ ] Change `initState()` to return `running: false` with `createGrid(30, 30)` (empty, not randomized)
  - [ ] This gives users a blank canvas to paint cells immediately on load
  - [ ] Randomize will be available via a button in story 3.4; Play in story 3.3

- [ ] **Task 5: Tests** (AC: 1, 2, 3, 5)
  - [ ] **Canvas component tests** (`apps/web/src/app/components/Canvas.spec.tsx`):
    - [ ] `pointerdown` on a cell calls `onCellToggle` with correct (x, y) grid coordinates
    - [ ] `pointerdown` outside grid bounds does NOT call `onCellToggle`
    - [ ] No `onCellToggle` prop: `pointerdown` does not throw
  - [ ] **Page smoke test updates** (`apps/web/specs/index.spec.tsx`):
    - [ ] Page renders with canvas in initial empty (paused) state
  - [ ] **Coordinate math verification:**
    - [ ] Mock `getBoundingClientRect` to return a known rect, fire pointerdown at computed pixel positions, assert correct grid coords

## Dev Notes

### What's Already Built (Story 3.1)

**State management** in `apps/web/src/app/page.tsx`:
- `useReducer` with `State = { grid, genCount, running, dimensions }`
- Current actions: `SET_DIMENSIONS`, `RESET`, `TICK`
- Add `TOGGLE_CELL` to this union — do NOT restructure the existing pattern

**Canvas component** at `apps/web/src/app/components/Canvas.tsx`:
- Accepts `grid: Grid` and `cellSize: number`
- `useEffect([grid, cellSize])` calls `renderGrid()` — AC #4 is already satisfied
- Colors: dead bg `#0a0a0a`, alive cells `#22d3ee`, grid lines `#404040`
- Currently has NO event handlers — this story adds `onPointerDown`

**cellSize** is computed in `page.tsx` as `Math.max(1, Math.min(Math.floor(containerWidth / grid.width), Math.floor(maxHeight / grid.height)))`. It is always a positive integer, which simplifies coordinate math (no sub-pixel rounding).

**Simulation loop** (`use-simulation-loop.ts`) already works — rAF + accumulator per architecture §5.2. It only runs when `state.running === true`.

### Coordinate Conversion Pattern (AC #5)

Per architecture §5.3, use `getBoundingClientRect()` for coordinate conversion:

```typescript
function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / cellSize);
  const y = Math.floor((event.clientY - rect.top) / cellSize);
  if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
    onCellToggle?.(x, y);
  }
}
```

`getBoundingClientRect()` returns the CSS display rect, not the pixel-buffer rect. Since `cellSize` is derived from the same CSS container width, the division produces the correct grid cell index regardless of any CSS scaling.

### Use `onPointerDown`, NOT `onClick` or `onMouseDown`/`onTouchStart`

`PointerEvent` unifies mouse, touch, and pen. One handler covers AC #1's click-and-tap requirement. Using `onClick` would add a ~300ms delay on mobile (waiting for double-tap detection). `onPointerDown` fires immediately on contact.

### touch-action CSS

Add `touch-action: none` to the `<canvas>` style. Without this, the browser intercepts touch events for scroll/zoom gestures on mobile, preventing the `pointerdown` from reaching the handler.

### Initial State Change

Story 3.1 initialized with `running: true` and a randomized grid to prove the simulation loop for AC #5 of that story. Now that the loop is proven, change `initState()` to:
- `running: false` (paused)
- `grid: createGrid(30, 30)` (empty — no `randomizeGrid`)

This lets users land on a blank canvas and start painting immediately, which is the primary UX for this story. Randomize arrives in story 3.4; Play/Pause in story 3.3.

### Performance (<50ms — AC #1)

Toggle path: `pointerdown` event → two `Math.floor` divisions → `dispatch(TOGGLE_CELL)` → `toggleCell(grid, x, y)` (one `Uint8Array` copy + one index write) → React re-render → `useEffect([grid])` → `renderGrid()` (full Canvas redraw). At 30x30 (900 cells), full redraw takes <1ms. At 100x100 (10K cells), still well under 50ms. No optimization needed.

### Runtime Versions

- **React 19** (`^19.0.0`) — `ref` is a regular prop, no `forwardRef` needed
- **Next.js 16** (`~16.1.6`) — `'use client'` mandatory for components using hooks/events
- **TypeScript strict** with `noUncheckedIndexedAccess: true`

### Imports

```typescript
import { toggleCell, type Grid } from '@conways-game-of-life/sim';
```

`toggleCell(grid, x, y)` is exported from `libs/sim` and fully tested in Epic 2. Pure function — returns a new `Grid`, never mutates input.

### Testing Notes

- **jsdom has no Canvas API** — `jest-canvas-mock` already installed and configured in `apps/web/jest.setup.ts` (story 3.1)
- **`getBoundingClientRect()` in jsdom** returns `{ top: 0, left: 0, width: 0, height: 0 }` by default. Mock it to return meaningful values:
  ```typescript
  jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    top: 0, left: 0, width: 300, height: 300,
    right: 300, bottom: 300, x: 0, y: 0, toJSON: () => {}
  });
  ```
- **Pointer events in jsdom** — use `fireEvent.pointerDown(canvas, { clientX, clientY })` from `@testing-library/react`
- **Run with:** `pnpm nx test web`

### Gotchas

- Do NOT add drag-to-paint (continuous toggle while mouse held) — scope creep for this story. One pointerdown = one toggle.
- Canvas cursor styling: pass a `disabled?: boolean` prop (or similar) to Canvas from the page, not by having Canvas reach into parent state. The page knows whether `state.running` is true.
- The existing smoke test in `specs/index.spec.tsx` expects the page to render. Story 3.1 inits with a randomized running grid — changing to empty/paused may require updating the smoke test assertion (e.g., gen count starts at 0, not advancing).
- `useCallback` for `handleCellToggle` must include `state.running` in its dependency array (or access running via a ref) for the guard to work correctly.

### Scope Boundaries

**In scope:** single-click/tap toggle of one cell, coordinate conversion, no-op when running, cursor feedback.

**NOT in scope (future stories):**
- Play/Pause/Step controls → story 3.3
- Clear/Randomize buttons → story 3.4
- Speed slider → story 3.5
- Drag-to-paint / multi-cell drawing → not in any story

### Project Structure Notes

- No new component files — modifications to existing `Canvas.tsx` and `page.tsx`
- New test file: `apps/web/src/app/components/Canvas.spec.tsx`
- Update existing: `apps/web/specs/index.spec.tsx`
- All paths align with architecture §6 repository tree

### References

- [Source: docs/planning-artifacts/architecture.md#§5.3] — Cell toggle: onPointerDown + getBoundingClientRect
- [Source: docs/planning-artifacts/architecture.md#§4.5] — State management: useReducer
- [Source: docs/planning-artifacts/architecture.md#§7.5] — Accessibility: cyan-400 on neutral-950, focus rings
- [Source: docs/planning-artifacts/epics.md#Story 3.2] — Acceptance criteria
- [Source: docs/planning-artifacts/prd.md#FR2] — Toggle individual cells
- [Source: docs/planning-artifacts/prd.md#NFR4] — MVP perf: <50ms input latency
- [Source: docs/implementation-artifacts/3-1-page-shell-canvas-size-form-and-responsive-layout.md] — Previous story: state shape, Canvas component, cellSize computation, test infrastructure
- [Source: docs/project-context.md#§3] — Critical implementation rules (especially #6: rAF + ref, #8: Uint8Array grid)
- [Source: docs/project-context.md#§5] — Conventions: kebab-case files, path aliases, test colocation

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

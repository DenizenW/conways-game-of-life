# Story 3.3: Play/Pause/Step controls and generation counter

Status: done

## Story

As Casey,
I want Play, Pause, and Step buttons plus a visible generation counter,
So that I can run the simulation, freeze it, advance one step at a time, and see how far it has progressed.

## Acceptance Criteria

1. **Given** the simulation is paused, **When** the user activates Play, **Then** generations begin advancing at the currently configured `genPerSec` (10 default), the Play control becomes Pause (or is visually toggled), and the gen counter increments by 1 per advanced generation.

2. **Given** the simulation is running, **When** the user activates Pause, **Then** advancement stops within one tick, the grid and gen counter are preserved exactly as of the last completed tick, and the control returns to Play.

3. **Given** the simulation is paused, **When** the user activates Step, **Then** the grid advances by exactly one generation per `step()` from `libs/sim` and the gen counter increments by 1.

4. **Given** the simulation is running, **When** the user activates Step, **Then** the action is a no-op (or is visually disabled), per FR7.

5. **Given** the gen counter is rendered, **When** the page is at any supported viewport, **Then** the counter is visible without scrolling and updates within one frame of each generation advance.

## Tasks / Subtasks

- [x] **Task 1: Add reducer actions for play/pause/step** (AC: 1, 2, 3, 4)
  - [x] Add `PLAY` action — sets `running: true`
  - [x] Add `PAUSE` action — sets `running: false`
  - [x] Add `STEP` action — applies `step(state.grid)` and increments `genCount` by 1 (equivalent to TICK but only when paused)
  - [x] Guard: STEP does nothing if `state.running === true`

- [x] **Task 2: Create Controls component** (AC: 1, 2, 3, 4)
  - [x] New file: `apps/web/src/app/components/Controls.tsx`
  - [x] Props: `running: boolean`, `onPlay: () => void`, `onPause: () => void`, `onStep: () => void`
  - [x] Render a combined Play/Pause toggle button: shows "Play" + play icon when paused, "Pause" + pause icon when running
  - [x] Render a Step button: disabled (visually and functionally) when `running === true`
  - [x] All buttons: real `<button>` elements with `aria-label` for accessibility
  - [x] Tailwind styling: `focus-visible:ring-2 focus-visible:ring-cyan-400` for visible focus rings
  - [x] Button base style: consistent with the app's `bg-neutral-800 hover:bg-neutral-700 text-neutral-100` pattern from GridSizeForm

- [x] **Task 3: Wire Controls into page** (AC: 1, 2, 3, 4)
  - [x] Create `handlePlay`, `handlePause`, `handleStep` callbacks with `useCallback`
  - [x] `handlePlay`: dispatch `{ type: 'PLAY' }`
  - [x] `handlePause`: dispatch `{ type: 'PAUSE' }`
  - [x] `handleStep`: guard `if (state.running) return;` then dispatch `{ type: 'STEP' }`
  - [x] Place `<Controls />` in the sidebar panel between the gen counter and GridSizeForm

- [x] **Task 4: Verify generation counter placement** (AC: 5)
  - [x] Confirm `data-testid="gen-count"` is already rendered (it is — from story 3.1)
  - [x] Ensure it remains visible at all viewports (already in sidebar which is always visible)
  - [x] Confirm counter updates on each TICK dispatch from the simulation loop (already works)

- [x] **Task 5: Tests** (AC: 1, 2, 3, 4, 5)
  - [x] **Controls component tests** (`apps/web/src/app/components/Controls.spec.tsx`):
    - [x] When `running=false`: Play button is rendered, Step button is enabled
    - [x] When `running=true`: Pause button is rendered, Step button is disabled
    - [x] Clicking Play calls `onPlay`
    - [x] Clicking Pause calls `onPause`
    - [x] Clicking Step when not running calls `onStep`
    - [x] Clicking Step when running does NOT call `onStep` (disabled)
  - [x] **Page integration tests** (`apps/web/specs/index.spec.tsx`):
    - [x] Play button starts simulation (running becomes true)
    - [x] Pause button stops simulation
    - [x] Step button advances exactly one generation (genCount from 0 to 1)
    - [x] Step button is disabled while running

## Dev Notes

### What's Already Built (Stories 3.1 + 3.2)

**State management** in `apps/web/src/app/page.tsx`:
- `useReducer` with `State = { grid, genCount, running, dimensions }`
- Current actions: `SET_DIMENSIONS`, `RESET`, `TICK`, `TOGGLE_CELL`
- The `TICK` action already calls `step(state.grid)` and increments `genCount`
- `state.running` exists and is read by `useSimulationLoop` — setting it to `true` starts the loop

**Simulation loop** at `apps/web/src/app/hooks/use-simulation-loop.ts`:
- Already fully implemented: rAF + time accumulator per architecture §5.2
- Reads `genPerSec` via ref (fresh each frame)
- Loop starts when `opts.running` transitions to `true`; stops when `false`
- `handleTick` dispatches `{ type: 'TICK' }` — already wired

**Generation counter** already renders:
```tsx
<div data-testid="gen-count" className="text-sm text-neutral-400">
  Generation: {state.genCount}
</div>
```
This satisfies AC #5 — the counter is visible in the sidebar. It increments on every `TICK` dispatch (which the rAF loop drives once `running === true`).

**Current page layout** (sidebar):
1. Title "Conway's Game of Life"
2. Generation counter
3. GridSizeForm
4. *(no controls yet — this story adds them)*

### Architecture Compliance

**Controls component location:** `apps/web/src/app/components/Controls.tsx` per architecture §6 project structure tree.

**Button patterns (architecture §7.5, project-context §5):**
- Real `<button>` elements (not `<div onClick>`)
- `aria-label` on each button
- Visible focus: `focus-visible:ring-2 focus-visible:ring-cyan-400`
- Color contrast ≥ 4.5:1

**State updates:**
- PLAY/PAUSE/STEP are reducer actions — atomic transitions, no multi-setState race
- The simulation loop's `useEffect` dependency is `[opts.running, opts.step]` — toggling `running` via PLAY/PAUSE causes the effect to start/stop the rAF loop cleanly

### Implementation Pattern for Play/Pause Toggle

The UI shows a **single button** that toggles between Play and Pause states:
- When `running === false`: button shows "Play" (▶), clicking dispatches PLAY
- When `running === true`: button shows "Pause" (⏸), clicking dispatches PAUSE

This is the standard media-player pattern. Do NOT render two separate buttons that show/hide.

### Step Action vs TICK Action

`STEP` and `TICK` do the same state transition (`step(grid)` + `genCount++`), but:
- `TICK` is dispatched by the rAF loop automatically (no guard needed — loop only runs when `running`)
- `STEP` is dispatched by user button click — must guard against `running === true`

Implementation options:
- **Option A:** STEP action in reducer checks `state.running` and returns unchanged state if running
- **Option B:** The `handleStep` callback guards before dispatching
- **Recommended: Option A** — reducer-level guard is more robust (prevents any caller from accidentally stepping while running)

Reducer addition:
```typescript
case 'STEP':
  if (state.running) return state;
  return {
    ...state,
    grid: step(state.grid),
    genCount: state.genCount + 1,
  };
```

### Button Disabled State

The Step button should be `disabled` when `running === true`:
- Visually: `opacity-50 cursor-not-allowed` (Tailwind)
- Functionally: `disabled` attribute on `<button>` prevents click events
- The reducer guard (Option A above) provides defense-in-depth

### Library/Framework Requirements

- **React 19** (`^19.0.0`) — no `forwardRef` needed, `ref` is a regular prop
- **Next.js 16** (`~16.1.6`) — `'use client'` required for components using hooks/events
- **Tailwind CSS** — use utility classes, no CSS Modules
- **`@conways-game-of-life/sim`** — `step` function already imported in `page.tsx`

### File Structure Requirements

New files:
- `apps/web/src/app/components/Controls.tsx` — the Controls component
- `apps/web/src/app/components/Controls.spec.tsx` — unit tests for Controls

Modified files:
- `apps/web/src/app/page.tsx` — add PLAY/PAUSE/STEP actions, wire Controls component
- `apps/web/specs/index.spec.tsx` — add integration test assertions for controls

### Testing Requirements

**Run with:** `pnpm nx test web`

**Testing library:** `@testing-library/react` + `@testing-library/user-event`

**Controls component tests:**
- Test button text/label changes based on `running` prop
- Test click handlers fire correctly
- Test Step button `disabled` attribute when running

**Page integration tests:**
- Render the page, click Play, assert `running` state change (check that Pause button appears)
- Click Pause, assert Play button returns
- Click Step, assert `gen-count` text changes from "Generation: 0" to "Generation: 1"
- Verify Step disabled while running (button has `disabled` attr)

**Mock requirements:**
- `jest-canvas-mock` already configured (story 3.1)
- `ResizeObserver` mock may be needed (already exists from story 3.1)
- No need to mock `requestAnimationFrame` for Controls tests — those are isolated

### Previous Story Intelligence

**From story 3.2 implementation:**
- `useCallback` pattern established for `handleCellToggle` with dependency on `state.running`
- Canvas cursor changes based on `state.running` (pointer when paused, default when running)
- jsdom polyfill pattern for `PointerEvent` — may need similar for `click` events
- Smoke test at `apps/web/specs/index.spec.tsx` expects the page to render in paused state

**From story 3.2 debug notes:**
- jsdom lacks `PointerEvent` constructor — but regular `click`/`fireEvent.click` works fine for button testing

### Git Intelligence

Recent commit patterns:
- Single-feature commits with imperative subject: "Add click/tap-to-toggle cells with pointer event coordinate conversion"
- Story spec + sprint-status update as first commit on branch
- Implementation in focused subsequent commits

### Gotchas

- Do NOT add keyboard shortcuts for Play/Pause/Step — that's story 4.2 (a11y audit)
- Do NOT add the speed slider — that's story 3.5
- Do NOT add Clear/Randomize buttons — that's story 3.4
- The `TICK` action must remain unchanged — it is used by the rAF loop
- `handleTick` callback has `[]` dependency array — do not change this (it's stable reference for the simulation loop's useEffect)
- The Step button should use the same `step()` function from `@conways-game-of-life/sim` — do NOT re-implement the rules
- Cell toggle should remain disabled while running (existing behavior from story 3.2)

### Scope Boundaries

**In scope:** Play/Pause toggle button, Step button, generation counter visibility confirmation, reducer actions, wiring.

**NOT in scope (future stories):**
- Speed slider → story 3.5
- Clear/Randomize → story 3.4
- Keyboard shortcuts → story 4.2
- Drag-to-paint → not planned

### Project Structure Notes

- New `Controls.tsx` component aligns with architecture §6 (`apps/web/app/components/Controls.tsx`)
- All paths use `@conways-game-of-life/sim` alias for `step` import
- No new libs or external dependencies required

### References

- [Source: docs/planning-artifacts/architecture.md#§5.2] — rAF + accumulator pattern (already implemented)
- [Source: docs/planning-artifacts/architecture.md#§6] — Project structure: Controls.tsx in components/
- [Source: docs/planning-artifacts/architecture.md#§7.5] — A11y: buttons with aria-label, focus rings
- [Source: docs/planning-artifacts/epics.md#Story 3.3] — Acceptance criteria (FR5, FR6, FR7, FR9)
- [Source: docs/planning-artifacts/prd.md#FR5] — Play the simulation
- [Source: docs/planning-artifacts/prd.md#FR6] — Pause within one tick
- [Source: docs/planning-artifacts/prd.md#FR7] — Step exactly one generation while paused
- [Source: docs/planning-artifacts/prd.md#FR9] — Generation count visible at all times
- [Source: docs/implementation-artifacts/3-2-canvas-render-and-click-tap-to-toggle-cells.md] — Previous story: state shape, reducer, useCallback pattern, test infrastructure
- [Source: docs/project-context.md#§3] — Critical rules (especially #6: rAF + ref, #10: tests with feature)
- [Source: docs/project-context.md#§5] — Conventions: kebab-case files, focus-visible rings, button elements

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- Installed `@testing-library/user-event` (dev dependency) — was not present in workspace; needed for `userEvent.setup()` in Controls and page integration tests.

### Completion Notes List

- Added PLAY, PAUSE, STEP reducer actions to page.tsx. STEP includes reducer-level guard against running state (Option A from Dev Notes).
- Created Controls component with Play/Pause toggle button and disabled-when-running Step button. Follows existing button styling pattern from GridSizeForm.
- Wired Controls into page sidebar between generation counter and GridSizeForm with useCallback handlers.
- Verified generation counter (`data-testid="gen-count"`) remains visible and updates correctly — no changes needed (pre-existing from story 3.1).
- 8 Controls unit tests + 4 page integration tests all pass. Full suite: 46 tests, 5 suites, 0 failures.

### Change Log

- Added Play/Pause/Step controls with reducer actions, Controls component, and page wiring (2026-05-25)

### File List

New files:
- `apps/web/src/app/components/Controls.tsx`
- `apps/web/src/app/components/Controls.spec.tsx`

Modified files:
- `apps/web/src/app/page.tsx`
- `apps/web/specs/index.spec.tsx`
- `package.json` (added `@testing-library/user-event` dev dependency)
- `pnpm-lock.yaml`
- `docs/implementation-artifacts/sprint-status.yaml` (status → review)

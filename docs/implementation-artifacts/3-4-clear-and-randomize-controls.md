# Story 3.4: Clear and Randomize controls

Status: in-progress

## Story

As Casey,
I want one-click Clear and Randomize buttons,
So that I can reset to empty or jump to an interesting random starting state without painting cell-by-cell.

## Acceptance Criteria

1. **Given** any grid state and either running or paused, **When** the user activates Clear, **Then** every cell is dead, the gen counter resets to 0, and if the simulation was running it is now paused.

2. **Given** any grid state and either running or paused, **When** the user activates Randomize, **Then** `randomizeGrid` from `libs/sim` is called with the default density (0.3), the gen counter resets to 0, and if the simulation was running it is now paused.

3. **Given** the controls are rendered, **When** the page is at any supported viewport, **Then** both buttons are reachable and operable via mouse, touch, or keyboard (Tab + Enter/Space).

## Tasks / Subtasks

- [x] **Task 1: Add CLEAR and RANDOMIZE reducer actions** (AC: 1, 2)
  - [x] Add `{ type: 'CLEAR' }` and `{ type: 'RANDOMIZE' }` to the `Action` union type
  - [x] Add `CLEAR` case: returns `{ ...state, grid: clearGrid(state.grid), genCount: 0, running: false }`
  - [x] Add `RANDOMIZE` case: returns `{ ...state, grid: randomizeGrid(state.grid), genCount: 0, running: false }`
  - [x] Import `clearGrid` and `randomizeGrid` from `@conways-game-of-life/sim`

- [x] **Task 2: Add Clear and Randomize buttons to Controls component** (AC: 1, 2, 3)
  - [x] Add `onClear: () => void` and `onRandomize: () => void` to `ControlsProps`
  - [x] Add Clear button: always enabled, uses `btnBase` styling, `aria-label="Clear grid"`
  - [x] Add Randomize button: always enabled, uses `btnBase` styling, `aria-label="Randomize grid"`
  - [x] Both buttons use real `<button>` elements with focus-visible rings

- [x] **Task 3: Wire new callbacks into page** (AC: 1, 2)
  - [x] Create `handleClear` callback: `dispatch({ type: 'CLEAR' })`
  - [x] Create `handleRandomize` callback: `dispatch({ type: 'RANDOMIZE' })`
  - [x] Pass `onClear={handleClear}` and `onRandomize={handleRandomize}` to `<Controls />`

- [x] **Task 4: Tests** (AC: 1, 2, 3)
  - [x] **Controls unit tests** (`Controls.spec.tsx`):
    - [x] Clear button renders and is always enabled (both running and paused states)
    - [x] Randomize button renders and is always enabled (both running and paused states)
    - [x] Clicking Clear calls `onClear`
    - [x] Clicking Randomize calls `onRandomize`
  - [x] **Page integration tests** (`apps/web/specs/index.spec.tsx`):
    - [x] Clear button resets gen-count to 0
    - [x] Randomize button resets gen-count to 0
    - [x] Clear produces an all-dead grid (verify via canvas or subsequent step behavior)
    - [x] Clear while running pauses the simulation (Play button reappears)
    - [x] Randomize while running pauses the simulation (Play button reappears)

## Dev Notes

### Critical Behavioral Distinction: Always Enabled

Unlike the Step button (disabled while running), **Clear and Randomize are always enabled**. The ACs say "given any grid state and **either running or paused**" — both buttons work in both states. When activated while running, they pause the simulation as a side effect. Do NOT apply the disabled/opacity-50 pattern from the Step button.

### What's Already Built (Stories 3.1–3.3)

**State management** in `apps/web/src/app/page.tsx`:
- `useReducer` with `State = { grid, genCount, running, dimensions }`
- Current actions: `SET_DIMENSIONS`, `RESET`, `TICK`, `TOGGLE_CELL`, `PLAY`, `PAUSE`, `STEP`
- The `STEP` action guards against `state.running === true`; CLEAR and RANDOMIZE do NOT need this guard — they forcibly set `running: false`

**Simulation loop** at `apps/web/src/app/hooks/use-simulation-loop.ts`:
- rAF + time accumulator, starts/stops based on `opts.running`
- When CLEAR or RANDOMIZE sets `running: false`, the `useEffect` dependency on `opts.running` cleanly cancels the rAF loop

**Sim library functions** in `libs/sim/src/lib/grid.ts` — both ALREADY implemented and exported:
- `clearGrid(grid: Grid): Grid` — returns a new grid with all cells dead (same dimensions)
- `randomizeGrid(grid: Grid, density = 0.3, rng = Math.random): Grid` — returns a new grid with cells randomly set based on density

**Barrel export** in `libs/sim/src/index.ts` — both `clearGrid` and `randomizeGrid` already exported. No changes needed to `libs/sim`.

**Controls component** at `apps/web/src/app/components/Controls.tsx`:
- Current props: `{ running, onPlay, onPause, onStep }`
- Button base class: `'rounded px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors'`
- Layout: `flex gap-2` wrapping the buttons
- Step button uses disabled pattern: `${running ? 'opacity-50 cursor-not-allowed' : ''}` with `disabled={running}` — do NOT use this for Clear/Randomize

**Current page.tsx imports from sim** (line 4):
```typescript
import { createGrid, step, toggleCell } from '@conways-game-of-life/sim';
```
Add `clearGrid` and `randomizeGrid` to this import.

### Reducer Implementation

```typescript
// Add to Action union type:
| { type: 'CLEAR' }
| { type: 'RANDOMIZE' }

// Add to reducer switch:
case 'CLEAR':
  return {
    ...state,
    grid: clearGrid(state.grid),
    genCount: 0,
    running: false,
  };
case 'RANDOMIZE':
  return {
    ...state,
    grid: randomizeGrid(state.grid),
    genCount: 0,
    running: false,
  };
```

Both actions set `running: false` unconditionally — this handles the "if the simulation was running it is now paused" requirement. The rAF loop's `useEffect` dependency on `running` handles cleanup.

### Controls Component Update

Add props and two new buttons. Both are always enabled (no conditional disabled logic):

```typescript
interface ControlsProps {
  running: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onClear: () => void;      // NEW
  onRandomize: () => void;  // NEW
}
```

Place the Clear and Randomize buttons after the Step button, using the same `btnBase` class but without the disabled pattern.

### Page Wiring

```typescript
const handleClear = useCallback(() => {
  dispatch({ type: 'CLEAR' });
}, []);

const handleRandomize = useCallback(() => {
  dispatch({ type: 'RANDOMIZE' });
}, []);
```

Pass to Controls:
```tsx
<Controls
  running={state.running}
  onPlay={handlePlay}
  onPause={handlePause}
  onStep={handleStep}
  onClear={handleClear}
  onRandomize={handleRandomize}
/>
```

### Project Structure Notes

- No new files created — this story modifies existing files only
- All paths use `@conways-game-of-life/sim` alias
- No new libs or external dependencies required

### Architecture Compliance

**Module boundaries:** Only `apps/web` (scope:app) imports from `@conways-game-of-life/sim` (scope:sim) — allowed per the dependency matrix.

**Button patterns (architecture §7.5):**
- Real `<button>` elements with `aria-label`
- Visible focus: `focus-visible:ring-2 focus-visible:ring-cyan-400`
- Color contrast ≥ 4.5:1

**Sim purity:** `clearGrid` and `randomizeGrid` are already pure functions in `libs/sim`. The reducer calls them; it does NOT re-implement grid logic.

### Library/Framework Requirements

- **React 19** (`^19.0.0`) — no `forwardRef` needed
- **Next.js 16** — `'use client'` already on page.tsx
- **Tailwind CSS** — use utility classes matching existing Controls pattern
- **`@conways-game-of-life/sim`** — `clearGrid` and `randomizeGrid` already exported

### Testing Requirements

**Run with:** `pnpm nx test web`

**Controls unit tests** (add to `apps/web/src/app/components/Controls.spec.tsx`):
- Update `defaultProps` to include `onClear: jest.fn()` and `onRandomize: jest.fn()`
- Test Clear button renders when paused: `getByRole('button', { name: /clear/i })`
- Test Clear button renders when running (NOT disabled — unlike Step)
- Test clicking Clear calls `onClear`
- Test Randomize button renders when paused
- Test Randomize button renders when running (NOT disabled)
- Test clicking Randomize calls `onRandomize`

**Page integration tests** (add to `apps/web/specs/index.spec.tsx`):
- Step up a grid, toggle some cells, click Clear → assert `gen-count` shows "Generation: 0"
- Click Randomize → assert `gen-count` shows "Generation: 0"
- Start simulation (Play), then click Clear → assert Play button reappears (sim paused)
- Start simulation (Play), then click Randomize → assert Play button reappears (sim paused)

**Mock requirements:**
- `jest-canvas-mock` already configured
- `ResizeObserver` mock already in place
- No new mocks needed

### Previous Story Intelligence

**From story 3.3 implementation:**
- `useCallback` pattern established for handlers with stable dependencies
- `handleTick` has `[]` dependency array — do not change
- `@testing-library/user-event` already installed and used for button click testing
- Controls.spec.tsx uses `jest.fn()` props pattern with `jest.clearAllMocks()` in `beforeEach`
- Page integration tests use `userEvent.setup()` + `render(<Page />)` pattern

**From story 3.3 code review fixes:**
- Button styling must be consistent across all Controls buttons
- Test assertions should be meaningful, not just "renders without error"

### Git Intelligence

Recent commit patterns on story branches:
- First commit: story spec file + sprint-status update
- Subsequent commits: focused implementation
- Imperative subject lines, one-sentence summaries

### Scope Boundaries

**In scope:** Clear button, Randomize button, reducer actions, wiring, tests.

**NOT in scope (future stories):**
- Speed slider → story 3.5
- Keyboard shortcuts beyond Tab/Enter/Space → story 4.2
- Pattern library → stories 5.1–5.2
- Custom density parameter UI → not planned

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.4] — Acceptance criteria (FR3, FR4)
- [Source: docs/planning-artifacts/architecture.md#§5.1] — `clearGrid` and `randomizeGrid` signatures
- [Source: docs/planning-artifacts/architecture.md#§7.5] — A11y: buttons with aria-label, focus rings
- [Source: docs/planning-artifacts/architecture.md#§6] — Project structure: Controls.tsx
- [Source: docs/planning-artifacts/prd.md#FR3] — Clear the grid: one-click reset to all-dead and gen counter to 0
- [Source: docs/planning-artifacts/prd.md#FR4] — Randomize the grid: one-click pseudo-random fill at ~0.3 density with gen counter reset
- [Source: docs/implementation-artifacts/3-3-play-pause-step-controls-and-generation-counter.md] — Previous story: reducer pattern, Controls component, test infrastructure
- [Source: docs/project-context.md#§3] — Critical rules (especially #4: sim purity, #10: tests with feature)
- [Source: docs/project-context.md#§5] — Conventions: kebab-case files, focus-visible rings, button elements

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7

### Debug Log References

None — clean implementation with no debug issues.

### Completion Notes List

- Added `CLEAR` and `RANDOMIZE` action types to the reducer union and switch cases in `page.tsx`
- Imported `clearGrid` and `randomizeGrid` from `@conways-game-of-life/sim` (already exported from libs/sim)
- Extended `ControlsProps` with `onClear` and `onRandomize` callbacks
- Added Clear and Randomize buttons to Controls component — both always enabled (no disabled pattern unlike Step)
- Created `handleClear` and `handleRandomize` callbacks in page using `useCallback` with `[]` deps
- Both actions unconditionally set `running: false` and `genCount: 0`, satisfying the pause-on-activate AC
- Added 6 Controls unit tests (clear/randomize renders enabled in both states, click callbacks)
- Added 4 page integration tests (gen-count reset, pause-while-running for both buttons)
- All 56 tests pass, lint clean

### Change Log

- Added Clear and Randomize controls with reducer actions, UI buttons, and comprehensive tests (2026-05-25)

### File List

- `apps/web/src/app/page.tsx` — modified (reducer actions, imports, callbacks, Controls props)
- `apps/web/src/app/components/Controls.tsx` — modified (new props, Clear and Randomize buttons)
- `apps/web/src/app/components/Controls.spec.tsx` — modified (6 new tests for Clear/Randomize)
- `apps/web/specs/index.spec.tsx` — modified (4 new integration tests)
- `docs/implementation-artifacts/sprint-status.yaml` — modified (status → in-progress → review)
- `docs/implementation-artifacts/3-4-clear-and-randomize-controls.md` — modified (task checkboxes, dev record, review fixes)

# Story 3.5: Speed slider with rAF + accumulator (mid-run change without restart)

Status: review

## Story

As Casey,
I want to drag the generations-per-second slider while the simulation is running and have the new rate take effect on the next tick,
So that I never have to pause and resume just to change speed.

## Acceptance Criteria

1. **Given** the simulation loop is implemented as a `useSimulationLoop` hook driven by `requestAnimationFrame` plus a time accumulator per architecture §5.2, **When** `genPerSec` changes, **Then** the change is read fresh each frame via a `useRef` (not via a `useEffect` dependency), so the rAF loop is not torn down and rebuilt.

2. **Given** the slider is rendered with documented bounds (1–60 gen/sec, default 10), **When** the user drags from one rate to another while the simulation is running, **Then** the next advanced generation occurs at the new rate without any visible pause, restart, or counter discontinuity.

3. **Given** an integration test in `apps/web`, **When** the user changes the slider mid-run, **Then** the loop's underlying `useEffect` does not re-run (verified by hook-render assertions or a render-counter ref) and the simulation continues uninterrupted.

4. **Given** the slider is keyboard-focused, **When** the user presses Arrow Left or Arrow Right, **Then** the rate changes by one gen/sec per keypress (FR12 hookup).

## Tasks / Subtasks

- [x] **Task 1: Add `genPerSec` state to page** (AC: 1, 2)
  - [x] Add `const [genPerSec, setGenPerSec] = useState(DEFAULT_GEN_PER_SEC)` to `SimulationPage`
  - [x] Replace hardcoded `genPerSec: DEFAULT_GEN_PER_SEC` in `useSimulationLoop` call with dynamic `genPerSec` state
  - [x] Verify the existing `useSimulationLoop` hook already reads `genPerSec` via `genPerSecRef` (it does — no hook changes needed)

- [x] **Task 2: Create SpeedSlider component** (AC: 2, 4)
  - [x] Create `apps/web/src/app/components/SpeedSlider.tsx`
  - [x] Props: `{ value: number; onChange: (value: number) => void }`
  - [x] Render `<input type="range">` with `min={1}`, `max={60}`, `step={1}`
  - [x] Add `aria-label="Generations per second"`, `aria-valuemin={1}`, `aria-valuemax={60}`, `aria-valuenow={value}`
  - [x] Display current value as visible label (e.g., "Speed: 10 gen/s")
  - [x] Style with Tailwind classes consistent with existing controls (focus-visible ring, neutral palette)

- [x] **Task 3: Wire SpeedSlider into page** (AC: 2)
  - [x] Import and render `<SpeedSlider value={genPerSec} onChange={setGenPerSec} />` in the sidebar controls area
  - [x] Place between Controls and GridSizeForm in the sidebar
  - [x] No `useCallback` wrapper needed for `setGenPerSec` — React guarantees `useState` setters are referentially stable

- [x] **Task 4: Tests** (AC: 1, 2, 3, 4)
  - [x] **SpeedSlider unit tests** (`SpeedSlider.spec.tsx`):
    - [x] Renders a range input with correct min/max/step
    - [x] Displays current value label matching format "Speed: {value} gen/s"
    - [x] Calls onChange with a **number** (not string) when slider value changes
    - [x] Has correct aria attributes
  - [x] **Hook unit test — loop stability invariant** (`use-simulation-loop.spec.ts`) (AC: 3):
    - [x] Use `renderHook` from `@testing-library/react` to render `useSimulationLoop`
    - [x] Start running, spy on `cancelAnimationFrame`, then `rerender` with a different `genPerSec`
    - [x] Assert `cancelAnimationFrame` was NOT called — proves useEffect did not re-run
    - [x] Also assert `cancelAnimationFrame` IS called when `running` changes to `false` (control case)
  - [x] **Page integration tests** (`apps/web/specs/index.spec.tsx`):
    - [x] Slider renders with default value 10
    - [x] Changing slider while running does NOT pause simulation (Pause button stays visible)
    - [x] Changing slider does NOT reset gen-count
    - [x] Slider value is preserved after Clear (genPerSec is independent of the reducer)
    - [x] Slider value is preserved after Randomize
  - [x] **Keyboard test** (`SpeedSlider.spec.tsx`):
    - [x] Arrow Right increments value by 1 (native `<input type="range">` behavior)

## Dev Notes

### Critical Architecture Pattern: genPerSec via useRef (NOT useEffect dep)

This is the load-bearing pattern of this story and the explicit defeat of PRD R7. The `useSimulationLoop` hook at `apps/web/src/app/hooks/use-simulation-loop.ts` already implements this correctly:

```typescript
const genPerSecRef = useRef(opts.genPerSec);
genPerSecRef.current = opts.genPerSec; // always-fresh read, no closure capture

useEffect(() => {
  // ...rAF loop reads genPerSecRef.current each frame...
}, [opts.running, opts.step]); // genPerSec is NOT in the dep array
```

**The hook needs ZERO changes.** The page just needs to feed a dynamic `genPerSec` value instead of the hardcoded `DEFAULT_GEN_PER_SEC`.

### What's Already Built (Stories 3.1–3.4)

**State management** in `apps/web/src/app/page.tsx`:
- `useReducer` with `State = { grid, genCount, running, dimensions }`
- Current actions: `SET_DIMENSIONS`, `RESET`, `TICK`, `TOGGLE_CELL`, `PLAY`, `PAUSE`, `STEP`, `CLEAR`, `RANDOMIZE`
- The `genPerSec` value is NOT part of the reducer state — it is independent UI state that feeds into the hook via ref. Use `useState`, not the reducer.

**Simulation loop** at `apps/web/src/app/hooks/use-simulation-loop.ts`:
- rAF + time accumulator with `genPerSecRef` — already complete
- `useEffect` deps: `[opts.running, opts.step]` — genPerSec is excluded by design
- The accumulator re-derives `tickInterval = 1000 / genPerSecRef.current` each frame

**Current page.tsx line 141–145:**
```typescript
useSimulationLoop({
  running: state.running,
  genPerSec: DEFAULT_GEN_PER_SEC,  // ← replace with dynamic state
  step: handleTick,
});
```

**Controls component** at `apps/web/src/app/components/Controls.tsx`:
- Does NOT own the slider — SpeedSlider is a separate component per architecture §6

### Why useState, Not useReducer

`genPerSec` is independent of `grid`, `genCount`, `running`, and `dimensions`. It doesn't participate in atomic state transitions (unlike grid+genCount which must update together in TICK). Adding it to the reducer would force `useSimulationLoop` to depend on the full state object or require extracting it before passing — both worse than a simple `useState`.

### SpeedSlider Component Design

Architecture §6 lists `SpeedSlider.tsx` under `apps/web/app/components/` (actual path: `apps/web/src/app/components/`). Use a native `<input type="range">` — it provides Arrow key behavior for free (AC #4) without custom keyboard handling.

```typescript
interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
}
```

**Label format:** "Speed: {value} gen/s" (e.g., "Speed: 10 gen/s"). Use this exact format for test assertions.

**onChange must parse to number:** The `<input>` event value is a string. The handler must convert: `onChange(Number(e.target.value))`. Common LLM mistake: passing the string directly, which breaks the `value: number` contract.

A11y requirements from architecture §7.5:
- `aria-label="Generations per second"`
- `aria-valuemin={1}`, `aria-valuemax={60}`, `aria-valuenow={value}`
- Focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`

Locked defaults from project-context §3 rule 17:
- Min: 1 gen/sec
- Max: 60 gen/sec
- Default: 10 gen/sec
- Step: 1

### genPerSec Is Independent of the Reducer

`genPerSec` does NOT reset on Clear, Randomize, or Resize. It is `useState` — completely independent of the reducer's `{ grid, genCount, running, dimensions }` state. Do not add logic to reset the slider when those actions fire. The user's chosen speed persists across grid resets.

### Anti-Patterns to Avoid

1. **DO NOT put `genPerSec` in the `useEffect` dependency array of `useSimulationLoop`.** This would tear down the rAF loop on every slider change — the exact R7 failure mode.
2. **DO NOT use `setInterval`.** The rAF + accumulator is already implemented and working.
3. **DO NOT add `genPerSec` to the reducer `State`.** It's independent UI state; mixing it in adds coupling for no benefit.
4. **DO NOT create a custom keyboard handler for Arrow keys.** Native `<input type="range">` handles this.
5. **DO NOT add a `SET_SPEED` reducer action.** Plain `useState` + `setGenPerSec` is sufficient and keeps the speed value out of the reducer's concern.

### Project Structure Notes

- **New file:** `apps/web/src/app/components/SpeedSlider.tsx`
- **New file:** `apps/web/src/app/components/SpeedSlider.spec.tsx`
- **New file:** `apps/web/src/app/hooks/use-simulation-loop.spec.ts` (hook unit test for AC3 loop stability invariant)
- **Modified:** `apps/web/src/app/page.tsx` (add state, import, render SpeedSlider)
- **Modified:** `apps/web/specs/index.spec.tsx` (add integration tests)
- **NOT modified:** `apps/web/src/app/hooks/use-simulation-loop.ts` (already correct)
- **NOT modified:** `libs/sim/` (no sim changes needed)

### Architecture Compliance

**Module boundaries:** Only `apps/web` (scope:app) is modified. No cross-boundary imports introduced.

**Slider a11y (architecture §7.5):**
- `<input type="range">` with full ARIA attributes
- Visible focus: `focus-visible:ring-2 focus-visible:ring-cyan-400`
- Native Arrow key support (FR12)

**rAF pattern (architecture §5.2):** Preserved exactly. The `useSimulationLoop` hook is untouched — the design specifically anticipated this story's change.

### Library/Framework Requirements

- **React 19** (`^19.0.0`) — `useState` for genPerSec
- **Next.js 16** — `'use client'` already on page.tsx
- **Tailwind CSS** — style slider and label with utility classes
- No new dependencies required

### Testing Requirements

**Run with:** `pnpm nx test web`

**SpeedSlider unit tests** (`apps/web/src/app/components/SpeedSlider.spec.tsx`):
- Renders range input with `min="1"`, `max="60"`, `step="1"`
- Shows current value in visible label matching "Speed: {value} gen/s"
- Calls `onChange` with a **number** (not string) when slider moves: use `fireEvent.change(input, { target: { value: '20' } })` then assert `onChange` was called with `20` (number) — `userEvent` doesn't reliably handle range input changes
- Has `aria-label="Generations per second"`
- Has `aria-valuenow` matching current value

**Hook unit test — loop stability invariant** (`apps/web/src/app/hooks/use-simulation-loop.spec.ts`):
This is the AC3 test. Uses `renderHook` to test the hook in isolation.
```typescript
// Approach:
const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
const { rerender } = renderHook((props) => useSimulationLoop(props), {
  initialProps: { running: true, genPerSec: 10, step: mockStep },
});
cancelSpy.mockClear();
rerender({ running: true, genPerSec: 30, step: mockStep });
expect(cancelSpy).not.toHaveBeenCalled(); // useEffect did NOT re-run

// Control case: changing `running` DOES trigger cleanup
cancelSpy.mockClear();
rerender({ running: false, genPerSec: 30, step: mockStep });
expect(cancelSpy).toHaveBeenCalled(); // useEffect DID re-run
```
- Requires mocking `requestAnimationFrame` (return a numeric handle) and `performance.now`

**Page integration tests** (add to `apps/web/specs/index.spec.tsx`):
- Slider renders with default value: `getByRole('slider', { name: /generations per second/i })` with `value="10"`
- Changing slider while running does NOT pause simulation: start sim, change slider, assert Pause button still visible
- Changing slider does NOT reset gen-count: step once, change slider, assert gen-count unchanged
- Slider value preserved after Clear: change slider to 20, click Clear, assert slider still shows 20
- Slider value preserved after Randomize: change slider to 30, click Randomize, assert slider still shows 30

**Mock requirements:**
- `jest-canvas-mock` already configured
- `ResizeObserver` mock already in place
- Hook test needs: `jest.spyOn(window, 'requestAnimationFrame')`, `jest.spyOn(window, 'cancelAnimationFrame')`, `jest.spyOn(performance, 'now')`
- No new mocks needed for SpeedSlider or page integration tests

### Previous Story Intelligence

**From story 3.4:**
- `useCallback` pattern with `[]` deps for handlers — follow the same pattern for `setGenPerSec` (though `useState` setter is already stable)
- `@testing-library/user-event` already installed — use for button interactions; use `fireEvent.change` for range inputs
- Controls.spec.tsx pattern: `defaultProps` with `jest.fn()`, `jest.clearAllMocks()` in `beforeEach`
- Page integration tests: `userEvent.setup()` + `render(<Page />)` pattern
- Button text must match story terminology exactly (lesson from 3.4 code review)

**From story 3.4 code review:**
- Button styling must be consistent across all controls
- `flex-wrap` already added to Controls container for narrow viewports

### Git Intelligence

Recent commit pattern: story spec file + sprint-status as first commit, then focused implementation commits. Imperative subjects, one-sentence summaries.

### Scope Boundaries

**In scope:** SpeedSlider component, genPerSec state, page wiring, tests.

**NOT in scope:**
- Modifications to `useSimulationLoop` hook (already correct)
- Modifications to `libs/sim` (no sim changes)
- Keyboard shortcuts beyond native range input behavior → story 4.2
- Performance profiling → NFR4 verified by architecture pattern, not by this story

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.5] — ACs (FR8, NFR4)
- [Source: docs/planning-artifacts/architecture.md#§5.2] — rAF + accumulator pseudocode with genPerSecRef pattern
- [Source: docs/planning-artifacts/architecture.md#§6] — SpeedSlider.tsx in project structure
- [Source: docs/planning-artifacts/architecture.md#§7.5] — Slider a11y: aria-label, aria-valuemin/max/now, focus rings
- [Source: docs/project-context.md#§3 Rule 6] — rAF + accumulator with rate via useRef, not useEffect dep
- [Source: docs/project-context.md#§3 Rule 7] — setInterval forbidden
- [Source: docs/project-context.md#§3 Rule 17] — Locked defaults: 1–60 gen/sec, default 10
- [Source: docs/implementation-artifacts/3-4-clear-and-randomize-controls.md] — Previous story patterns, test infrastructure
- [Source: apps/web/src/app/hooks/use-simulation-loop.ts] — Hook already implements genPerSecRef pattern (lines 11–12)
- [Source: apps/web/src/app/page.tsx#L141-145] — Current hardcoded genPerSec call site

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

None — clean implementation with no failures.

### Completion Notes List

- Task 1: Added `useState(DEFAULT_GEN_PER_SEC)` to SimulationPage, replaced hardcoded constant in `useSimulationLoop` call with dynamic state. Hook unchanged — already reads via `genPerSecRef.current`.
- Task 2: Created SpeedSlider component with native `<input type="range">`, ARIA attributes, `Number()` conversion on change, Tailwind focus ring styling, and visible "Speed: {value} gen/s" label.
- Task 3: Wired SpeedSlider between Controls and GridSizeForm in sidebar. Passed `setGenPerSec` directly (referentially stable).
- Task 4: Added 6 SpeedSlider unit tests, 1 hook loop-stability control case test, 5 page integration tests. All 69 tests pass (12 new, 57 existing).

### File List

- `apps/web/src/app/page.tsx` — modified (added genPerSec state, SpeedSlider import and render)
- `apps/web/src/app/components/SpeedSlider.tsx` — new (speed slider component)
- `apps/web/src/app/components/SpeedSlider.spec.tsx` — new (6 unit tests)
- `apps/web/src/app/hooks/use-simulation-loop.spec.ts` — modified (added control case test)
- `apps/web/specs/index.spec.tsx` — modified (added 5 integration tests)
- `docs/implementation-artifacts/sprint-status.yaml` — modified (status update)
- `docs/implementation-artifacts/3-5-speed-slider-with-raf-accumulator-mid-run-change-without-restart.md` — modified (task checkboxes, dev record)

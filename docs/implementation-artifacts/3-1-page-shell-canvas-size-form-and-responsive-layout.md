# Story 3.1: Page shell, canvas size form, and responsive layout

Status: done

## Story

As Casey,
I want to land on a page with a sensible-default empty grid and a width x height form to resize it,
So that I can start interacting within seconds on either desktop or my 375px portrait phone.

## Acceptance Criteria

1. **Given** the page is loaded on a desktop >=1280px viewport, **When** the canvas and controls render, **Then** everything is visible together with no scrolling.

2. **Given** the page is loaded on a 375px portrait viewport, **When** the page renders, **Then** controls reflow vertically, the canvas scales to fit width, and there is no horizontal scrollbar.

3. **Given** the canvas size form, **When** the user enters a valid width and height within `[5, 100]`, **Then** the grid renders at the new dimensions and the generation counter resets to 0.

4. **Given** the canvas size form, **When** the user enters a value outside `[5, 100]` (zero, negative, >100, non-numeric), **Then** the input is rejected with a visible message and the previous size is retained.

5. **Given** the simulation is running, **When** the user submits a new canvas size, **Then** the simulation pauses and the grid resets (pause + clear per architecture Open Question 1).

## Tasks / Subtasks

- [x] **Task 1: Verify existing scaffold** (AC: prerequisite)
  - [x] Run `pnpm nx dev web` and confirm the default Nx page loads
  - [x] Confirm Tailwind is operational (apply a utility class and verify it renders)
  - [x] Confirm `@conways-game-of-life/sim` imports resolve from `apps/web`
  - [x] Note any Nx version quirks (document in dev notes)

- [x] **Task 2: Replace scaffold page with game shell** (AC: 1, 2)
  - [x] Replace `apps/web/src/app/page.tsx` content with a `'use client'` simulation page
  - [x] Replace `apps/web/src/app/global.css` — strip all Nx boilerplate styles, keep only Tailwind directives + minimal reset
  - [x] Delete `apps/web/src/app/page.module.css` (not needed with Tailwind)
  - [x] Set up the responsive page layout using Tailwind:
    - Desktop (>=768px): canvas and controls side-by-side or stacked with no scroll
    - Mobile (<768px): single-column vertical flow, canvas scales to fit width
  - [x] Render an empty `<canvas>` element sized to the current grid dimensions
  - [x] Implement `renderGrid()` function per architecture §5.3 pattern

- [x] **Task 3: Wire grid state with useReducer** (AC: 1, 3, 5)
  - [x] Define a reducer managing `{ grid, genCount, running, dimensions }` (genPerSec deferred to story 3.5 per YAGNI decision — see AI Usage Note #4)
  - [x] Initialize with `createGrid(30, 30)` from `@conways-game-of-life/sim`
  - [x] Wire Canvas `useEffect([grid])` to trigger redraws
  - [x] Expose dispatch actions: `SET_DIMENSIONS`, `RESET`

- [x] **Task 4: Implement GridSizeForm component** (AC: 3, 4, 5)
  - [x] Create `apps/web/src/app/components/GridSizeForm.tsx`
  - [x] Two number inputs (width, height) + submit button
  - [x] Client-side validation: integers in [5, 100]; reject with visible error message
  - [x] On valid submit: dispatch `SET_DIMENSIONS` which calls `createGrid(w, h)`, resets genCount to 0, sets running to false
  - [x] `aria-label` on inputs, visible labels, focus ring styling

- [x] **Task 5: Generation counter display** (AC: 3)
  - [x] Render `genCount` with `data-testid="gen-count"` (required for Playwright in story 4.1)
  - [x] Visible at all viewport sizes without scrolling

- [x] **Task 6: Responsive verification** (AC: 1, 2)
  - [x] Test at >=1280px: no scrolling, all elements visible
  - [x] Test at 375px portrait: vertical reflow, no horizontal scrollbar, canvas fits width
  - [x] Canvas `cellSize` calculation: fit canvas pixel width to container, derive cellSize from `containerWidth / grid.width`, cap canvas height similarly

- [x] **Task 7: Clean up scaffold artifacts** (AC: prerequisite)
  - [x] Remove `apps/web/src/app/api/hello/route.ts` (Nx boilerplate, not needed)
  - [x] Update `apps/web/src/app/layout.tsx` metadata (title, description)
  - [x] Update existing test file `apps/web/specs/index.spec.tsx` or replace with a smoke test for the new page

- [x] **Task 8: Simulation loop per architecture §5.2** (AC: 5 — planning gap)
  - [x] Add `TICK` action to reducer that calls `step(grid)` and increments `genCount`
  - [x] Create `apps/web/src/app/hooks/useSimulationLoop.ts` implementing the rAF + time accumulator pattern from architecture §5.2
  - [x] Read `genPerSec` via `useRef` (always-fresh, no closure capture) so the loop never tears down on rate changes
  - [x] Wire hook in `page.tsx`: pass `running`, `genPerSec` (default 10), and a `step` callback that dispatches `TICK`
  - [x] Initialize with `running: true` and a randomized grid so the simulation is visibly active on load
  - [x] Verify AC #5: submitting a new canvas size sets `running = false` (pauses) and clears the grid
  > **Planning miss:** AC #5 requires "the simulation is running" as a precondition, but the original task list deferred the run loop to story 3.5. Building the full §5.2 accumulator hook now avoids throwaway code — story 3.5 only needs to add the speed slider UI and wire `genPerSec` to state.

## Dev Notes

### Runtime Versions

The scaffold runs **React 19** (`^19.0.0`) and **Next.js 16** (`~16.1.6`). Key implications:

- `ref` is a regular prop in React 19 — do NOT use `forwardRef` (it still works but is unnecessary and deprecated-direction).
- `'use client'` is mandatory for any component using hooks, event handlers, or browser APIs.
- Automatic batching is on by default (state updates in event handlers are already batched).

### TypeScript Strictness

`tsconfig.base.json` has `"noUncheckedIndexedAccess": true`. When indexing into `Uint8Array` (e.g., `grid.cells[y * grid.width + x]`), TypeScript returns `number | undefined`, not `number`. Use strict equality (`=== 1`) for narrowing, or assert with `!` only when bounds are already checked. The `renderGrid` code below handles this correctly via `=== 1`.

### Architecture Patterns (MUST follow)

**State management** — `useReducer` for atomic grid+genCount transitions, not separate `useState` calls. One dispatch per tick keeps state consistent. Reference: architecture §4.5.

**Render strategy** — HTML Canvas with `fillRect` per live cell. Dead background: `#0a0a0a` (neutral-950). Alive cell: `#22d3ee` (cyan-400). Render triggered by `useEffect([grid])`. Reference: architecture §5.3.

```typescript
function renderGrid(ctx: CanvasRenderingContext2D, grid: Grid, cellSize: number) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, grid.width * cellSize, grid.height * cellSize);
  ctx.fillStyle = '#22d3ee';
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.cells[y * grid.width + x] === 1) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}
```

**Canvas sizing** — The `<canvas>` element's `width`/`height` attributes set the pixel buffer. CSS controls the display size. Use a **ResizeObserver** on the canvas container to track available width (architecture §2 NFR1 explicitly requires this). Compute `cellSize = Math.floor(containerWidth / grid.width)`, then set `canvas.width = cellSize * grid.width` and `canvas.height = cellSize * grid.height`. This ensures the canvas adapts to viewport changes (window resize, device rotation, Playwright viewport simulation) without requiring a grid-dimension change to trigger a re-render. Store `containerWidth` in state via the observer callback; derive `cellSize` from it.

**Grid resize mid-run** — Pause + clear (architecture §10 Open Question 1). On new dimensions: `running = false`, `grid = createGrid(newWidth, newHeight)`, `genCount = 0`.

### Component File Structure

Per architecture §6, create these files:

```
apps/web/src/app/
  page.tsx              # 'use client' — main simulation page, owns state
  components/
    Canvas.tsx          # Renders grid to <canvas>, accepts grid + cellSize
    GridSizeForm.tsx    # Width/height inputs + submit + validation
  layout.tsx            # Already exists — update metadata
```

Do NOT create Controls.tsx or SpeedSlider.tsx yet — those belong to stories 3.3 and 3.5. (`useSimulationLoop.ts` was added via Task 8 to resolve the AC #5 planning gap.)

### Imports from libs/sim

Use the `@conways-game-of-life/sim` path alias (never relative paths):

```typescript
import { createGrid, type Grid } from '@conways-game-of-life/sim';
```

Available functions (all landed in Epic 2): `createGrid`, `cloneGrid`, `getCell`, `setCell`, `toggleCell`, `clearGrid`, `randomizeGrid`, `step`, `conwayRules`.

### Default Values (locked — do not relitigate)

- Default grid on first load: **30x30**
- Grid bounds: **5 min, 100 max** (per dimension)
- Speed slider range: 1-60 gen/sec, default 10 (not rendered yet — story 3.5)
- Randomize density: ~0.3 (not wired yet — story 3.4)

### Validation Rules for GridSizeForm

- Both width and height must be integers in [5, 100]
- Reject: non-numeric, floats, negative, zero, >100
- On rejection: show a visible error message adjacent to the input, retain previous grid size
- On valid submit: create new grid, reset genCount to 0, pause if running

### Responsive Layout Strategy

Use Tailwind breakpoints. The architecture specifies desktop (>=1280px) and mobile (375px portrait) as the two targets. A reasonable approach:

- Single-column layout by default (mobile-first)
- At `md:` (768px+) or `lg:` (1024px+): widen the layout so canvas and controls coexist without scrolling
- Canvas container is `w-full` on mobile, constrained on desktop
- Controls stack vertically on mobile, can be beside the canvas on desktop
- No horizontal scroll at any viewport — verify `overflow-x: hidden` is not needed (if layout is correct, it won't be)

### Accessibility Baseline

- Width/height inputs: `<input type="number">` with visible `<label>` elements (not just placeholder text)
- Submit button: `<button type="submit">` with descriptive text (e.g., "Apply" or "Resize")
- Visible focus rings on all interactive elements: `focus-visible:ring-2 focus-visible:ring-cyan-400`
- Color contrast: text on dark background >= 4.5:1
- Tab order: width input -> height input -> submit button (natural DOM order)

### data-testid Attributes (required for Playwright in Epic 4)

Add `data-testid` to these elements now so E2E specs don't require DOM rework later:

- `data-testid="gen-count"` — on the generation counter element
- `data-testid="canvas"` — on the `<canvas>` element
- `data-testid="grid-width"` — on the width input
- `data-testid="grid-height"` — on the height input
- `data-testid="grid-submit"` — on the form submit button

### Previous Epic Learnings (from Epic 2 retro)

- **Front-load infrastructure in this story.** Epic 2 retro §Key Insights #3: "Story 3.1 should establish React/Canvas/testing conventions for the rest of the epic." The component structure, reducer pattern, canvas render function, and Tailwind conventions set here will be reused by stories 3.2-3.5.
- **Verify scaffold before building.** Epic 2 retro §Team Agreements: "Story 3.1 must verify the existing Next.js/Tailwind scaffold works before building on it." Task 1 covers this.
- **Validate at function boundaries during initial implementation.** Don't wait for review to add input validation to GridSizeForm — bake it in from the start (Epic 2 retro §Action Items).
- **Exhaustive test verification.** If tests are written for form validation, verify all boundary cases (5, 100, 4, 101, 0, -1, NaN, empty string).

### Testing Notes

This story focuses on the page shell and form. Tests to include:

- **GridSizeForm component test** (`apps/web/src/app/components/GridSizeForm.spec.tsx`): valid submit dispatches correct action; invalid values show error and don't dispatch; boundary values (5, 100) accepted; out-of-bounds (4, 101) rejected.
- **Smoke test** for page rendering (update `apps/web/specs/index.spec.tsx`): page renders without crashing, canvas element is present, form inputs are present.
- **Canvas mock** — jsdom has no Canvas API. Install `jest-canvas-mock` as a dev dependency and import it in the Jest setup file so `getContext('2d')` doesn't return null in tests.
- Run with `pnpm nx test web`.

### Gotchas

- The existing `page.tsx` is the Nx boilerplate "Welcome to @conways-game-of-life/web" page with `page.module.css`. Replace it entirely — don't try to modify incrementally.
- The existing `global.css` has extensive Nx boilerplate styles. Strip them — keep only `@tailwind base/components/utilities` directives and any minimal reset you need.
- `apps/web/src/app/api/hello/route.ts` is Nx boilerplate — remove it to avoid confusion.
- The `<canvas>` element needs both `width`/`height` attributes (pixel buffer) AND CSS sizing (display size). Mismatch causes blurry rendering.
- `useReducer` dispatch is stable across renders (referential identity) — safe to pass to child components and list in dependency arrays.

### Project Structure Notes

- Alignment with architecture §6 repository tree — exact paths match
- No conflicts or variances with unified project structure
- Components go in `apps/web/src/app/components/`, not `libs/ui` (which is for shared presentational primitives, not page-specific components).

### References

- [Source: docs/planning-artifacts/architecture.md#§4.5] — State management: useState + useReducer
- [Source: docs/planning-artifacts/architecture.md#§5.3] — Render strategy: Canvas + fillRect
- [Source: docs/planning-artifacts/architecture.md#§6] — Repository tree and component paths
- [Source: docs/planning-artifacts/architecture.md#§7.5] — Accessibility baseline
- [Source: docs/planning-artifacts/architecture.md#§10] — Open Question 1: canvas resize = pause + clear
- [Source: docs/planning-artifacts/epics.md#Story 3.1] — Acceptance criteria
- [Source: docs/planning-artifacts/prd.md#FR1] — Define canvas size
- [Source: docs/planning-artifacts/prd.md#FR11] — Responsive layout
- [Source: docs/planning-artifacts/prd.md#NFR1] — Responsive across desktop and mobile
- [Source: docs/implementation-artifacts/epic-2-retro-2026-05-24.md#Key Insights] — Front-load infrastructure in 3.1
- [Source: docs/project-context.md#§3] — Critical implementation rules
- [Source: docs/project-context.md#§5] — Conventions and patterns

## AI Usage Notes (for ai-usage.md)

Candidates for inclusion in `docs/implementation-artifacts/ai-usage.md`, logged during story creation:

1. **AI helped: scaffold-aware story generation.** The BMAD create-story workflow loaded all 6 planning/implementation artifacts (epics, architecture, PRD, project-context, previous story 2-4, Epic 2 retro) and cross-referenced them to produce a story file with dev notes tailored to the actual codebase state — not just the architecture's aspirational description. For example, it detected the actual React 19 / Next.js 16 versions from `apps/web/package.json` and `noUncheckedIndexedAccess` from `tsconfig.base.json`, neither of which the architecture doc covers, and added targeted guidance for each.

2. **AI helped: review caught real gaps.** Post-generation validation identified that jsdom lacks Canvas API support, meaning the existing smoke test would crash after this story's changes. This led to adding `jest-canvas-mock` to the story's testing guidance — a practical infrastructure requirement the planning artifacts didn't anticipate.

3. **Human pushed back: ResizeObserver was already decided.** The AI presented canvas sizing (ResizeObserver vs. render-time measurement) as an open design question with a recommendation. The human caught that architecture §2 NFR1 already explicitly mandates ResizeObserver — the AI had missed this during its "exhaustive" artifact analysis. The story was corrected to cite the architecture decision rather than present it as a choice.

4. **Human pushed back: YAGNI on reducer action union.** The AI proposed sketching the full reducer action type for stories 3.1–3.5 upfront to prevent downstream rework. The human chose to define only what story 3.1 needs, letting each subsequent story extend the reducer. Rationale: the dev agent for 3.2 will have 3.1's code as context anyway, and pre-defining unused actions adds speculative surface.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

- Nx 22.7.2 uses `customConditions` in tsconfig.base.json instead of `paths` for cross-lib imports. Turbopack resolves workspace packages via pnpm workspace protocol, so `@conways-game-of-life/sim` must be listed as a dependency in `apps/web/package.json`.
- `setupFilesAfterEnv` (not `setupFiles`) is required in Jest config for `@testing-library/jest-dom` because `expect` global must be available.
- `<input type="number">` coerces non-numeric text to empty string in jsdom — validation sees "Required" rather than "Must be an integer" for alphabetic input.
- **Planning gap (Task 8):** AC #5 requires a running simulation as a precondition, but no task in the original plan implements a run loop — that was deferred to story 3.5 (speed slider + rAF accumulator). Building the full §5.2 accumulator hook now avoids throwaway code; story 3.5 only needs the speed slider UI.
- **CI e2e failure — Turbopack module resolution:** The e2e job failed because Turbopack couldn't resolve `@conways-game-of-life/sim`. Root cause: the workspace used `customConditions` in tsconfig.base.json (not `paths`), so `withNx` auto-discovery found no workspace deps to add to `transpilePackages`. Locally it worked by accident because `libs/sim/dist/` existed from prior builds — Turbopack fell back to the `"import": "./dist/index.js"` export. In CI (clean checkout), no dist exists and Turbopack doesn't support `customConditions`, so resolution failed. Fix: (1) dropped `.js` extensions from relative imports across all libs, (2) switched lib tsconfig.lib.json files from `moduleResolution: "nodenext"` to `"bundler"`, (3) added `baseUrl` + `paths` to tsconfig.base.json so `withNx` auto-discovers workspace deps for `transpilePackages`.

### AI Usage Notes (implementation phase)

Candidates for inclusion in `docs/implementation-artifacts/ai-usage.md`, logged during implementation:

5. **Human caught: invisible canvas on first delivery.** The AI marked the story "review" without visually verifying the page. The canvas background (`#0a0a0a`) was identical to the page background (`neutral-950`), making the empty grid completely invisible. The human had to screenshot the page and ask "this is not the expected result, correct?" — the AI had relied on `curl` and `data-testid` checks rather than actually looking at the rendered output. Grid lines (`#404040`) were added to make the grid visible.

6. **Human pushed back: grid line contrast too low.** The AI's first fix used `#262626` (neutral-800) for grid lines — still nearly invisible against `#0a0a0a`. The human flagged it again. Bumped to `#404040` (neutral-600), which the human confirmed was acceptable. Lesson: when fixing a visibility problem, err on the side of more contrast, not less.

7. **Human caught: AC #5 untestable without a run loop.** The AI completed all 7 original tasks without noticing that AC #5 ("Given the simulation is running…") had no way to be satisfied — no task implemented a simulation loop. The AI had initialized a static randomized grid to "show cells," but the user pointed out the simulation was frozen. This was a planning gap: the story's task list assumed the run loop lived in story 3.5, but AC #5 made it a dependency of story 3.1.

8. **Human directed: build the real architecture, not a throwaway.** When the AI proposed adding a "basic rAF loop" as the quick fix for the planning gap, the human redirected to implementing the full architecture §5.2 `useSimulationLoop` hook (rAF + time accumulator, `genPerSec` via `useRef`). This avoids writing disposable code that story 3.5 would immediately replace — the hook is production-grade from the start, and story 3.5 only needs to add the speed slider UI.

9. **AI helped: diagnosed Turbopack resolution failure across local/CI environments.** The e2e CI job failed with `Module not found: Can't resolve '@conways-game-of-life/sim'` while all other CI jobs and local dev passed. The AI traced the root cause through multiple layers: (a) `withNx` auto-discovery relies on tsconfig `paths` but the workspace used `customConditions` instead, (b) local success was a false positive — Turbopack resolved via `libs/sim/dist/` from prior builds, not from source, (c) CI had no dist on a clean checkout. The AI proposed three options (drop `.js` extensions + add paths, manual `transpilePackages`, or pre-build in CI) and the human selected option A.

10. **Human pushed back: fix auto-discovery, don't hardcode.** The AI's first proposed fix was adding `transpilePackages: ['@conways-game-of-life/sim', '@conways-game-of-life/types']` to next.config.js. The human rejected this as suboptimal compared to automatic discovery. The AI then proposed tsconfig `paths` + `baseUrl`, which enables `withNx`'s built-in auto-discovery mechanism — no manual package list to maintain as libs are added.

### Completion Notes List

- Replaced Nx boilerplate page with `'use client'` simulation page using `useReducer` for state management
- Created `Canvas.tsx` component with `renderGrid()` per architecture §5.3 (dark bg #0a0a0a, live cells #22d3ee)
- Created `GridSizeForm.tsx` with client-side validation for integers in [5, 100], visible error messages, accessible labels and focus rings
- ResizeObserver on canvas container derives `cellSize = Math.floor(containerWidth / grid.width)` for responsive canvas sizing
- Responsive layout: single-column mobile-first, side-by-side at `lg:` breakpoint (1024px+)
- Generation counter with `data-testid="gen-count"` visible at all viewport sizes
- All 5 required `data-testid` attributes present: canvas, gen-count, grid-width, grid-height, grid-submit
- Stripped Nx boilerplate: deleted `page.module.css`, `api/hello/route.ts`, cleaned `global.css` to Tailwind directives only
- Updated layout metadata: title "Conway's Game of Life", description "Interactive cellular automaton simulation"
- Installed `jest-canvas-mock` and `@testing-library/jest-dom` as dev dependencies; created `jest.setup.ts` with canvas mock and ResizeObserver polyfill
- 26 tests: 15 GridSizeForm tests (valid submit, boundary values 5/100, rejection of 4/101/0/negative/non-numeric/empty/float, both-field errors, error clearing) + 5 smoke tests (render, canvas, form inputs, gen counter, title) + 6 useSimulationLoop hook tests (start/stop, tick timing, cleanup, ref-fresh genPerSec)
- Created `useSimulationLoop` hook per architecture §5.2: rAF + time accumulator, `genPerSec` read via `useRef` for mid-run rate changes without loop teardown
- Added `TICK` reducer action calling `step(grid)` to advance one generation
- Grid initializes randomized and running at 10 gen/sec; resize pauses and clears (AC #5)

### Change Log

- 2026-05-24: Implemented story 3.1 — page shell, canvas, grid size form, responsive layout, tests
- 2026-05-24: Code review fixes — added useSimulationLoop hook tests (6), fixed non-reactive maxHeight, corrected task 3 description (genPerSec deferred), added tsconfig.json to file list, resolved dev notes self-contradiction on useSimulationLoop.ts
- 2026-05-24: Code review fixes (round 2) — committed uncommitted spec and page.tsx fixes, renamed hook files to kebab-case per project-context §5, removed redundant 'use client' directives from Canvas.tsx and use-simulation-loop.ts, removed unused eslint-disable in next.config.js
- 2026-05-25: Fix CI e2e — switch libs to bundler module resolution, drop .js extensions, add tsconfig paths for withNx auto-discovery
- 2026-05-25: Fix stale scaffold e2e — update web-e2e example.spec.ts assertion from "Welcome" to "Conway's Game of Life"

### File List

- apps/web/package.json (modified — added sim dependency, jest-canvas-mock, @testing-library/jest-dom)
- apps/web/jest.config.cts (modified — added setupFilesAfterEnv)
- apps/web/jest.setup.ts (new — canvas mock, jest-dom, ResizeObserver polyfill)
- apps/web/src/app/page.tsx (replaced — simulation page with useReducer)
- apps/web/src/app/global.css (replaced — Tailwind directives only)
- apps/web/src/app/layout.tsx (modified — updated metadata)
- apps/web/src/app/page.module.css (deleted)
- apps/web/src/app/api/hello/route.ts (deleted)
- apps/web/src/app/components/Canvas.tsx (new)
- apps/web/src/app/components/GridSizeForm.tsx (new)
- apps/web/src/app/components/GridSizeForm.spec.tsx (new — 15 tests)
- apps/web/src/app/hooks/use-simulation-loop.ts (new — rAF + accumulator loop per architecture §5.2)
- apps/web/src/app/hooks/use-simulation-loop.spec.ts (new — 6 hook tests: start/stop, tick timing, cleanup, ref-fresh genPerSec)
- apps/web/next.config.js (modified — removed unused eslint-disable directive)
- apps/web/tsconfig.json (modified — added references to libs/sim)
- apps/web/specs/index.spec.tsx (replaced — 5 smoke tests)
- docs/implementation-artifacts/sprint-status.yaml (modified — story status)
- docs/implementation-artifacts/3-1-page-shell-canvas-size-form-and-responsive-layout.md (modified — task checkboxes, dev record, status)
- pnpm-lock.yaml (modified — new dev dependencies)
- tsconfig.base.json (modified — added baseUrl and paths for workspace lib auto-discovery)
- libs/sim/src/index.ts (modified — dropped .js extensions from relative imports)
- libs/sim/src/lib/rules/conway.ts (modified — dropped .js extension from relative import)
- libs/sim/tsconfig.lib.json (modified — switched module/moduleResolution to esnext/bundler)
- libs/types/src/index.ts (modified — dropped .js extensions from relative imports)
- libs/types/src/lib/rule-set.ts (modified — dropped .js extension from relative import)
- libs/types/tsconfig.lib.json (modified — switched module/moduleResolution to esnext/bundler)
- libs/api-client/src/index.ts (modified — dropped .js extension from relative import)
- libs/api-client/tsconfig.lib.json (modified — switched module/moduleResolution to esnext/bundler)
- apps/web-e2e/src/example.spec.ts (modified — updated h1 assertion from "Welcome" to "Conway's Game of Life")

# Story 3.1: Page shell, canvas size form, and responsive layout

Status: ready-for-dev

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

- [ ] **Task 1: Verify existing scaffold** (AC: prerequisite)
  - [ ] Run `pnpm nx dev web` and confirm the default Nx page loads
  - [ ] Confirm Tailwind is operational (apply a utility class and verify it renders)
  - [ ] Confirm `@conways-game-of-life/sim` imports resolve from `apps/web`
  - [ ] Note any Nx version quirks (document in dev notes)

- [ ] **Task 2: Replace scaffold page with game shell** (AC: 1, 2)
  - [ ] Replace `apps/web/src/app/page.tsx` content with a `'use client'` simulation page
  - [ ] Replace `apps/web/src/app/global.css` — strip all Nx boilerplate styles, keep only Tailwind directives + minimal reset
  - [ ] Delete `apps/web/src/app/page.module.css` (not needed with Tailwind)
  - [ ] Set up the responsive page layout using Tailwind:
    - Desktop (>=768px): canvas and controls side-by-side or stacked with no scroll
    - Mobile (<768px): single-column vertical flow, canvas scales to fit width
  - [ ] Render an empty `<canvas>` element sized to the current grid dimensions
  - [ ] Implement `renderGrid()` function per architecture §5.3 pattern

- [ ] **Task 3: Wire grid state with useReducer** (AC: 1, 3, 5)
  - [ ] Define a reducer managing `{ grid, genCount, running, genPerSec, dimensions }` 
  - [ ] Initialize with `createGrid(30, 30)` from `@conways-game-of-life/sim`
  - [ ] Wire Canvas `useEffect([grid])` to trigger redraws
  - [ ] Expose dispatch actions: `SET_DIMENSIONS`, `RESET`

- [ ] **Task 4: Implement GridSizeForm component** (AC: 3, 4, 5)
  - [ ] Create `apps/web/src/app/components/GridSizeForm.tsx`
  - [ ] Two number inputs (width, height) + submit button
  - [ ] Client-side validation: integers in [5, 100]; reject with visible error message
  - [ ] On valid submit: dispatch `SET_DIMENSIONS` which calls `createGrid(w, h)`, resets genCount to 0, sets running to false
  - [ ] `aria-label` on inputs, visible labels, focus ring styling

- [ ] **Task 5: Generation counter display** (AC: 3)
  - [ ] Render `genCount` with `data-testid="gen-count"` (required for Playwright in story 4.1)
  - [ ] Visible at all viewport sizes without scrolling

- [ ] **Task 6: Responsive verification** (AC: 1, 2)
  - [ ] Test at >=1280px: no scrolling, all elements visible
  - [ ] Test at 375px portrait: vertical reflow, no horizontal scrollbar, canvas fits width
  - [ ] Canvas `cellSize` calculation: fit canvas pixel width to container, derive cellSize from `containerWidth / grid.width`, cap canvas height similarly

- [ ] **Task 7: Clean up scaffold artifacts** (AC: prerequisite)
  - [ ] Remove `apps/web/src/app/api/hello/route.ts` (Nx boilerplate, not needed)
  - [ ] Update `apps/web/src/app/layout.tsx` metadata (title, description)
  - [ ] Update existing test file `apps/web/specs/index.spec.tsx` or replace with a smoke test for the new page

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

Do NOT create Controls.tsx, SpeedSlider.tsx, or useSimulationLoop.ts yet — those belong to stories 3.3 and 3.5. Keep the component surface minimal for this story.

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

### Debug Log References

### Completion Notes List

### File List

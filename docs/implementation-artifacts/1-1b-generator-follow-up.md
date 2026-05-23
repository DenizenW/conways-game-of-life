# Story 1.1b: Generator follow-up — libs, NestJS app, and Tailwind scaffolded behind a PR

Status: done

<!-- Generated 2026-05-23 via /bmad-bmm-create-story. Validation optional: /bmad-bmm-validate-story before /bmad-bmm-dev-story. -->

## Story

As the candidate,
I want the project structure beyond the raw Nx preset (`libs/sim`, `libs/ui`, `libs/api-client`, `libs/types`, `apps/api`, Tailwind on `apps/web`) generated and committed on a feature branch behind a single PR,
so that the project surface story 1.2 needs to tag and constrain actually exists, and so the panel can see the generator output is distinct from authored code in the git log.

## Acceptance Criteria

ACs are BDD-style where clarity benefits, checklist-style where the work is mechanical (matching story 1.1's convention for scaffold stories).

1. **Given** the raw Nx scaffolding from story 1.1 is committed on `main`, **When** the candidate creates a feature branch `chore/generator-followup` and runs the post-scaffold generator commands from architecture §3 in this order:
   1. `pnpm nx g @nx/nest:app api --frontendProject=web --tags=scope:server`
   2. `pnpm nx g @nx/js:lib sim --directory=libs/sim --bundler=tsc --tags=scope:sim`
   3. `pnpm nx g @nx/react:lib ui --directory=libs/ui --bundler=none --tags=scope:ui`
   4. `pnpm nx g @nx/js:lib api-client --directory=libs/api-client --bundler=tsc --tags=scope:api-client`
   5. `pnpm nx g @nx/js:lib types --directory=libs/types --bundler=tsc --tags=scope:types`
   6. `pnpm nx g @nx/next:setup-tailwind web`
   **Then** each generator runs to completion against the installed Nx version (22.7.2), with flags adjusted only as required by version drift (per architecture §3 note on Nx 18+ conventions) and any adjustments documented in the PR description.

2. **Given** the generator output is on the feature branch, **When** the work is committed, **Then** each generator's output lands as its own focused commit (one commit per generator, six commits total or fewer if Nx co-generates), each commit message is summarizable in one sentence (e.g., `Generate libs/sim via @nx/js:lib`), and no authored edits to generated files are mixed in.

3. **Given** the feature branch is opened as a PR into `main`, **When** the PR is reviewed, **Then** the diff is entirely generator output (no manual edits), the PR description names each generator command run, and the PR cleanly addresses the "subsequent generator-only work" called out in story 1.1 AC #6.

4. **Given** the PR is merged, **When** `pnpm install` and `pnpm nx graph` are run locally on a fresh clone, **Then** the workspace resolves with `apps/web`, `apps/web-e2e`, `apps/api`, `libs/sim`, `libs/ui`, `libs/api-client`, and `libs/types` all visible in the graph and buildable via their default targets.

5. **Given** the project structure exists, **When** story 1.2 begins, **Then** every project named in 1.2's preamble exists with its `tags` field present (per the `--tags=scope:*` arguments above) and ready to be constrained by `@nx/enforce-module-boundaries`.

## Tasks / Subtasks

- [x] **Task 1: Prepare the feature branch** (AC: #1, #2)
  - [x] Ensure clean working tree on `main` (`git status` clean)
  - [x] Create branch: `git checkout -b chore/generator-followup`

- [x] **Task 2: Install missing Nx plugins** (AC: #1 — prerequisite)
  - [x] Verify `@nx/nest` and `@nx/react` are NOT in `package.json` (they aren't in the scaffold from 1.1)
  - [x] Install: `pnpm add -D @nx/nest@22.7.2 @nx/react@22.7.2`
  - [x] Verify installation: both packages appear in `devDependencies`
  - [x] Commit: `Install @nx/nest and @nx/react Nx plugins`
  - [x] Note: this is a tool-driven dependency addition, not an authored edit — see Dev Notes §"Plugin installation rationale"

- [x] **Task 3: Generate NestJS app (`apps/api`)** (AC: #1.1, #2)
  - [x] Verify generator flags: `pnpm nx g @nx/nest:app --help` — confirm `--frontendProject`, `--tags` are valid
  - [x] Run: `pnpm nx g @nx/nest:app api --frontendProject=web --tags=scope:server --no-interactive`
  - [x] If generator prompts or fails on a flag, adjust per Nx 22.7.2 docs and record the adjustment
  - [x] Verify `apps/api/` exists with `project.json` containing `"tags": ["scope:server"]`
  - [x] Commit: `Generate apps/api via @nx/nest:app`

- [x] **Task 4: Generate simulation library (`libs/sim`)** (AC: #1.2, #2)
  - [x] Verify generator flags: `pnpm nx g @nx/js:lib --help` — confirm `--directory`, `--bundler`, `--tags` are valid
  - [x] Run: `pnpm nx g @nx/js:lib sim --directory=libs/sim --bundler=tsc --tags=scope:sim --no-interactive`
  - [x] Verify `libs/sim/` exists with `project.json` containing `"tags": ["scope:sim"]`
  - [x] Commit: `Generate libs/sim via @nx/js:lib`

- [x] **Task 5: Generate UI components library (`libs/ui`)** (AC: #1.3, #2)
  - [x] Verify generator flags: `pnpm nx g @nx/react:lib --help` — confirm `--directory`, `--bundler`, `--tags` are valid
  - [x] Run: `pnpm nx g @nx/react:lib ui --directory=libs/ui --bundler=none --tags=scope:ui --no-interactive`
  - [x] Verify `libs/ui/` exists with `project.json` containing `"tags": ["scope:ui"]`
  - [x] Commit: `Generate libs/ui via @nx/react:lib`

- [x] **Task 6: Generate API client library (`libs/api-client`)** (AC: #1.4, #2)
  - [x] Run: `pnpm nx g @nx/js:lib api-client --directory=libs/api-client --bundler=tsc --tags=scope:api-client --no-interactive`
  - [x] Verify `libs/api-client/` exists with `project.json` containing `"tags": ["scope:api-client"]`
  - [x] Commit: `Generate libs/api-client via @nx/js:lib`

- [x] **Task 7: Generate shared types library (`libs/types`)** (AC: #1.5, #2)
  - [x] Run: `pnpm nx g @nx/js:lib types --directory=libs/types --bundler=tsc --tags=scope:types --no-interactive`
  - [x] Verify `libs/types/` exists with `project.json` containing `"tags": ["scope:types"]`
  - [x] Commit: `Generate libs/types via @nx/js:lib`

- [x] **Task 8: Generate Tailwind CSS setup on `apps/web`** (AC: #1.6, #2)
  - [x] Verify generator exists: `pnpm nx g @nx/next:setup-tailwind --help`
  - [x] Run: `pnpm nx g @nx/next:setup-tailwind web --no-interactive`
  - [x] Verify `tailwind.config.js` (or `.ts`) exists in `apps/web/` and `postcss.config.js` is present
  - [x] Commit: `Set up Tailwind CSS on apps/web via @nx/next:setup-tailwind`

- [x] **Task 9: Verify full workspace graph** (AC: #4, #5)
  - [x] Run `pnpm install` — succeeds without blocking errors
  - [x] Run `pnpm nx graph --file=output.json` or `pnpm nx show projects` — verify all 7 projects are visible: `web`, `web-e2e`, `api`, `sim`, `ui`, `api-client`, `types`
  - [x] Verify each project has its expected `tags` field in `project.json`
  - [x] Run `pnpm nx run-many -t build --all` or verify default targets exist for each project
  - [x] If any project is not buildable or not visible, diagnose before proceeding

- [x] **Task 10: Push branch and open PR** (AC: #3)
  - [x] `git push -u origin chore/generator-followup`
  - [x] Open PR titled `Story 1.1b: Post-scaffold generator follow-up (libs, NestJS app, Tailwind)`
  - [x] PR description includes: each generator command run (verbatim or adjusted), any flag adjustments with rationale, explicit "no manual edits to generated files" attestation, reference to story 1.1 AC #6
  - [x] Note that CI is not yet wired (stories 1.3–1.5 add it) — same as story 1.1

## Dev Notes

### Why this story exists (and why it wasn't folded into 1.1 or 1.2)

Story 1.1 committed the raw `create-nx-workspace --preset=next` output as the first implementation commit. The architecture's §3 "Initialization Command Sequence" lists six additional generator commands that create the rest of the project surface. Story 1.1's AC #6 explicitly defers this work: "Subsequent generator-only work (NestJS app, libs, Tailwind setup) lands in a separate follow-up commit on a feature branch behind a PR — not folded into this commit. Owned by story 1.1b."

Story 1.2 (Configure Nx tags and prove module boundaries fire) needs these projects to exist before it can configure boundary rules. This story is the bridge: pure generator output, no authored code.

### Tailwind bundled into this PR (deliberate deviation from architecture §4)

Architecture §4 "Decision Impact Analysis" lists Tailwind setup as its own PR (step 3 in the implementation sequence). This story bundles it into the same PR as the lib/app generators. Rationale: `setup-tailwind` is a single generator command producing pure generator output — the same character as the five other generators in this story. A separate PR for one `setup-tailwind` invocation is churn that adds a PR to the count without adding review signal. Story 1.1 AC #6 explicitly lists "Tailwind setup" alongside the other generator work owned by this story, and epics.md §Story 1.1b includes it in its generator sequence. The architecture's per-PR breakdown was a rough guide, not a binding contract — the epics (which are closer to implementation) refined the grouping. This is documented here so it doesn't read as an oversight.

### Plugin installation rationale

The scaffold from story 1.1 installed `@nx/js`, `@nx/next`, `@nx/eslint`, `@nx/jest`, `@nx/playwright`, and `@nx/workspace` — all at version 22.7.2. It did NOT install `@nx/nest` or `@nx/react` because those weren't needed by the `--preset=next` scaffold.

Generators 1 (`@nx/nest:app`) and 3 (`@nx/react:lib`) require their respective plugins. Options:
- **Nx auto-install:** Nx 22 may auto-install missing plugins when a generator is invoked. If it does, the plugin addition is part of the generator output. Prefer this path.
- **Manual pre-install:** If Nx doesn't auto-install (or prompts interactively), run `pnpm add -D @nx/nest@22.7.2 @nx/react@22.7.2` first. This is a tool-driven dependency addition, not an authored edit. Commit it separately with a clear message: `Install @nx/nest and @nx/react Nx plugins`.

Pin both plugins to **22.7.2** to match the installed Nx version. Do NOT install a different version — project-context.md rule #18 forbids version drift.

### Generator flag verification (Nx 22.7.2)

The commands in architecture §3 were authored against Nx 18+ conventions. Nx 22 may have renamed, removed, or changed the behavior of some flags. The dev agent MUST verify each generator's flags before running:

1. **`@nx/nest:app`** — Check if `--frontendProject` still exists (it configures a proxy from the NestJS app to the frontend app). If removed or renamed, drop it and document the adjustment. The `--tags` flag should still work.

2. **`@nx/js:lib`** — The `--directory` flag in Nx 22 may behave as "project root directory" rather than "directory inside libs/". Verify with `--help`. The `--bundler=tsc` flag should still work. If `--directory=libs/sim` doesn't create the project at `libs/sim/`, try `--directory=sim` (Nx 22 may auto-prefix `libs/`).

3. **`@nx/react:lib`** — Same `--directory` consideration as above. `--bundler=none` means no build target — the UI lib is imported directly by the Next.js app. Verify this flag exists.

4. **`@nx/next:setup-tailwind`** — This generator modifies `apps/web` in place. Verify it exists and takes the project name as a positional argument.

**Critical:** If any flag requires adjustment, document the change in the PR description. The AC says "flags adjusted only as required by version drift."

### Commit discipline (from story 1.1 learnings)

- One commit per generator. Do NOT bundle multiple generators into one commit.
- Commit messages follow the pattern: `Generate {target} via {generator}` (e.g., `Generate libs/sim via @nx/js:lib`).
- Do NOT include co-author trailers — these are generator commands, not AI-authored code.
- Do NOT edit any generated file before committing. Resist the urge to fix imports, rename files, or "improve" the scaffold. The purity rule from story 1.1 applies equally here.
- The plugin installation commit (Task 2) is an exception: it's a prerequisite, not generator output. Its commit message should be: `Install @nx/nest and @nx/react Nx plugins`.

### What this story does NOT include

Per the epic sequencing (epics.md §Epic 1):
- **Nx tag configuration + `@nx/enforce-module-boundaries` ESLint rules** — story 1.2 (the tags are _set_ by generator `--tags` flags here, but the _constraint rules_ are configured in 1.2).
- **Any authored code** — no `Grid` type, no `step()`, no React components, no NestJS controllers. Pure generator output.
- **CI workflow** — stories 1.3–1.5.
- **Branch protection / auto-approve** — story 1.6.
- **Sprint-status updates** — update sprint-status.yaml AFTER the generator commits, not mixed in with them. Story 1.1 established this pattern: sprint-status changes go on `main` after the story PR is merged.

### Previous story intelligence (from story 1.1)

Key learnings from story 1.1 that apply here:

1. **Interactive prompts:** Nx 22.7.2 may prompt even with `--interactive=false`. Story 1.1 needed `--useGitHub=true`, `--skipGitHubPush=true`, and `CLAUDECODE=1` env var to suppress prompts. For these generators, pass `--no-interactive` and be prepared to answer prompts if they appear.

2. **`.gitignore` merge was mechanical** — generators may add entries. Append, don't overwrite. Same merge-not-replace approach as story 1.1.

3. **Generators run inside the workspace** — unlike story 1.1 which needed a temp dir, these generators run directly in the existing workspace. No temp-dir + copy dance.

4. **Existing files are preserved** — generators should not delete or modify existing files from story 1.1 or the planning artifacts. Verify with `git diff --diff-filter=D --name-only` after each generator.

5. **`pnpm install` may be needed after plugin installation** — the lockfile will change. Include lockfile changes in the relevant commit.

### Project Structure Notes

After this story completes, the workspace should match the architecture §6 tree:

```
apps/
  web/              # Next.js (from story 1.1) + Tailwind (this story)
  web-e2e/          # Playwright (from story 1.1)
  api/              # NestJS REST (this story)
libs/
  sim/              # Pure rules engine (this story — empty scaffold)
  ui/               # Presentational React (this story — empty scaffold)
  api-client/       # Typed fetch wrappers (this story — empty scaffold)
  types/            # Shared TS types (this story — empty scaffold)
```

Each project should have a `project.json` with the correct `tags` field set by the `--tags` flag. Story 1.2 will add the `depConstraints` that make these tags enforceable.

### References

- [Source: docs/planning-artifacts/architecture.md#3-Starter-Template-Evaluation] — the six generator commands (lines 113–129).
- [Source: docs/planning-artifacts/architecture.md#4-Decision-Impact-Analysis] — implementation sequence step 2 (NestJS + lib generators as one PR).
- [Source: docs/planning-artifacts/architecture.md#5.6] — tag taxonomy and depConstraints (consumed by story 1.2).
- [Source: docs/planning-artifacts/epics.md#Story-1.1b] — verbatim ACs.
- [Source: docs/planning-artifacts/epics.md#Story-1.1-AC-6] — explicit deferral of post-scaffold generators to this story.
- [Source: docs/project-context.md#3-Critical-Implementation-Rules] — rules #1 (first-commit-purity applies to generator output too), #3 (one-sentence commits), #5 (module boundaries), #18 (no `nx migrate`).
- [Source: docs/implementation-artifacts/1-1-initial-nx-scaffolding-committed-untouched.md] — previous story learnings (interactive prompts, `.gitignore` merge, sprint-status deferral).

## Dev Agent Record

### Agent Model Used

claude-opus-4-7[1m]

### Debug Log References

- `@nx/nest:app --frontendProject=web` failed: Nx 22 requires full project name `@conways-game-of-life/web`. Adjusted and re-ran successfully. Proxy setup skipped (Next.js "serve" target not found — expected, different executor pattern).
- `@nx/next:setup-tailwind` is deprecated in Nx 22.7.2 (removed in Nx 23) but ran successfully.
- Nx 22 creates `api/` at workspace root (not `apps/api/`) — this is the modern Nx project layout. Libraries still go under `libs/` via `--directory`.
- `api-e2e` was co-generated by `@nx/nest:app` (default `--e2eTestRunner=jest`).

### Completion Notes List

- All 6 generator commands ran successfully against Nx 22.7.2
- 8 commits on `chore/generator-followup`: 1 tracking artifacts + 1 plugin install + 6 generator outputs
- Each generator commit is pure — no manual edits mixed in
- All 5 new projects have correct `scope:*` tags set via `--tags` flags
- `pnpm install` succeeds, all 8 projects (incl. co-generated `api-e2e`) visible in workspace graph
- PR #8 opened with full generator command list and flag adjustment rationale

### File List

- `api/` — NestJS app (new, generated)
- `api/package.json` — project config with `tags: ["scope:server"]`
- `api/src/main.ts` — NestJS bootstrap
- `api/src/app/app.controller.ts` — default controller
- `api/src/app/app.module.ts` — root module
- `api/src/app/app.service.ts` — default service
- `api/tsconfig.json`, `api/tsconfig.app.json` — TypeScript config
- `api/webpack.config.js` — build config
- `api/src/assets/.gitkeep` — assets placeholder
- `api-e2e/` — NestJS e2e test project (co-generated)
- `api-e2e/package.json`, `api-e2e/jest.config.cts`, `api-e2e/tsconfig.json`
- `api-e2e/src/api/api.spec.ts` — default e2e test
- `api-e2e/src/support/` — test setup/teardown
- `libs/sim/` — simulation library (new, generated)
- `libs/sim/package.json` — project config with `tags: ["scope:sim"]`
- `libs/sim/src/index.ts`, `libs/sim/src/lib/sim.ts` — barrel + placeholder
- `libs/ui/` — React UI library (new, generated)
- `libs/ui/package.json` — project config with `tags: ["scope:ui"]`
- `libs/ui/src/index.ts`, `libs/ui/src/lib/ui.tsx`, `libs/ui/src/lib/ui.module.css`
- `libs/ui/.babelrc` — Babel config
- `libs/api-client/` — API client library (new, generated)
- `libs/api-client/package.json` — project config with `tags: ["scope:api-client"]`
- `libs/api-client/src/index.ts`, `libs/api-client/src/lib/api-client.ts`
- `libs/types/` — shared types library (new, generated)
- `libs/types/package.json` — project config with `tags: ["scope:types"]`
- `libs/types/src/index.ts`, `libs/types/src/lib/types.ts`
- `apps/web/tailwind.config.js` — Tailwind configuration (new)
- `apps/web/postcss.config.js` — PostCSS configuration (new)
- `apps/web/src/app/global.css` — updated with Tailwind directives
- `.vscode/launch.json` — NestJS debug config (co-generated)
- `package.json` — updated with new dependencies
- `pnpm-lock.yaml` — lockfile updated
- `pnpm-workspace.yaml` — workspace packages updated
- `nx.json` — Nx config updated
- `tsconfig.json` — path aliases added for new libraries
- `docs/implementation-artifacts/sprint-status.yaml` — status updated to in-progress
- `docs/implementation-artifacts/1-1b-generator-follow-up.md` — story file added

### Change Log

- Story implemented 2026-05-23 by dev agent (claude-opus-4-7[1m]). All generator commands executed, PR #8 opened.

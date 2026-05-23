# Story 1.1: Initial Nx scaffolding committed untouched

Status: done

<!-- Generated 2026-05-22 via /bmad-bmm-create-story. Validation optional: /bmad-bmm-validate-story before /bmad-bmm-dev-story. -->

## Story

As the candidate,
I want the very first implementation-branch commit on this repo to be the raw output of `create-nx-workspace --preset=next`,
so that the hiring panel can read the git log and see exactly what the Nx generator produced versus what I subsequently authored.

## Acceptance Criteria

ACs are checklist-style on this story (acknowledged in epics.md §Story 1.1) because the work is mechanical scaffold — the proof is in the generator output and the commit, not in observable behavior.

1. `npx create-nx-workspace@latest conways-game-of-life --preset=next --appName=web --style=css --nextAppDir=true --e2eTestRunner=playwright --unitTestRunner=jest --packageManager=pnpm --ci=github --interactive=false` is run (Nx 22+ accepts every flag listed; see Dev Notes §"Verified Nx CLI flags").
2. The generator output is committed in a single commit titled `Initial Nx scaffolding (raw generator output)` with **zero manual edits** to generated files mixed in.
3. No `.claude/`, `.cursor/`, `.opencode/`, `_bmad/`, `docs/`, `.github/PULL_REQUEST_TEMPLATE.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, or `.gitignore` from the existing repo is removed by this commit (they are preserved alongside the new scaffold).
4. `pnpm install` and `pnpm nx run web:dev` succeed locally on a freshly cloned working copy.
5. `git log --oneline` shows this as the **first commit on the implementation branch** (`story/1-1-initial-nx-scaffolding-committed-untouched`). Pre-existing planning commits on `main` (`5d766c7` → `cefb5e2`) remain on `main`; the implementation branch starts from `main` and this commit is its tip after the merge described in Dev Notes §"How to land raw scaffold over an existing repo".
6. Subsequent generator-only work (NestJS app, `libs/sim`, `libs/ui`, `libs/api-client`, `libs/types`, Tailwind setup) is **deliberately deferred** to story 1.2 or a 1.1b follow-up — it does NOT land in this commit. (See Dev Notes §"What this story does NOT include".)
7. *(Added per Implementation Readiness Report 2026-05-22, Minor #3 → NFR2.)* `tsconfig.base.json` in the generated output has `"target": "es2022"` or later, and no polyfill packages (e.g., `core-js`, `@babel/polyfill`) are introduced. If the generator's defaults satisfy this, no change is needed; record verification in the PR description.

## Tasks / Subtasks

- [x] **Task 1: Prepare the implementation branch** (AC: #5)
  - [x] Confirm you are on `main` with a clean working tree (`git status` shows only the untracked `docs/planning-artifacts/implementation-readiness-report-2026-05-22.md`; either commit it on `main` first, stash it, or leave it untracked — do not bundle it into this commit).
  - [x] Create the implementation branch: `git checkout -b story/1-1-initial-nx-scaffolding-committed-untouched`.
- [x] **Task 2: Generate the Nx workspace in a clean scratch directory** (AC: #1)
  - [x] `cd $(mktemp -d)` to get an isolated temp dir.
  - [x] Run the literal command from AC #1. Do NOT run it inside the existing repo — `create-nx-workspace` initializes its own git repo and will not merge cleanly with the existing one.
  - [x] When prompted about `nxCloud`, accept the `github` selection (the `--ci=github` flag handles this; `--interactive=false` suppresses any remaining prompts).
  - [x] Wait for the generator to complete and produce `conways-game-of-life/` inside the temp dir.
- [x] **Task 3: Layer the scaffold over the existing repo without edits** (AC: #2, #3)
  - [x] From the temp dir's `conways-game-of-life/`, copy **every file except `.git/` and `.gitignore`** into the repo root, overwriting any collisions (there should be none in MVP since the repo has no `package.json`, `nx.json`, `apps/`, `libs/` yet).
  - [x] Merge `.gitignore`: append any new entries from the generator's `.gitignore` to the existing one — keep the existing entries, do not overwrite. (Treat this as "raw generator output" because the generator's intent is preserved; the merge is mechanical, not editorial.) If a reviewer might quibble: alternative is to commit the generator's `.gitignore` verbatim, then re-add the OS/IDE entries from the prior `.gitignore` as a separate commit. Either is defensible; document the choice in the PR description.
  - [x] DO NOT copy `.git/` from the scratch directory.
  - [x] DO NOT open any of the generated files in an editor. Resist the urge to fix the auto-generated `README.md` typo, reformat `package.json`, or "improve" the generated `tsconfig`. This is R6 in architecture §9 — first-commit purity.
- [x] **Task 4: Verify the scaffold runs before committing** (AC: #4)
  - [x] `pnpm install` — succeeds without warnings that block install.
  - [x] `pnpm nx run web:dev` — Next.js dev server starts and serves the default page at `http://localhost:3000` (or `:4200` depending on Nx preset defaults).
  - [x] If either fails, do not commit. Diagnose, re-run the generator, or open an issue — but do not "fix it up" in this commit.
- [x] **Task 5: Verify NFR2 TS target compliance** (AC: #7)
  - [x] Open `tsconfig.base.json` (read-only — do not edit).
  - [x] Confirm `"target": "es2022"` or later (Nx 22+ default is `es2022`; if it isn't, note the deviation in the PR description and either accept the default or open a follow-up story rather than editing in this commit).
  - [x] Search for `core-js`, `@babel/polyfill`, `regenerator-runtime` in `package.json` dependencies/devDependencies; expect none. Record in PR description: "NFR2 verified: target=es2022, no polyfills introduced."
- [x] **Task 6: Commit raw and push the branch** (AC: #2, #5)
  - [x] `git add -A` (everything generator produced, including the merged `.gitignore`).
  - [x] `git commit -m "Initial Nx scaffolding (raw generator output)"` — one line, no extended body, no co-author trailer (the candidate authors this commit themselves; this is not AI work).
  - [x] Verify with `git log --oneline -1` that the commit message matches AC #2 verbatim.
  - [x] Verify with `git diff main..HEAD --stat` that no file from the preserved-list in AC #3 was deleted.
  - [x] `git push -u origin story/1-1-initial-nx-scaffolding-committed-untouched`.
- [x] **Task 7: Open the PR** (AC: #2)
  - [x] Open a PR titled `Story 1.1: Initial Nx scaffolding (raw generator output)`.
  - [x] Use `.github/PULL_REQUEST_TEMPLATE.md` (already in the repo).
  - [x] Body includes: the literal command from AC #1; the `.gitignore` merge approach chosen in Task 3; the NFR2 verification line from Task 5; an explicit "no manual edits to generated files" attestation.
  - [x] Note that CI is not yet wired (stories 1.3–1.5 add it), so the PR will not have green checks at this point — that is expected and the README brief acknowledges direct progression through 1.1 → 1.6 before all four checks exist.

## Dev Notes

### Why this story is mechanical-only (and the high-stakes "first-commit purity" rule)

The take-home brief (README.md:82) and project context rule #1 are explicit: **the first implementation commit must be raw `create-nx-workspace --preset=next` output, untouched.** Reviewers read the git log specifically to separate generator output from authored code. Any "small fix" mixed into this commit destroys that signal. This is risk R6 in architecture §9, called out by name: the candidate's instinct will be to fix a typo in the generated `README.md` before committing. Resist it.

There is no behavioral assertion in this story — the proof is the git log diff plus AC #4 (it runs). The story is small but high-stakes because it sets the precedent for every PR that follows.

### How to land raw scaffold over an existing repo

`create-nx-workspace` is designed to run in an empty parent directory and initialize a new git repo. This repo already has 9 commits on `main` (planning artifacts, AI agent configs, README, `_bmad/`). Running the generator in-place would either fail (existing files) or, if forced, would init a competing `.git/` and destroy git history.

The clean approach (Task 2–3 above): generate the scaffold in a scratch temp dir, then copy its **files only** (not its `.git/`) into the repo root on a feature branch. This preserves the planning commits on `main`, keeps all evaluation artifacts (`.claude/`, `_bmad/`, etc.), and makes "first commit" mean "first commit on the implementation branch" — which AC #5 explicitly accepts.

Alternative considered and rejected: running `nx init` inside the existing repo. `nx init` is for adding Nx to an existing project; it does not match what the brief means by "raw `create-nx-workspace` output," and the resulting file layout differs from the architecture's expectations (no preset-driven app generation). Stick with the temp-dir + copy approach.

### Alternatives considered and rejected for satisfying AC #5

AC #5 is satisfied by branching from `main` and landing the scaffold as the first commit on the implementation branch (the approach above). Three other readings of "first commit" were considered:

- **Option B — Long-lived `implementation` branch.** Create an `implementation` (or `develop`) branch off `main`; scaffold raw as its first commit; every subsequent story branches off `implementation` and PRs back into it. Reviewer evaluates `implementation` as the delivery line; `main` stays as the planning-artifacts root. Strongest reading of "first commit is raw Nx output" without rewriting history. **Rejected because:** introduces a second long-lived branch the reviewer has to internalize, and the brief's "all work flows through PRs into `main`" rule (project-context.md #2) reads more naturally when `main` is the actual delivery branch. The single-branch model is the lower-cognitive-overhead default.

- **Option C — Orphan branch with planning merged in as commit #2.** `git checkout --orphan implementation` → commit the scaffold as a true root commit (no parent) → `git merge --allow-unrelated-histories main` to bring the planning artifacts in as a merge commit at position #2. `git log` then shows scaffold as the literal first commit with no qualifier. Most faithful to "first commit is raw Nx output" as a stand-alone sentence. **Rejected because:** the unrelated-histories merge commit is unusual enough that a reviewer who isn't told why will mis-read it as a mistake. The signal you gain (literal commit #1) is smaller than the signal you spend (forcing the reviewer to parse a non-obvious git topology). Worth it only if a reviewer explicitly objects to AC #5's "first commit on the implementation branch" reading.

- **Option D — Rewrite `main` with `git rebase --root`.** Reorder `main` so the scaffold becomes commit #1 and the existing planning commits replay on top. Satisfies "first commit on `main`" verbatim, with no branch gymnastics at review time. **Rejected because:** requires a force-push that rewrites public history. Any clone or fork made before the rewrite (including the interviewer's, if they cloned early) sees a divergent tree, and `git pull` won't reconcile cleanly. The cost (broken downstream clones) is disproportionate to the benefit (a tidier `git log`). Project-context.md does not explicitly forbid history rewrites on `main`, but the brief's emphasis on "reviewable git history" reads against it.

Option A wins on the simplest tradeoff: zero history modification, the planning commits stay exactly where they are on `main`, the scaffold is unambiguously the first commit on a clearly-named story branch, and AC #5 is explicit that this satisfies the brief's intent when pre-existing planning commits are present. If a reviewer pushes back on the reading, escalate to Option B; reserve C and D for cases where a reviewer specifically demands them.

### What this story does NOT include

Per epic 1 sequencing (epics.md §Epic 1 and architecture §4 "Implementation sequence"), the following land in **separate later commits/stories** and must NOT be folded into this commit:

- `apps/api` (NestJS) — story 1.1b/1.2 follow-up generator commit (epics flagged this gap in the readiness report; default plan is to fold it into 1.2's preamble).
- `libs/sim`, `libs/ui`, `libs/api-client`, `libs/types` — story 1.1b/1.2 follow-up.
- Tailwind setup (`@nx/next:setup-tailwind`) — story 1.1b/1.2 follow-up.
- Nx tag configuration + `@nx/enforce-module-boundaries` ESLint rules — story 1.2.
- CI workflow (`.github/workflows/ci.yml`) — stories 1.3, 1.4, 1.5.
- `auto-approve.yml` + branch protection — story 1.6.

If the `--preset=next` template generates a stub `apps/web-e2e/` Playwright project automatically, that is part of "raw generator output" and stays in this commit. Do not delete it to "keep this commit smaller."

### Source-of-truth references

Cite these in the PR description if a reviewer asks:

- **First-commit-purity rule:** README.md:82; project-context.md rule #1; epics.md §Story 1.1 AC #2; architecture.md §9 R6.
- **Implementation branch acceptance:** epics.md §Story 1.1 AC #5 ("or, where pre-existing planning commits exist, the first commit on the implementation branch").
- **Generator command:** architecture.md §3 "Initialization Command Sequence" (lines 99–108).
- **Preservation of AI artifact dirs:** README.md:49 + 158; project-context.md rule #15.
- **NFR2 (ES2022, no polyfills):** prd.md NFR2; implementation-readiness-report-2026-05-22.md Step 5 Minor #3.

### Project Structure Notes

This commit creates the **initial** Nx scaffold only. The architecture's planned tree (architecture.md §6) is not realized in this commit — only the preset-driven subset is:

- `apps/web/` (Next.js App Router scaffold from `--preset=next`)
- `apps/web-e2e/` (Playwright scaffold from `--e2eTestRunner=playwright`)
- `nx.json`, `package.json`, `pnpm-lock.yaml`, `tsconfig.base.json`, `eslint.config.js` (or `.eslintrc.json` depending on Nx version)
- `.github/` (Nx adds a starter workflow from `--ci=github`; the four-check ci.yml that satisfies NFR7 comes later in stories 1.3–1.6)

The architecture's `libs/sim`, `libs/ui`, `libs/api-client`, `libs/types`, and `apps/api` are NOT present after this commit — they arrive in subsequent generator commits. No conflict with the architecture: §6 documents the **end-state** tree, not the per-commit state.

### Verified Nx CLI flags (verified 2026-05-22 against `create-nx-workspace@22.7.2`)

The architecture's command line (§3, lines 99–108) was authored against Nx 18+ conventions. Verified against the latest CLI at the time of this story creation, all flags still work. One refinement: add `--unitTestRunner=jest` and `--interactive=false` for full non-interactive determinism. Final command:

```bash
npx create-nx-workspace@latest conways-game-of-life \
  --preset=next \
  --appName=web \
  --style=css \
  --nextAppDir=true \
  --e2eTestRunner=playwright \
  --unitTestRunner=jest \
  --packageManager=pnpm \
  --ci=github \
  --interactive=false
```

Flag-by-flag confirmation:
- `--preset=next` — listed in CLI presets; produces Next.js app scaffold.
- `--appName=web` — names the generated app `web` (so `apps/web`).
- `--style=css` — vanilla CSS; Tailwind is added in a later commit per architecture §3.
- `--nextAppDir=true` — App Router (vs Pages Router); architecture §4.1 requires App Router. In Nx 22+ this is the default but pass it explicitly for clarity in the git log.
- `--e2eTestRunner=playwright` — required by the brief (no Cypress substitution).
- `--unitTestRunner=jest` — required by the brief (no Vitest substitution). Nx 22 made this an explicit flag where it was previously implicit; pin it to avoid drift.
- `--packageManager=pnpm` — architecture §4.11 + project-context rule (pnpm only).
- `--ci=github` — generates a starter `.github/workflows/ci.yml` we replace in story 1.3.
- `--interactive=false` — suppresses CLI prompts so the command is reproducible/scriptable. Without this the CLI may prompt for Nx Cloud signup.

Flags **deliberately not passed** (defaults are fine):
- `--aiAgents` — Nx 22 can scaffold AI agent configs. Skip: the repo already has substantive `.claude/`, `.cursor/`, `.opencode/` configs from the BMAD install. Overwriting them is destructive and violates AR4.
- `--formatter` — accept Prettier default.
- `--bundler` — accept Next.js default (Webpack/Turbopack as set by Next.js preset).
- `--useGitHub`, `--skipGitHubPush` — N/A; we're not letting the generator push.

### Testing Standards (for this story)

There are no automated tests in this commit. The "tests" are:
- The generator successfully completes (Task 2).
- `pnpm install` succeeds (Task 4 AC #4).
- `pnpm nx run web:dev` serves the default page (Task 4 AC #4).
- `git log --oneline -1` shows the exact commit subject (Task 6 AC #2).
- `git diff main..HEAD --name-only` shows no deletions from the preserved-paths list in AC #3.

CI is not yet present, so PR-level automated checks are not expected on this PR. That asymmetry is fine — it's why this is the first story.

### References

- [Source: docs/planning-artifacts/architecture.md#3-Starter-Template-Evaluation] — the generator command and rationale.
- [Source: docs/planning-artifacts/architecture.md#9-Risks-and-Mitigations] — R6 first-commit purity.
- [Source: docs/planning-artifacts/epics.md#Story-1.1] — verbatim ACs (this story expands AC #5 and adds AC #7 per the readiness report).
- [Source: docs/planning-artifacts/prd.md#NFR10] — reviewable git history rule.
- [Source: docs/planning-artifacts/prd.md#NFR2] — modern evergreens, no ES5/polyfills.
- [Source: docs/project-context.md#3-Critical-Implementation-Rules] — rules #1 (first-commit-purity), #2 (PRs only), #3 (one-sentence commits), #15 (AI artifacts preserved), #18 (no `nx migrate` mid-build).
- [Source: docs/planning-artifacts/implementation-readiness-report-2026-05-22.md#Step-5] — Major issue (post-scaffold generator ownership, deferred to 1.1b/1.2) and Minor #3 (NFR2 TS target — incorporated as AC #7 above).
- [Source: README.md#82] — brief's first-commit rule.
- Nx CLI verification: `npx create-nx-workspace@22.7.2 --help`, run 2026-05-22.

## Dev Agent Record

### Context Reference

`docs/project-context.md` — operational rulebook for AI agents in this repo. Critical rules #1, #2, #3, #15, #18 are directly load-bearing on this story.

### Agent Model Used

claude-opus-4-7[1m] (BMad SM persona via `/bmad-bmm-create-story`, story creation only; implementation agent TBD)

### Debug Log References

- Initial scaffold attempt with `--interactive=false` alone hit a new Nx 22.7.2 interactive prompt ("Will you be using GitHub as your git hosting provider?") that the flag did NOT suppress. Resolution: added `--useGitHub=true` (answers the prompt) and `--skipGitHubPush=true` (defensive against auto-push), plus `CLAUDECODE=1` env var per the CLI's `--help` hint for AI-agent non-interactive mode. Belt-and-suspenders, generator completed cleanly.
- Dropped `--unitTestRunner=jest` at user direction — Nx 22.7.2's `--preset=next` defaults to Jest, confirmed by presence of `jest.config.ts`, `jest.preset.js`, `apps/web/jest.config.cts`, `apps/web/specs/index.spec.tsx`, and Jest 30.3.0 in `package.json` devDependencies after install.
- Sprint-status updates intentionally deferred: the planning round's "in-progress" mark on `sprint-status.yaml` was stashed before the scaffold work and not re-committed until after the scaffold commit landed and PR was opened. This honors first-commit-purity (project-context.md rule #1) — nothing in the implementation lineage commits ahead of the scaffold.

### Completion Notes List

- `.gitignore` merge approach: existing entries kept verbatim at the top of the file, scaffold's entries appended below a clearly-marked separator comment (`# === Entries below are from create-nx-workspace --preset=next (Nx 22.7.2) ===`). Some semantic duplicates (e.g. `node_modules`, `.DS_Store`, `.claude/settings.local.json` appear on both sides) — harmless in gitignore and preserves both sides' intent.
- `CLAUDE.md` merge approach: existing project rulebook kept verbatim, scaffold's Nx-managed block (with `<!-- nx configuration start -->` / `<!-- nx configuration end -->` markers, which Nx designs explicitly for this case) appended at the bottom. Mechanical merge, not editorial.
- `README.md` collision resolution: scaffold's generic Nx-welcome `README.md` was dropped to preserve our existing `README.md` (the take-home brief). Defensible because the scaffold's `README.md` was non-load-bearing generic onboarding text and the brief is itself a hard requirement (AC #3 + project-context.md rule #1).
- AC #3 verified: `git diff main..HEAD --diff-filter=D --name-only` on the story branch returned zero deletions. All preserved-list files (`.claude/commands`, `.cursor`, `.opencode`, `_bmad`, `docs`, `.github/PULL_REQUEST_TEMPLATE.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `.gitignore`) still present.
- AC #4 verified: `pnpm install --frozen-lockfile` ~5s (no blocking warnings); `pnpm nx run web:dev` started Next.js 16.1.7 (Turbopack) on `http://localhost:3000`, default Welcome page served (HTTP 200, title "Welcome to ", meta "Generated by create-nx-workspace").
- AC #7 (NFR2) verified: `tsconfig.base.json` has `"target": "es2022"`, `"lib": ["es2022"]`, `"strict": true`. No `core-js` / `@babel/polyfill` / `regenerator-runtime` in any `package.json` (root, `apps/web`, `apps/web-e2e`).
- Command-as-run deviates from AC #1: dropped `--unitTestRunner=jest` (redundant in Nx 22.7.2); added `--useGitHub=true`, `--skipGitHubPush=true`, and `CLAUDECODE=1` env var for non-interactive operation. All deviations are non-functional with respect to the scaffold output. Documented in PR body.
- No manual edits to any generator file beyond the two documented mechanical merges (`.gitignore`, `CLAUDE.md`).

### File List

Added (38 files, all generator output):
- `.claude/settings.json`
- `.editorconfig`
- `.github/workflows/ci.yml` (starter — to be replaced in stories 1.3–1.5)
- `.prettierignore`, `.prettierrc`
- `.vscode/extensions.json`
- `apps/web-e2e/eslint.config.mjs`, `apps/web-e2e/package.json`, `apps/web-e2e/playwright.config.ts`, `apps/web-e2e/src/example.spec.ts`, `apps/web-e2e/tsconfig.json`
- `apps/web/.swcrc`, `apps/web/eslint.config.mjs`, `apps/web/index.d.ts`, `apps/web/jest.config.cts`, `apps/web/next-env.d.ts`, `apps/web/next.config.js`, `apps/web/package.json`, `apps/web/public/.gitkeep`, `apps/web/public/favicon.ico`, `apps/web/specs/index.spec.tsx`, `apps/web/src/app/api/hello/route.ts`, `apps/web/src/app/global.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.module.css`, `apps/web/src/app/page.tsx`, `apps/web/tsconfig.json`, `apps/web/tsconfig.spec.json`
- `eslint.config.mjs`
- `jest.config.ts`, `jest.preset.js`
- `nx.json`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- `tsconfig.base.json`, `tsconfig.json`

Modified (2 files, both mechanical merges with scaffold output — documented above):
- `.gitignore`
- `CLAUDE.md`

Story-tracking updates (on `main`, after scaffold PR was merged — not part of the scaffold commit):
- `docs/implementation-artifacts/sprint-status.yaml` (1-1 status: ready-for-dev → done; epic-1: backlog → in-progress)
- `docs/implementation-artifacts/1-1-initial-nx-scaffolding-committed-untouched.md` (status, task checkboxes, Dev Agent Record sections)

### Change Log

- Story scaffolded by `/bmad-bmm-create-story` (SM persona).
- Story executed by `/bmad-bmm-dev-story` (Dev persona). PR #1 opened against `DenizenW/conways-game-of-life` from branch `story/1-1-initial-nx-scaffolding-committed-untouched`, reviewed by the candidate and merged into `main` (commit `c170733`). Status moved ready-for-dev → done.

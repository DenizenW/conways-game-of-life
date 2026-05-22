# Story 1.1: Initial Nx scaffolding committed untouched

Status: ready-for-dev

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

- [ ] **Task 1: Prepare the implementation branch** (AC: #5)
  - [ ] Confirm you are on `main` with a clean working tree (`git status` shows only the untracked `docs/planning-artifacts/implementation-readiness-report-2026-05-22.md`; either commit it on `main` first, stash it, or leave it untracked — do not bundle it into this commit).
  - [ ] Create the implementation branch: `git checkout -b story/1-1-initial-nx-scaffolding-committed-untouched`.
- [ ] **Task 2: Generate the Nx workspace in a clean scratch directory** (AC: #1)
  - [ ] `cd $(mktemp -d)` to get an isolated temp dir.
  - [ ] Run the literal command from AC #1. Do NOT run it inside the existing repo — `create-nx-workspace` initializes its own git repo and will not merge cleanly with the existing one.
  - [ ] When prompted about `nxCloud`, accept the `github` selection (the `--ci=github` flag handles this; `--interactive=false` suppresses any remaining prompts).
  - [ ] Wait for the generator to complete and produce `conways-game-of-life/` inside the temp dir.
- [ ] **Task 3: Layer the scaffold over the existing repo without edits** (AC: #2, #3)
  - [ ] From the temp dir's `conways-game-of-life/`, copy **every file except `.git/` and `.gitignore`** into the repo root, overwriting any collisions (there should be none in MVP since the repo has no `package.json`, `nx.json`, `apps/`, `libs/` yet).
  - [ ] Merge `.gitignore`: append any new entries from the generator's `.gitignore` to the existing one — keep the existing entries, do not overwrite. (Treat this as "raw generator output" because the generator's intent is preserved; the merge is mechanical, not editorial.) If a reviewer might quibble: alternative is to commit the generator's `.gitignore` verbatim, then re-add the OS/IDE entries from the prior `.gitignore` as a separate commit. Either is defensible; document the choice in the PR description.
  - [ ] DO NOT copy `.git/` from the scratch directory.
  - [ ] DO NOT open any of the generated files in an editor. Resist the urge to fix the auto-generated `README.md` typo, reformat `package.json`, or "improve" the generated `tsconfig`. This is R6 in architecture §9 — first-commit purity.
- [ ] **Task 4: Verify the scaffold runs before committing** (AC: #4)
  - [ ] `pnpm install` — succeeds without warnings that block install.
  - [ ] `pnpm nx run web:dev` — Next.js dev server starts and serves the default page at `http://localhost:3000` (or `:4200` depending on Nx preset defaults).
  - [ ] If either fails, do not commit. Diagnose, re-run the generator, or open an issue — but do not "fix it up" in this commit.
- [ ] **Task 5: Verify NFR2 TS target compliance** (AC: #7)
  - [ ] Open `tsconfig.base.json` (read-only — do not edit).
  - [ ] Confirm `"target": "es2022"` or later (Nx 22+ default is `es2022`; if it isn't, note the deviation in the PR description and either accept the default or open a follow-up story rather than editing in this commit).
  - [ ] Search for `core-js`, `@babel/polyfill`, `regenerator-runtime` in `package.json` dependencies/devDependencies; expect none. Record in PR description: "NFR2 verified: target=es2022, no polyfills introduced."
- [ ] **Task 6: Commit raw and push the branch** (AC: #2, #5)
  - [ ] `git add -A` (everything generator produced, including the merged `.gitignore`).
  - [ ] `git commit -m "Initial Nx scaffolding (raw generator output)"` — one line, no extended body, no co-author trailer (the candidate authors this commit themselves; this is not AI work).
  - [ ] Verify with `git log --oneline -1` that the commit message matches AC #2 verbatim.
  - [ ] Verify with `git diff main..HEAD --stat` that no file from the preserved-list in AC #3 was deleted.
  - [ ] `git push -u origin story/1-1-initial-nx-scaffolding-committed-untouched`.
- [ ] **Task 7: Open the PR** (AC: #2)
  - [ ] Open a PR titled `Story 1.1: Initial Nx scaffolding (raw generator output)`.
  - [ ] Use `.github/PULL_REQUEST_TEMPLATE.md` (already in the repo).
  - [ ] Body includes: the literal command from AC #1; the `.gitignore` merge approach chosen in Task 3; the NFR2 verification line from Task 5; an explicit "no manual edits to generated files" attestation.
  - [ ] Note that CI is not yet wired (stories 1.3–1.5 add it), so the PR will not have green checks at this point — that is expected and the README brief acknowledges direct progression through 1.1 → 1.6 before all four checks exist.

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

_To be filled by the dev agent during implementation._

### Completion Notes List

_To be filled by the dev agent during implementation. Suggested entries: (a) which `.gitignore` merge approach was chosen in Task 3; (b) the actual `tsconfig.base.json` target value observed in Task 5; (c) any flag value the installed Nx CLI rejected (none expected per the 2026-05-22 verification, but pin the version if it drifted)._

### File List

_To be filled by the dev agent during implementation. Will be dominated by generator output: `package.json`, `pnpm-lock.yaml`, `nx.json`, `tsconfig.base.json`, `eslint.config.js` (or `.eslintrc.json`), `apps/web/**`, `apps/web-e2e/**`, possibly `.github/workflows/ci.yml` (starter, to be replaced in story 1.3), `.gitignore` (merged)._

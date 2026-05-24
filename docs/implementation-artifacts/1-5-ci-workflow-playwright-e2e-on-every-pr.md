# Story 1.5: CI workflow — Playwright E2E on every PR

Status: ready-for-dev

## Story

As the candidate,
I want Playwright wired into CI with browser binaries installed,
so that E2E regressions cannot merge.

## Acceptance Criteria

1. **Given** `.github/workflows/ci.yml` has an `e2e` job, **When** a PR is opened or updated and affects `apps/web` or `apps/web-e2e`, **Then** the job installs Playwright browsers via `pnpm exec playwright install --with-deps`, runs `pnpm nx e2e web-e2e`, and reports a check status.

2. **Given** the Playwright spec fails, **When** CI runs, **Then** the Playwright HTML report and/or trace artifacts are uploaded via `actions/upload-artifact` for post-mortem diagnosis.

3. **Given** the Playwright spec passes locally, **When** CI runs the same spec, **Then** the `e2e` check passes within a reasonable wall-clock time (under five minutes for the MVP spec).

## Tasks / Subtasks

- [ ] **Task 1: Create story file and update sprint status** (housekeeping)
  - [ ] Add this story file at `docs/implementation-artifacts/1-5-ci-workflow-playwright-e2e-on-every-pr.md`
  - [ ] Update `sprint-status.yaml`: set `1-5-ci-workflow-playwright-e2e-on-every-pr` to `in-progress`
- [ ] **Task 2: Convert `build-and-e2e` job into a dedicated `e2e` job** (AC: #1, #3)
  - [ ] Rename the existing `build-and-e2e` job to `e2e` in `.github/workflows/ci.yml`
  - [ ] Replace `pnpm nx affected -t build e2e --base=origin/main` with `pnpm nx affected -t e2e --base=origin/main` (consistent with `lint`, `typecheck`, and `test` jobs; the `build` target is unnecessary since Playwright's `webServer` config starts the dev server)
  - [ ] Keep `pnpm exec playwright install --with-deps` before the e2e run
  - [ ] Keep `timeout-minutes: 15` (Playwright browser install + dev-server startup + spec execution needs headroom beyond the 10 min used for lint/typecheck/test)
- [ ] **Task 3: Upload Playwright artifacts on failure** (AC: #2)
  - [ ] Add `actions/upload-artifact@v4` step after the e2e run with `if: ${{ failure() }}`
  - [ ] Upload the Playwright HTML report directory (`apps/web-e2e/test-output/playwright/report/` — TS solution setup path set by `nxE2EPreset`)
  - [ ] Upload test output including traces (`apps/web-e2e/test-output/playwright/output/` — TS solution setup path set by `nxE2EPreset`)
  - [ ] Set a sensible `retention-days` (e.g., 7) to avoid bloating Actions storage
- [ ] **Task 4: Remove firefox from Playwright config** (AC: #3)
  - [ ] Remove the firefox project entry from `apps/web-e2e/playwright.config.ts`, keeping chromium only
- [ ] **Task 5: Verify CI workflow syntax and push** (AC: #1, #3)
  - [ ] Validate the updated `ci.yml` is valid YAML (no syntax errors)
  - [ ] Confirm the job name `e2e` matches what branch protection will reference in story 1.6

## Dev Notes

### Current CI State

The CI workflow (`.github/workflows/ci.yml`) already has four jobs: `lint`, `typecheck`, `test`, and `build-and-e2e`. This story's job is to convert `build-and-e2e` into a clean `e2e` job. The `build` target can be dropped — the Playwright config's `webServer` directive starts the dev server automatically, and Nx's dependency graph ensures the app is buildable before e2e runs. Use `pnpm nx affected -t e2e --base=origin/main` to stay consistent with the other three jobs.

### Playwright Configuration (already exists)

`apps/web-e2e/playwright.config.ts` is already configured:
- **Dev server:** `webServer.command` = `pnpm exec nx run @conways-game-of-life/web:dev` on port 3000 with `reuseExistingServer: true`
- **Browsers:** Chromium and Firefox enabled; webkit commented out
- **Trace:** `on-first-retry` — traces are captured only when a test is retried after failure
- **Test dir:** Set via `nxE2EPreset(__filename, { testDir: './src' })`

### Artifact Upload Pattern

Use two upload steps (both `if: failure()`):

```yaml
- name: Upload Playwright report
  if: ${{ failure() }}
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: apps/web-e2e/test-output/playwright/report/
    retention-days: 7

- name: Upload Playwright test output
  if: ${{ failure() }}
  uses: actions/upload-artifact@v4
  with:
    name: playwright-test-output
    path: apps/web-e2e/test-output/playwright/output/
    retention-days: 7
```

### Job Setup Pattern (established in stories 1.3/1.4)

All CI jobs follow the same setup:
1. `actions/checkout@v4` with `filter: tree:0` (treeless clone) and `fetch-depth: 0`
2. `pnpm/action-setup@v4` with `version: 9.8.0`
3. `actions/setup-node@v4` with `node-version: 20` and `cache: 'pnpm'`
4. `pnpm install --frozen-lockfile`

### nxE2EPreset CI Behavior (already configured — do NOT duplicate)

The `nxE2EPreset` in `playwright.config.ts` auto-detects `process.env.CI` and applies:
- `retries: 2` — failed tests retry twice before reporting failure
- `workers: 1` — serial execution to avoid resource contention on CI runners
- `forbidOnly: true` — prevents `test.only` from silently passing CI
- Blob report auto-generated at `apps/web-e2e/test-output/playwright/blob-report/`

Do not add any of these settings manually — they are already handled by the preset.

### Chromium-Only for CI

The current Playwright config runs both chromium and firefox. Remove the firefox project entry from `playwright.config.ts`. Rationale: this is a Canvas-based Game of Life, not a production app with a cross-browser SLA. A chromium-only run cuts e2e wall-clock roughly in half, keeping it comfortably under the 5-minute AC. Firefox can be re-added later if a cross-browser concern arises.

### What NOT to Do

- **Do NOT remove the `webServer` from playwright.config.ts** — it handles dev-server lifecycle automatically. CI does not need a separate `nx run web:build && nx run web:serve` chain.
- **Do NOT add `continue-on-error: true`** to the e2e step — failures must block merge per NFR7.
- **Do NOT combine the artifact upload steps into one** with a glob path — keep report and test output separate for easier diagnosis.
- **Do NOT add `retries`, `workers`, or `forbidOnly`** to `playwright.config.ts` — `nxE2EPreset` already handles these in CI.

### Architecture Compliance

- **NFR7:** CI must run lint, type-check, Jest, and Playwright on every PR. This story completes the Playwright leg. [Source: docs/planning-artifacts/architecture.md#§7.2]
- **Architecture §4.10:** The four required check names are `lint`, `typecheck`, `test`, `e2e`. This job MUST be named `e2e` so story 1.6 can reference it in branch protection. [Source: docs/planning-artifacts/architecture.md#§4.10]
- **Architecture §7.2 Job 4:** `pnpm exec playwright install --with-deps` → `pnpm nx e2e web-e2e`. [Source: docs/planning-artifacts/architecture.md#§7.2]

### File Structure

Files to modify:
- `.github/workflows/ci.yml` — rename `build-and-e2e` → `e2e`, update run command, add artifact upload steps
- `apps/web-e2e/playwright.config.ts` — remove firefox project entry (chromium-only for CI speed)

Files NOT to touch:
- `apps/web-e2e/src/` — spec content is story 4.1's concern, not this story's

### Testing / Verification

This story has no unit tests. Verification is:
1. Validate `ci.yml` is syntactically correct YAML
2. Push to branch, open/update PR, confirm the `e2e` job appears in the PR's checks tab
3. Confirm the job runs Playwright and reports pass/fail status
4. (If a spec failure can be triggered) confirm artifacts are uploaded and downloadable

### Previous Story Intelligence

**From story 1.3 (done):**
- Established the per-job pattern: each CI check is its own job with independent setup steps
- Added `concurrency` group with `cancel-in-progress: true` at workflow level
- Added `timeout-minutes: 10` per job, treeless clones (`filter: tree:0`)
- The `build-and-e2e` job was left as a combined placeholder for stories 1.4/1.5 to split

**From story 1.4 (done):**
- Added dedicated `test` job following the same setup pattern
- Added `--output-style=stream` for readable Jest output in CI logs
- Named steps with `name:` for clarity in the Actions UI (follow this pattern for e2e steps)

**Key learnings:**
- Keep the job setup steps identical across all jobs (checkout, pnpm, node, install) — divergence causes confusion
- Use descriptive `name:` fields on run steps for Actions UI readability
- The `build-and-e2e` job currently uses `timeout-minutes: 15` — keep this for the e2e job since Playwright browser install + dev server startup + spec execution is heavier than lint/typecheck/test

### Git Intelligence

Recent commits show the CI workflow has been iteratively refined:
- `93423a5` Split CI into separate lint and typecheck jobs
- `3aed9d5` Add concurrency control, job timeouts, and treeless clones to CI
- `0777189` Add dedicated test job to CI workflow
- `74dfb9e` Add output-style flag for full Jest output in CI test job

Pattern: each CI story produces 1–2 focused commits modifying `.github/workflows/ci.yml`. Follow the same granularity — one commit for the `build-and-e2e` → `e2e` conversion + artifact upload.

### References

- [Source: docs/planning-artifacts/epics.md#Story 1.5] — ACs and effort estimate (M)
- [Source: docs/planning-artifacts/architecture.md#§4.10] — CI check names and auto-approve design
- [Source: docs/planning-artifacts/architecture.md#§7.2] — CI workflow outline, Job 4 (e2e)
- [Source: docs/planning-artifacts/prd.md#NFR7] — CI quality gates on every PR
- [Source: apps/web-e2e/playwright.config.ts] — Playwright browser/trace/webServer config
- [Source: .github/workflows/ci.yml] — Current CI workflow with `build-and-e2e` job to convert

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (1M context)

### Debug Log References

### Completion Notes List

### File List

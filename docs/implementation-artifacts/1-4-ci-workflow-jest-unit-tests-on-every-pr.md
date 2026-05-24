# Story 1.4: CI workflow — Jest unit tests on every PR

Status: done

<!-- Generated 2026-05-24 via /bmad-bmm-quick-dev. -->

## Story

As the candidate,
I want the same workflow to run Jest across affected projects,
so that simulation rule regressions cannot merge.

## Acceptance Criteria

1. **Given** `.github/workflows/ci.yml` has a `test` job, **When** a PR is opened or updated, **Then** the job runs `pnpm nx affected -t test --base=origin/main --parallel=3` and reports a check status. **And** test output (pass/fail counts, failure messages) is visible in the GitHub Actions logs.

2. **Given** a PR introduces a failing Jest test in any affected project, **When** CI runs, **Then** the `test` check fails and blocks merge.

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
- [x] **Task 2: Add dedicated `test` job to ci.yml** (AC: #1, #2)
  - [x] Add `test` job with same setup pattern as `lint`/`typecheck` (checkout, pnpm, node, install)
  - [x] Run `pnpm nx affected -t test --base=origin/main --parallel=3`
  - [x] Remove `test` from the existing `build-and-test` job's combined command
- [x] **Task 3: Adversarial review**

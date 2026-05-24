# Story 1.3: CI workflow — lint and type-check on every PR

Status: review

<!-- Generated 2026-05-24 via /bmad-bmm-quick-dev. -->

## Story

As the candidate,
I want a GitHub Actions workflow that runs lint and type-check on every PR into `main`,
so that style and TypeScript regressions cannot merge.

## Acceptance Criteria

1. **Given** `.github/workflows/ci.yml` is configured to trigger on `pull_request` into `main`, **When** a PR is opened or updated, **Then** the `lint` job runs `pnpm install --frozen-lockfile` followed by `pnpm nx affected -t lint --base=origin/main` and reports a check status. **And** the `typecheck` job runs `pnpm nx affected -t typecheck --base=origin/main` and reports a check status.

2. **Given** a PR introduces a TypeScript error or a lint violation, **When** CI runs, **Then** the corresponding check fails and the failure is visible in the PR's checks tab.

## Tasks / Subtasks

- [x] **Task 1: Create story file and update sprint status** (housekeeping)
- [x] **Task 2: Restructure ci.yml — split lint and typecheck into separate jobs** (AC: #1, #2)
  - [x] Add `lint` job: checkout, pnpm setup, node setup, `pnpm install --frozen-lockfile`, `pnpm nx affected -t lint --base=origin/main`
  - [x] Add `typecheck` job: checkout, pnpm setup, node setup, `pnpm install --frozen-lockfile`, `pnpm nx affected -t typecheck --base=origin/main`
  - [x] Keep remaining targets (`test`, `build`, `e2e`) in a third job for now (stories 1.4/1.5 split those)
  - [x] Scope `pull_request` trigger to `branches: [main]`
- [x] **Task 3: Validate workflow syntax**

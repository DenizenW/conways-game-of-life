# Story 1.6: Branch protection and auto-approve workflow

Status: in-progress

## Story

As the candidate,
I want `main` protected with the four required checks plus the auto-approve workflow firing on green,
so that AR2 and AR3 are demonstrably configured per the brief.

## Acceptance Criteria

1. **Given** repository settings for `main`, **When** I configure branch protection, **Then** the four CI checks (`lint`, `typecheck`, `test`, `e2e`) are listed as required, at least one approving review is required, direct pushes are blocked, and the configuration is captured under `docs/implementation-artifacts/`.

2. **Given** `.github/workflows/auto-approve.yml` is configured, **When** a PR's four required checks all conclude `success`, **Then** the workflow uses `hmarr/auto-approve-action@v4` to post an approving review from `github-actions[bot]`.

3. **Given** a PR has at least one failing check, **When** the auto-approve workflow runs, **Then** it does not approve the PR.

## Tasks / Subtasks

- [ ] Create `.github/workflows/auto-approve.yml` workflow
- [ ] Configure branch protection rules on `main` via GitHub API
- [ ] Capture branch protection configuration under `docs/implementation-artifacts/`
- [ ] Update sprint-status.yaml

## Story

<!-- Which story does this PR implement? Reference by key from sprint-status.yaml, e.g. "Story 3.5: speed slider with rAF accumulator". -->

Story:

## Summary

<!-- One sentence describing what this PR does. The same sentence should fit your commit message. -->

## Architecture deviations

<!--
Did you deviate from docs/planning-artifacts/architecture.md or docs/project-context.md?
- If yes: describe the deviation and why. Cite the rule or section you departed from.
- If no: write "None."
-->

None.

## Self-review checklist

- [ ] Tests added or updated in this PR (not deferred to a later "tests PR")
- [ ] `pnpm nx affected -t lint typecheck test` passes locally
- [ ] Playwright passes locally if affected
- [ ] Module boundaries respected (no relative cross-lib imports; uses `@conways-game-of-life/*` aliases)
- [ ] Sprint status updated in `docs/implementation-artifacts/sprint-status.yaml` for this story
- [ ] Commit messages are imperative mood, one-sentence subject
- [ ] No `.claude/`, `.cursor/`, `.opencode/`, or `_bmad/` files removed or gitignored
- [ ] CI checks (lint, typecheck, Jest, Playwright) green before requesting merge

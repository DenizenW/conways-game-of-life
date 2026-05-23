# Story 1.2: Configure Nx tags and prove module boundaries fire

Status: ready-for-dev

<!-- Generated 2026-05-23 via /bmad-bmm-create-story. Validation optional: /bmad-bmm-validate-story before /bmad-bmm-dev-story. -->

## Story

As the candidate,
I want the Nx tag taxonomy plus `@nx/enforce-module-boundaries` configured and demonstrably failing on a deliberate violation,
so that NFR8 is a real, evaluated deliverable rather than a hand-wave.

## Acceptance Criteria

1. **Given** the Nx workspace exists with `apps/web`, `apps/web-e2e`, `libs/sim`, `libs/types`, `libs/ui`, `libs/api-client` (and stretch `apps/api`), **When** I configure each project's `tags` in `package.json` per the architecture §5.6 taxonomy (`scope:app`, `scope:e2e`, `scope:server`, `scope:sim`, `scope:ui`, `scope:api-client`, `scope:types`), **Then** the root ESLint config has `@nx/enforce-module-boundaries` with the depConstraints from architecture §5.6 and `pnpm nx lint` passes on the workspace.

2. **Given** the boundary rules are configured, **When** I add a deliberately violating import — `import * as React from 'react'` in `libs/sim/src/index.ts` — on a throwaway branch, **Then** `pnpm nx lint sim` fails with an `@nx/enforce-module-boundaries` error. **And** the failure output is captured as a log paste committed under `docs/implementation-artifacts/` and referenced from the README per NFR8.

3. **Given** the demonstration is captured, **When** I revert the violation, **Then** `pnpm nx lint sim` passes again and the violating import is not present in any merged commit.

## Tasks / Subtasks

- [ ] **Task 1: Add missing `tags` to projects that lack them** (AC: #1)
  - [ ] `apps/web/package.json` — add `"tags": ["scope:app"]` under `"nx"` key
  - [ ] `apps/web-e2e/package.json` — add `"tags": ["scope:e2e"]` under `"nx"` key
  - [ ] `api-e2e/package.json` — add `"tags": ["scope:e2e"]` under `"nx"` key (co-generated in 1.1b, not in architecture §5.6 taxonomy — safe because `api-e2e` only imports npm packages like `axios` and `@nx/node/utils`, no workspace project imports, so the `scope:e2e` constraint won't cause lint failures)
  - [ ] Verify tags already present on `api`, `libs/sim`, `libs/ui`, `libs/api-client`, `libs/types` (set by `--tags` in story 1.1b)
  - [ ] Commit: focused message describing tag additions

- [ ] **Task 2: Replace the wildcard depConstraints with the architecture §5.6 allow-list** (AC: #1)
  - [ ] Edit `eslint.config.mjs` — replace the `{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }` wildcard with the seven specific depConstraint entries from architecture §5.6
  - [ ] Preserve existing `allow` array (ESLint config file self-reference pattern)
  - [ ] Preserve `enforceBuildableLibDependency: true`
  - [ ] Commit: focused message describing boundary rule configuration

- [ ] **Task 3: Verify `pnpm nx lint` passes on the clean workspace** (AC: #1)
  - [ ] Run `pnpm nx run-many -t lint` — all projects must pass with the new constraints
  - [ ] If any project fails, diagnose: likely a tag mismatch or an untagged project creating a constraint violation
  - [ ] Fix any issues and amend the relevant commit

- [ ] **Task 4: Demonstrate boundary violation on a throwaway branch** (AC: #2)
  - [ ] Create a throwaway branch off the feature branch: `git checkout -b demo/boundary-violation`
  - [ ] Add deliberate violation: `import { apiClient } from '@conways-game-of-life/api-client';` in `libs/sim/src/index.ts` (primary — cross-project workspace import that `scope:sim` forbids)
  - [ ] Optionally also try: `import * as React from 'react';` — document whether this npm-package import triggers the rule or not (it likely won't since `@nx/enforce-module-boundaries` only governs workspace project imports)
  - [ ] Run `pnpm nx lint sim` — expect failure with `@nx/enforce-module-boundaries` error on the workspace import
  - [ ] Capture the failure output (terminal log) into `docs/implementation-artifacts/boundary-violation-demo.md`
  - [ ] Switch back to the feature branch: `git checkout story/1-2-module-boundaries`
  - [ ] Delete the throwaway branch: `git branch -D demo/boundary-violation`
  - [ ] Copy the captured demo artifact onto the feature branch and commit it (the violation itself never appears in the feature branch history)
  - [ ] Run `pnpm nx lint sim` on the clean feature branch — confirm pass

- [ ] **Task 5: Add boundary-violation reference to README** (AC: #2, NFR8)
  - [ ] Add a short section or line to the root `README.md` referencing `docs/implementation-artifacts/boundary-violation-demo.md` as proof that `@nx/enforce-module-boundaries` fires on a cross-boundary import
  - [ ] Keep it minimal — story 4.4 will expand the README into a full thinking document; this just plants the NFR8 anchor so it isn't forgotten
  - [ ] Commit: focused message describing README boundary-demo reference

- [ ] **Task 6: Push branch and open PR** (AC: #1, #2, #3)
  - [ ] Create feature branch (e.g., `story/1-2-module-boundaries`)
  - [ ] Push and open PR into `main`
  - [ ] PR description should reference NFR8 and the boundary violation demo artifact

## Dev Notes

### What needs to change vs. what already exists

The generators in story 1.1b already set tags on 5 of 8 projects via `--tags=scope:*` flags. These are stored in the `"tags"` array within each project's `package.json`:

| Project | Current tags | Needed tags | Action |
| --- | --- | --- | --- |
| `apps/web` | (none) | `scope:app` | **ADD** |
| `apps/web-e2e` | (none) | `scope:e2e` | **ADD** |
| `api/` | `scope:server` | `scope:server` | Already set |
| `api-e2e/` | (none) | `scope:e2e` | **ADD** |
| `libs/sim` | `scope:sim` | `scope:sim` | Already set |
| `libs/ui` | `scope:ui` | `scope:ui` | Already set |
| `libs/api-client` | `scope:api-client` | `scope:api-client` | Already set |
| `libs/types` | `scope:types` | `scope:types` | Already set |

### Tag location in Nx 22 projects

Nx 22 uses `package.json` (not `project.json`) for project configuration. Tags are stored under the `"nx"` key:

```json
{
  "name": "@conways-game-of-life/web",
  "nx": {
    "tags": ["scope:app"]
  }
}
```

For projects that already have an `"nx"` block (like `apps/web-e2e` which has `"implicitDependencies"`), add `"tags"` alongside the existing keys. For `apps/web` which has no `"nx"` block, add it.

### ESLint config: current state vs. target

The root `eslint.config.mjs` already has `@nx/enforce-module-boundaries` configured with a **wildcard** rule:

```js
depConstraints: [
  { sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }
]
```

This allows anything to import anything — it's the scaffold default, not a real boundary. Replace it with the architecture §5.6 depConstraints:

```js
depConstraints: [
  { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['scope:sim', 'scope:ui', 'scope:api-client', 'scope:types'] },
  { sourceTag: 'scope:server', onlyDependOnLibsWithTags: ['scope:sim', 'scope:types'] },
  { sourceTag: 'scope:api-client', onlyDependOnLibsWithTags: ['scope:types'] },
  { sourceTag: 'scope:ui', onlyDependOnLibsWithTags: ['scope:types'] },
  { sourceTag: 'scope:sim', onlyDependOnLibsWithTags: ['scope:types'] },
  { sourceTag: 'scope:types', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'scope:e2e', onlyDependOnLibsWithTags: ['scope:app', 'scope:types'] },
]
```

### The deliberate violation demonstration

`@nx/enforce-module-boundaries` only governs imports between Nx workspace projects — it does not check bare npm packages like `react`. The epics AC #2 specifies `import * as React from 'react'`, but this will almost certainly NOT trigger the boundary rule because `react` is an npm dependency, not a workspace project.

**Primary violation (guaranteed to fire):** Use a cross-project workspace import. Architecture §5.6 gives the canonical example:

```ts
// in libs/sim/src/index.ts
import { apiClient } from '@conways-game-of-life/api-client';
```

This fails because `scope:sim` can only depend on `scope:types`, and `@conways-game-of-life/api-client` is tagged `scope:api-client`. Other workspace imports that would also fire: `@conways-game-of-life/ui` (`scope:ui`).

**Secondary test (informational):** Also try the React import from the AC and document whether it fires or not. The demo artifact should include both results so the finding is transparent to the panel.

The demo runs on a throwaway branch (per architecture §5.6: "Do NOT merge the violation; it is a demonstration commit on a throwaway branch"). The violation code never appears in the feature branch history.

### Commit discipline

This is the first story with **authored code** (as opposed to generator output). Commits should be one-sentence-summarizable per NFR10. Suggested commit sequence:

1. `Add scope tags to apps/web, apps/web-e2e, and api-e2e` — tags only
2. `Configure @nx/enforce-module-boundaries depConstraints per architecture §5.6` — ESLint config only
3. `Add boundary violation demonstration artifact` — docs only, no violating code in the commit

### Previous story intelligence (from story 1.1b)

Key findings from story 1.1b that affect this story:

- **Nx 22 project layout:** `api/` lives at workspace root (not `apps/api/`). `api-e2e/` is also at workspace root. Address tags for both.
- **Tags set by generators:** Five projects already have correct tags via `--tags` flags. Only three need manual addition.
- **ESLint config format:** The workspace uses `eslint.config.mjs` (flat config), not `.eslintrc.json`. The depConstraints go in the existing rule block, replacing the wildcard.
- **`@nx/next:setup-tailwind` is deprecated** in Nx 22.7.2 but worked. No impact on this story.

### Project Structure Notes

- No new files are created except `docs/implementation-artifacts/boundary-violation-demo.md` (the captured violation output)
- Modified files: `eslint.config.mjs`, `apps/web/package.json`, `apps/web-e2e/package.json`, `api-e2e/package.json`
- All changes are configuration — no application logic

### References

- [Source: docs/planning-artifacts/architecture.md#5.6] — tag taxonomy, depConstraints, and deliberate-violation demo specification
- [Source: docs/planning-artifacts/epics.md#Story-1.2] — acceptance criteria (verbatim)
- [Source: docs/planning-artifacts/architecture.md#1] — overview: "Nx tags + `@nx/enforce-module-boundaries` make the boundaries real"
- [Source: docs/implementation-artifacts/1-1b-generator-follow-up.md#Dev-Agent-Record] — Nx 22 project layout (api/ at root, not apps/api/)
- [Source: eslint.config.mjs] — current ESLint config with wildcard depConstraint to be replaced
- [Source: docs/planning-artifacts/epics.md#NFR8] — "Module boundaries actually enforced; deliberate violation must fail CI; demonstration in README"

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

# Branch Protection Configuration for `main`

Configured via GitHub API on 2026-05-24.

## Required status checks

| Check      | Required | App         |
| ---------- | -------- | ----------- |
| `lint`     | Yes      | GitHub Actions |
| `typecheck`| Yes      | GitHub Actions |
| `test`     | Yes      | GitHub Actions |
| `e2e`      | Yes      | GitHub Actions |

- **Strict mode:** off (PRs are not required to be up-to-date with `main` before merging)

## Required pull request reviews

- **Required approving review count:** 1
- **Dismiss stale reviews:** no
- **Require code owner reviews:** no
- **Require last push approval:** no

## Other settings

| Setting                        | Value    |
| ------------------------------ | -------- |
| Enforce admins                 | No       |
| Allow force pushes             | No       |
| Allow deletions                | No       |
| Required linear history        | No       |
| Required conversation resolution | No    |
| Lock branch                    | No       |

## Auto-approve workflow

`.github/workflows/auto-approve.yml` triggers on `workflow_run` completion of the CI workflow. When all four checks pass (i.e., the CI workflow concludes with `success`), it posts an approving review via `hmarr/auto-approve-action@v4`. If any check fails, the CI workflow conclusion is not `success`, so the auto-approve job's `if` condition is not met and no approval is posted.

## API response (raw)

```json
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["lint", "typecheck", "test", "e2e"],
    "checks": [
      {"context": "lint", "app_id": 15368},
      {"context": "typecheck", "app_id": 15368},
      {"context": "test", "app_id": 15368},
      {"context": "e2e", "app_id": 15368}
    ]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  },
  "enforce_admins": {"enabled": false},
  "allow_force_pushes": {"enabled": false},
  "allow_deletions": {"enabled": false},
  "required_linear_history": {"enabled": false},
  "required_conversation_resolution": {"enabled": false},
  "lock_branch": {"enabled": false}
}
```

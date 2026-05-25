---
description: Spin up an isolated git worktree (deps installed) so a second Claude Code session can work on a different branch in parallel.
---

# /worktree — Create a parallel worktree

Create a ready-to-use git worktree for branch `$ARGUMENTS` by invoking
`./scripts/new-worktree.sh`. The script installs deps and copies any
gitignored `.env` files from the primary checkout.

**Branch name:** `$ARGUMENTS`

## What to do

1. **Validate the argument.** If `$ARGUMENTS` is empty or contains spaces,
   stop and ask the user for a valid branch name (letters, numbers, dashes,
   underscores, dots, slashes).

2. **Run the script with `--no-launch`.** Since you are already running
   inside a Claude session, do NOT let the script `exec claude` — it would
   nest a new session. Invoke:

   ```bash
   ./scripts/new-worktree.sh <branch> --no-launch
   ```

   from the repo root. Stream the output so the user sees the install
   progress.

3. **Report the result.** Once the script exits successfully, tell the user:
   - The worktree path (from the script's summary)
   - The exact command to open the new worktree in a second terminal:
     ```
     cd <worktree-path> && claude
     ```

4. **On failure**, surface the script's stderr to the user verbatim and stop.
   Common failure modes: path already exists, branch name invalid.

## Do NOT

- Do NOT modify files in the new worktree from this session — the whole
  point is that the new worktree is for a different Claude session.
- Do NOT omit `--no-launch`. The script's default behavior is to `exec claude`,
  which would hijack this session.
- Do NOT try to `cd` into the new worktree and continue working there; your
  working directory should stay in the primary checkout.

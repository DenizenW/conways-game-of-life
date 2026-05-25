#!/usr/bin/env bash
#
# new-worktree.sh — spin up an isolated git worktree so a second Claude Code
# session can work on a different branch without stepping on the primary
# checkout. Installs deps and launches `claude` in the new dir.
#
# Usage: ./scripts/new-worktree.sh <branch-name> [--reinstall] [--no-launch]
#

set -euo pipefail

# ---------- colors ----------
if [[ -t 1 ]]; then
    BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'
    GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
    BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi
info()  { echo "${BLUE}==>${RESET} $*"; }
ok()    { echo "${GREEN}✓${RESET} $*"; }
warn()  { echo "${YELLOW}⚠${RESET}  $*"; }
fail()  { echo "${RED}✗${RESET} $*" >&2; exit 1; }

# ---------- args ----------
REINSTALL=false
NO_LAUNCH=false
BRANCH=""
for arg in "$@"; do
    case "$arg" in
        --reinstall) REINSTALL=true ;;
        --no-launch) NO_LAUNCH=true ;;
        -h|--help)
            sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        -*) fail "Unknown flag: $arg" ;;
        *)
            [[ -n "$BRANCH" ]] && fail "Only one branch name allowed"
            BRANCH="$arg"
            ;;
    esac
done
[[ -n "$BRANCH" ]] || fail "Usage: $0 <branch-name> [--reinstall] [--no-launch]"
[[ "$BRANCH" =~ ^[A-Za-z0-9._/-]+$ ]] || fail "Branch name has illegal characters: $BRANCH"

# ---------- repo layout ----------
REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
REPO_PARENT="$(dirname "$REPO_ROOT")"
# Slashes in branch names become dashes in the directory name
DIR_SAFE_BRANCH="${BRANCH//\//-}"
WORKTREE_PATH="$REPO_PARENT/${REPO_NAME}-${DIR_SAFE_BRANCH}"

info "Source repo:    $REPO_ROOT"
info "New worktree:   $WORKTREE_PATH"

# ---------- create worktree ----------
if [[ -e "$WORKTREE_PATH" ]]; then
    fail "Path already exists: $WORKTREE_PATH"
fi

if git -C "$REPO_ROOT" show-ref --quiet --verify "refs/heads/$BRANCH"; then
    info "Branch '$BRANCH' exists locally — checking out into worktree"
    git -C "$REPO_ROOT" worktree add "$WORKTREE_PATH" "$BRANCH"
elif git -C "$REPO_ROOT" show-ref --quiet --verify "refs/remotes/origin/$BRANCH"; then
    info "Branch '$BRANCH' exists on origin — checking out tracking branch"
    git -C "$REPO_ROOT" worktree add --track -b "$BRANCH" "$WORKTREE_PATH" "origin/$BRANCH"
else
    info "Creating new branch '$BRANCH' from HEAD"
    git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WORKTREE_PATH"
fi
ok "Worktree created"

# ---------- install deps ----------
command -v pnpm >/dev/null || fail "pnpm not found on PATH"

if [[ -d "$WORKTREE_PATH/node_modules" && "$REINSTALL" != true ]]; then
    warn "node_modules already present, skipping (use --reinstall to force)"
else
    info "pnpm install"
    ( cd "$WORKTREE_PATH" && pnpm install )
    ok "Dependencies installed"
fi

# ---------- copy .env files ----------
copy_env_files() {
    local src_dir="$1" dst_dir="$2"
    shopt -s nullglob
    local copied=0
    for src in "$src_dir"/.env "$src_dir"/.env.*; do
        [[ -f "$src" ]] || continue
        local name
        name="$(basename "$src")"
        [[ "$name" == ".env.local" ]] && continue
        cp "$src" "$dst_dir/$name"
        copied=$((copied + 1))
    done
    shopt -u nullglob
    if (( copied > 0 )); then
        ok "Copied $copied .env file(s)"
    fi
}

copy_env_files "$REPO_ROOT" "$WORKTREE_PATH"

# ---------- summary ----------
echo
echo "${BOLD}Worktree ready${RESET}"
echo "  path:   $WORKTREE_PATH"
echo "  branch: $BRANCH"
echo
if [[ "$NO_LAUNCH" == true ]]; then
    info "Skipping claude launch (--no-launch). Start it yourself with:"
    echo "    cd $WORKTREE_PATH && claude"
    exit 0
fi

info "Launching claude in new worktree..."
echo "${DIM}(cd $WORKTREE_PATH && exec claude)${RESET}"
echo

cd "$WORKTREE_PATH"
exec claude

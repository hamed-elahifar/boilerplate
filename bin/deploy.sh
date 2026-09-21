#!/usr/bin/env bash
# deploy.sh — deploy backend + frontend (run on the server, from anywhere)
# Usage: ./bin/deploy.sh [<branch>] [--force]
# Requires: git, bun, pm2, serve (see bin/setup.sh) and backend/.env on the server.

set -u
set -o pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR" "$PROJECT_DIR/backend/logs"

LOG_FILE="$LOG_DIR/deploy-$(date '+%Y-%m-%d_%H-%M-%S').log"
STAMP_FILE="$LOG_DIR/.deploy-stamp"

FORCE=false
BRANCH_ARG=""
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      echo "Usage: $(basename "$0") [<branch>] [--force]"
      echo "  <branch>   Branch to deploy (default: \$DEPLOY_BRANCH or current branch)"
      echo "  --force    Redeploy even if the commit is unchanged"
      exit 0 ;;
    --force) FORCE=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
    *) BRANCH_ARG="$arg" ;;
  esac
done

BRANCH="${BRANCH_ARG:-${DEPLOY_BRANCH:-$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

run() {
  log ">>> $*"
  "$@" 2>&1 | tee -a "$LOG_FILE"
  local code=${PIPESTATUS[0]}
  if [ "$code" -ne 0 ]; then log "FAILED ($code): $*"; exit "$code"; fi
}

cd "$PROJECT_DIR"
log "Deploying $BRANCH from $PROJECT_DIR"

for tool in git bun pm2 serve; do
  command -v "$tool" >/dev/null 2>&1 || { log "Missing required tool: $tool (run bin/setup.sh)"; exit 1; }
done
[ -f backend/.env ] || { log "Missing backend/.env (copy backend/env.example and fill it in)"; exit 1; }

prev="$([ -f "$STAMP_FILE" ] && cat "$STAMP_FILE" || true)"

# untracked-but-ignored files (.env, node_modules, logs) survive: no `clean -x`
run git fetch --all --prune
run git checkout -f "$BRANCH"
run git reset --hard "origin/$BRANCH"
run git clean -fd

new="$(git rev-parse HEAD)"
if [ "$new" = "$prev" ] && ! $FORCE; then
  log "Already at $new — nothing to do (use --force to redeploy)"
  exit 0
fi

run bun install --frozen-lockfile   # workspace root installs backend + frontend
run bun run build                   # backend (nest) then frontend (vue-tsc + vite)

run pm2 startOrReload ecosystem.config.js --update-env
run pm2 save

echo "$new" > "$STAMP_FILE"
log "Deployed $new. Log: $LOG_FILE"

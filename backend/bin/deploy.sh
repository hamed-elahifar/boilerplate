#!/usr/bin/env bash
# deploy.sh — backend deploy script
# VERSION: 2.1.0
# Usage: ./bin/deploy.sh [<branch>] [--force]

set -u
set -o pipefail

VERSION="2.1.0"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
LOG_FILE="$LOG_DIR/deploy-$TIMESTAMP.log"
STAMP_FILE="$LOG_DIR/.deploy-stamp"

FORCE=false
BRANCH_ARG=""

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      cat <<EOF
deploy.sh v${VERSION} -- backend deploy script

Usage:
  $(basename "$0") [<branch>] [--force]

Options:
  <branch>     Branch to deploy (default: current branch or \$DEPLOY_BRANCH)
  --force      Skip the deploy-stamp check and run every deployment step
  -h, --help   Show this help
EOF
      exit 0
      ;;
    --force) FORCE=true ;;
    -*) printf 'Unknown flag: %s\n' "$arg" >&2 ;;
    *) [ -z "$BRANCH_ARG" ] && BRANCH_ARG="$arg" ;;
  esac
done

BRANCH="${BRANCH_ARG:-${DEPLOY_BRANCH:-$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}}"
PM2_APP_NAME="${PM2_APP_NAME:-bales}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

run_cmd() {
  log ">>> $*"
  "$@" 2>&1 | tee -a "$LOG_FILE"
  local exit_code=${PIPESTATUS[0]}
  if [ "$exit_code" -ne 0 ]; then
    log "✖ FAILED ($exit_code): $*"
    exit "$exit_code"
  fi
  log "✔ SUCCESS: $*"
}

detect_pm2_app_name() {
  local configured_names
  configured_names="$(node -e "const c=require('./ecosystem.config.js'); const apps=(c.apps||[]).map(a=>a&&a.name).filter(Boolean); process.stdout.write(apps.join(','));" 2>/dev/null || true)"

  if [ -z "$configured_names" ]; then
    echo "$PM2_APP_NAME"
    return 0
  fi

  IFS=',' read -r -a names <<<"$configured_names"
  for n in "${names[@]}"; do
    if [ "$n" = "$PM2_APP_NAME" ]; then
      echo "$PM2_APP_NAME"
      return 0
    fi
  done

  echo "${names[0]}"
}

select_install_cmd() {
  if [ -f "$PROJECT_DIR/bun.lock" ] && command -v bun >/dev/null 2>&1; then
    echo "bun install --force"
    return 0
  fi

  if command -v npm >/dev/null 2>&1; then
    echo "npm install --force"
    return 0
  fi

  return 1
}

select_build_cmd() {
  if [ -f "$PROJECT_DIR/bun.lock" ] && command -v bun >/dev/null 2>&1; then
    echo "bun run build"
    return 0
  fi

  if command -v npm >/dev/null 2>&1; then
    echo "npm run build"
    return 0
  fi

  return 1
}

main() {
  log "Deployment started (deploy.sh v${VERSION})"
  log "Project: $PROJECT_DIR"
  log "Branch: $BRANCH"
  $FORCE && log "--force: skipping deploy-stamp check"

  cd "$PROJECT_DIR"

  local prev_commit
  prev_commit="$([ -f "$STAMP_FILE" ] && cat "$STAMP_FILE" || true)"

  run_cmd git reset --hard
  run_cmd git clean -fd
  run_cmd git fetch --all --prune
  run_cmd git checkout "$BRANCH"
  run_cmd git reset --hard "origin/$BRANCH"
  run_cmd git clean -fd

  local new_commit
  new_commit="$(git rev-parse HEAD)"

  if [ "$new_commit" = "$prev_commit" ] && ! $FORCE; then
    log "Already up-to-date ($new_commit) -- nothing to do"
    exit 0
  fi

  local install_cmd
  install_cmd="$(select_install_cmd)" || {
    log "✖ No package manager found (bun/npm)."
    exit 1
  }
  run_cmd bash -lc "$install_cmd"

  local build_cmd
  build_cmd="$(select_build_cmd)" || {
    log "✖ No build command available (bun/npm)."
    exit 1
  }
  run_cmd bash -lc "$build_cmd"
  git rev-parse HEAD > "$STAMP_FILE"

  local final_app_name
  final_app_name="$(detect_pm2_app_name)"
  if [ "$final_app_name" != "$PM2_APP_NAME" ]; then
    log "Requested PM2 app '$PM2_APP_NAME' not found in ecosystem file. Using '$final_app_name' instead."
  fi

  run_cmd pm2 startOrReload ecosystem.config.js --only "$final_app_name" --update-env
  run_cmd pm2 save

  log "Deployment finished successfully"
  log "Log file: $LOG_FILE"
}

main "$@"

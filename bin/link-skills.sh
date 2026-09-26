#!/usr/bin/env bash
# Symlink every .agents/skills/<name> into .claude/skills/<name>; drop links whose target is gone.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .claude/skills

for dir in .agents/skills/*/; do
  name=$(basename "$dir")
  link=".claude/skills/$name"
  [ -e "$link" ] || [ -L "$link" ] || { ln -s "../../.agents/skills/$name" "$link"; echo "linked $name"; }
done

for link in .claude/skills/*; do
  [ -L "$link" ] && [ ! -e "$link" ] && { rm "$link"; echo "removed broken $(basename "$link")"; }
done
exit 0

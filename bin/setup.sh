#!/usr/bin/env bash
# One-time server setup (Ubuntu). Installs git, bun, pm2, serve and Docker (for MongoDB etc).
set -eu

sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip rsync ca-certificates

# Bun (runs the backend and installs/builds both workspaces)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Node is only needed as the runtime for pm2 and serve
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm add -g pm2 serve
pm2 startup   # run the command it prints, then `pm2 save` after the first deploy

# Docker
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "Done. Clone the repo, create backend/.env from backend/env.example, then run bin/deploy.sh"

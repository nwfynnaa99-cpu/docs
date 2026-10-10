#!/bin/bash
# Starts the production stack inside a GitHub Codespace (see
# .devcontainer/alshuyukh/devcontainer.json at the repository root).
# Secrets are generated once per codespace and kept in deploy/.env.codespace.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=deploy/.env.codespace
ORIGIN="https://${CODESPACE_NAME:-local}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

# Random secrets from the kernel; openssl is not installed in every image.
hex() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }
b64() { head -c "$1" /dev/urandom | base64 | tr -d '\n'; }

# A file left behind by a failed first run may hold empty secrets.
if [ -f "$ENV_FILE" ] && ! grep -q '^JWT_SECRET=..' "$ENV_FILE"; then rm -f "$ENV_FILE"; fi

if [ ! -f "$ENV_FILE" ]; then
  umask 077
  cat > "$ENV_FILE" <<ENV
PUBLIC_ORIGIN=$ORIGIN
HTTP_PORT=8080
POSTGRES_PASSWORD=$(hex 24)
OWNER_DB_PASSWORD=$(hex 24)
APP_DB_PASSWORD=$(hex 24)
JWT_SECRET=$(b64 48)
ZATCA_ENCRYPTION_KEY=$(b64 32)
ZATCA_WORKER=on
ENV
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not available in this codespace. Delete it and create a new one from:"
  echo "https://codespaces.new/nwfynnaa99-cpu/docs/tree/claude/alshuyukh-accounting-saas-uf09e2?devcontainer_path=.devcontainer/alshuyukh/devcontainer.json"
  exit 1
fi

echo "Waiting for Docker…"
for _ in $(seq 1 60); do docker info >/dev/null 2>&1 && break; sleep 2; done

echo "Building and starting ALSHUYUKH ACCOUNTING (the first start takes about 5 minutes)…"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --build

for _ in $(seq 1 100); do
  curl -fsS http://localhost:8080/api/ready >/dev/null 2>&1 && break
  sleep 3
done

# Lets the link open on a phone without signing in to GitHub there.
gh codespace ports visibility 8080:public -c "${CODESPACE_NAME:-}" >/dev/null 2>&1 || true

echo
echo "================================================================"
echo " Ready: $ORIGIN"
echo "================================================================"

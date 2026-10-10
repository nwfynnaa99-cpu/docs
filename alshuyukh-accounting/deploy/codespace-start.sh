#!/bin/bash
# Starts the production stack inside a GitHub Codespace (see
# .devcontainer/alshuyukh/devcontainer.json at the repository root).
# Secrets are generated once per codespace and kept in deploy/.env.codespace.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=deploy/.env.codespace
ORIGIN="https://${CODESPACE_NAME:-local}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

if [ ! -f "$ENV_FILE" ]; then
  umask 077
  cat > "$ENV_FILE" <<ENV
PUBLIC_ORIGIN=$ORIGIN
HTTP_PORT=8080
POSTGRES_PASSWORD=$(openssl rand -hex 24)
OWNER_DB_PASSWORD=$(openssl rand -hex 24)
APP_DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
ZATCA_ENCRYPTION_KEY=$(openssl rand -base64 32)
ZATCA_WORKER=on
ENV
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

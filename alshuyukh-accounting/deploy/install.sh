#!/bin/sh
# One-step installer for a fresh Ubuntu/Debian server (run as root):
#   curl -fsSL https://raw.githubusercontent.com/nwfynnaa99-cpu/docs/claude/alshuyukh-accounting-saas-uf09e2/alshuyukh-accounting/deploy/install.sh | sh
#
# Installs Docker, downloads the system to /opt/alshuyukh, generates secrets,
# and starts it over HTTPS. Without a DOMAIN it uses <server-ip>.sslip.io, a
# free name that points to this server, so no DNS setup is needed.
# Run it again to update to the latest version; secrets are kept.
#
# It also works as a cloud provider's "user data" script, so the server sets
# itself up on first boot with nobody logged in. Progress is logged to
# /var/log/alshuyukh-install.log.
set -eu
export HOME="${HOME:-/root}"

REPO=${REPO:-https://github.com/nwfynnaa99-cpu/docs.git}
BRANCH=${BRANCH:-claude/alshuyukh-accounting-saas-uf09e2}
DIR=/opt/alshuyukh

main() {
say() { printf '\n\033[1;32m== %s\033[0m\n' "$1"; }

[ "$(id -u)" = 0 ] || { echo "Run this as root (or with sudo)."; exit 1; }

# On first boot the system updater may hold the package lock for a while.
if command -v fuser >/dev/null 2>&1; then
  while fuser /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock >/dev/null 2>&1; do sleep 5; done
fi

say "Installing Docker and git"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
command -v git >/dev/null 2>&1 || { apt-get update -q && apt-get install -yq git; }

# Building the images needs about 2 GB of memory; add swap on small servers.
if [ "$(awk '/MemTotal/ {print $2}' /proc/meminfo)" -lt 3000000 ] && ! swapon --show | grep -q .; then
  say "Adding 2 GB of swap"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "Downloading the system"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$DIR" reset --hard FETCH_HEAD
else
  # The repository holds other content too: fetch only the application folder.
  git clone --depth 1 --branch "$BRANCH" --filter=blob:none --sparse "$REPO" "$DIR"
  git -C "$DIR" sparse-checkout set alshuyukh-accounting
fi
cd "$DIR/alshuyukh-accounting"

if [ ! -f deploy/.env ]; then
  say "Generating settings and secrets"
  if [ -z "${DOMAIN:-}" ]; then
    IP=$(curl -fsS4 https://api.ipify.org || curl -fsS http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
    DOMAIN="$(echo "$IP" | tr . -).sslip.io"
  fi
  umask 077
  cat > deploy/.env <<EOF
DOMAIN=$DOMAIN
PUBLIC_ORIGIN=https://$DOMAIN
POSTGRES_PASSWORD=$(openssl rand -hex 24)
OWNER_DB_PASSWORD=$(openssl rand -hex 24)
APP_DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
ZATCA_ENCRYPTION_KEY=$(openssl rand -base64 32)
ZATCA_WORKER=on
EOF
fi
DOMAIN=$(sed -n 's/^DOMAIN=//p' deploy/.env)

say "Building and starting (the first time takes a few minutes)"
COMPOSE="docker compose -f docker-compose.prod.yml -f docker-compose.https.yml --env-file deploy/.env"
$COMPOSE up -d --build

say "Waiting for the system to be ready"
i=0
until curl -fsS "https://$DOMAIN/api/ready" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Not ready after 5 minutes. Check: cd $DIR/alshuyukh-accounting && $COMPOSE logs --tail 50"
    exit 1
  fi
  sleep 5
done

# Daily backup at 02:15 UTC, kept for 14 days.
CRON="15 2 * * * cd $DIR/alshuyukh-accounting && ENV_FILE=deploy/.env scripts/backup.sh /var/backups/alshuyukh >> /var/log/alshuyukh-backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'alshuyukh-accounting && ENV_FILE' ; echo "$CRON" ) | crontab -

say "Done"
echo "Open:  https://$DOMAIN"
echo "Create your organization from \"أنشئ منشأة جديدة\". To get the platform admin panel (/admin) afterwards:"
echo "  cd $DIR/alshuyukh-accounting && $COMPOSE run --rm migrate node dist/admin-cli.js grant your@email"
}

main 2>&1 | tee -a /var/log/alshuyukh-install.log

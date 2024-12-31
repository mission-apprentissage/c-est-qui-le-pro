#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DNS_NAME_TEST=${1:?"Merci de préciser au moins un nom de domaine"}
readonly DNS_NAMES=("${@:1}")

start_reverse_proxy() {
  NO_UPDATE=true bash /opt/accompagnateur/start-app.sh "$(git --git-dir=/opt/accompagnateur/repository/.git rev-parse --abbrev-ref HEAD)" \
    --no-deps reverse_proxy
}

stop_reverse_proxy() {
  bash /opt/accompagnateur/stop-app.sh accompagnateur_reverse_proxy --no-deps reverse_proxy
}

renew_certificate() {
  cd "${SCRIPT_DIR}"
  docker build --tag accompagnateur_certbot certbot/
  docker run --rm --name accompagnateur_certbot \
    -p 80:5000 \
    -v /opt/accompagnateur/data/certbot:/etc/letsencrypt \
    -v /opt/accompagnateur/data/ssl:/ssl \
    accompagnateur_certbot renew "${DNS_NAMES[@]}"
  cd -
}

handle_error() {
  bash /opt/accompagnateur/tools/send-to-slack.sh "[SSL] Unable to renew certificate"
  start_reverse_proxy
}
trap handle_error ERR

echo "****************************"
echo "[$(date +'%Y-%m-%d_%H%M%S')] Running ${BASH_SOURCE[0]} $*"
echo "****************************"
stop_reverse_proxy
renew_certificate
start_reverse_proxy
bash /opt/accompagnateur/tools/send-to-slack.sh "[SSL] Certificat has been renewed"

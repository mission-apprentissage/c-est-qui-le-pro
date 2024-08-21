#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "/opt/accompagnateur/data/ssl/privkey.pem" ]; then
  cd "${SCRIPT_DIR}"
  docker build --tag accompagnateur_certbot certbot/
  docker run --rm --name accompagnateur_certbot \
    -p 80:5000 \
    -v /opt/accompagnateur/data/certbot:/etc/letsencrypt \
    -v /opt/accompagnateur/data/ssl:/ssl \
    accompagnateur_certbot generate "$@"
  cd -
else
  echo "Certificat SSL déja généré"
fi

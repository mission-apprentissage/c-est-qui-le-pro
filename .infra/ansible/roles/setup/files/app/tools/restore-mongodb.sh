#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BACKUP_FILE=${1:?"Please provide a backup file path"}
shift

echo "Restoring ${BACKUP_FILE}..."
bash "${SCRIPT_DIR}/gpg/decrypt.sh" <"${BACKUP_FILE}" |
  docker exec -i accompagnateur_mongodb bash -c "mongorestore --archive --gzip --drop -u backup -p {{ vault.ACCOMPAGNATEUR_MONGODB_BACKUP_PASSWORD }} $*"

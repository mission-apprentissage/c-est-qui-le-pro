#!/usr/bin/env bash
set -euo pipefail

readonly BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.."
readonly INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
readonly VAULT_DIR="${INFRA_DIR}/vault"
readonly VAULT_FILE="${VAULT_DIR}/vault.yml"
readonly ANSIBLE_DIR="${INFRA_DIR}/ansible"
readonly ENV_FILTER=${1:?"Merci de préciser un environnement (ex. dev, recette ou production)"}
readonly APP_VERSION=${2:?"Merci de préciser une version (tag de l'image docker)"}
readonly JOB_ARGS=${3:?"Merci de préciser un job (en json, ex : '[\"importAll\", \"-j\", \"test\"]'"}
readonly VAULT_PASSWORD_FILE=${VAULT_PASSWORD_FILE:="${INFRA_DIR}/scripts/vault/get-vault-password-client.sh"}

shift 3

echo "Lancement d'un job pour le déploiement ${APP_VERSION}..."
ansible-galaxy collection install community.docker
ansible-galaxy collection install kubernetes.core
ansible-playbook -e "ENV=${ENV_FILTER}" -e "APP_VERSION=${APP_VERSION}" \
    --extra-vars "@${VAULT_FILE}" \
    --vault-password-file="${VAULT_PASSWORD_FILE}" \
    -e "job_args='${JOB_ARGS}'" \
    -i "${INFRA_DIR}/env.ini" --limit "${ENV_FILTER}"  \
    "${ANSIBLE_DIR}/job.yml"

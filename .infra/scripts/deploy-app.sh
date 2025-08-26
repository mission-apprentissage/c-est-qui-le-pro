#!/usr/bin/env bash
#set -euo pipefail

readonly BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../.."
readonly INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
readonly VAULT_DIR="${INFRA_DIR}/vault"
readonly VAULT_FILE="${VAULT_DIR}/vault.yml"
readonly ANSIBLE_DIR="${INFRA_DIR}/ansible"
readonly ENV_FILTER=${1:?"Merci de préciser un environnement (ex. feature, recette ou production)"}
readonly APP_VERSION=${2:?"Merci de préciser une version (correspondra au tag des images docker)"}
readonly APP_NAMESPACE=${3:?"Merci de préciser un namespace (ex. recette, production ou nom de la branche)"}
readonly VAULT_PASSWORD_FILE=${VAULT_PASSWORD_FILE:="${INFRA_DIR}/scripts/vault/get-vault-password-client.sh"}

shift 3


echo "Création des images Docker et déploiement pour l'environnement ${ENV_FILTER}..."
ansible-galaxy collection install community.docker
ansible-playbook -i "${INFRA_DIR}/env.ini" --extra-vars "@${VAULT_FILE}" \
     --vault-password-file="${VAULT_PASSWORD_FILE}" \
    -e "BASE_DIR=${BASE_DIR}" -e "INFRA_DIR=${INFRA_DIR}" -e "APP_NAMESPACE=${APP_NAMESPACE}" \
    -e "APP_VERSION=${APP_VERSION}" -e "ENV=${ENV}" \
    --limit "${ENV_FILTER}" "${ANSIBLE_DIR}/deploy.yml" "$@"
cd -

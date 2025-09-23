#!/usr/bin/env bash
set -euo pipefail

echo "Setup du cluster Kubernetes"

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
readonly ANSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../ansible"
readonly VAULT_DIR="${SCRIPT_DIR}/../vault"
readonly VAULT_FILE="${VAULT_DIR}/vault.yml"
readonly ENV_DIR="${SCRIPT_DIR}/.."
readonly VAULT_PASSWORD_FILE=${VAULT_PASSWORD_FILE:="${INFRA_DIR}/scripts/vault/get-vault-password-client.sh"}

ansible-galaxy collection install community.general
ansible-galaxy collection install community.docker
ansible-galaxy collection install kubernetes.core

ansible-playbook -i "${ENV_DIR}/env.ini" --extra-vars "@${VAULT_FILE}" -e "vault_dir='${VAULT_DIR}'" --vault-password-file="${VAULT_PASSWORD_FILE}" --limit "cluster" "${ANSIBLE_DIR}/setup.yml" "$@"


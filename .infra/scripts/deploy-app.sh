#!/usr/bin/env bash
set -euo pipefail

readonly ANSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../ansible"
readonly ENV_FILTER=${1:?"Merci de préciser un ou plusieurs environnements (ex. recette ou production)"}
shift

echo "Déploiement sur l'(es) environnement(s) ${ENV_FILTER}..."
cd "${ANSIBLE_DIR}"
ansible_become_default=""
if [[ $* != *"pass"* ]]; then
    ansible_become_default="--ask-become-pass"
fi
ansible-playbook -i env.ini --limit "${ENV_FILTER}" ${ansible_become_default} deploy.yml "$@"
cd -

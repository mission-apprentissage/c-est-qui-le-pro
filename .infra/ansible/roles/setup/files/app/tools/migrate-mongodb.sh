#!/usr/bin/env bash
set -euo pipefail
#Needs to be run as sudo

bash /opt/accompagnateur/tools/backup-mongodb.sh
bash /opt/accompagnateur/cli.sh migrate

#!/bin/bash
set -e

# Execute the main script with environment variables
bash /scripts/entrypoint.sh -c "${CQLP_API}" -g "${GRAPHHOPPER_URL}" -d "${ISOCHRONE_DATE}" -p "${ISOCHRONE_PARALLEL}" "$@"

# Keep the container running
tail -f /dev/null

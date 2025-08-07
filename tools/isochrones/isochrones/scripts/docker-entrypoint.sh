#!/bin/sh
set -e

# Execute the main script with environment variables
python -u /scripts/isochrones.py -o /home/onyxia/work -c "${CQLP_API}" -g "${GRAPHHOPPER_URL}" -d "${ISOCHRONE_DATES}" -p "${ISOCHRONE_PARALLEL}" --resume "$@"

# Keep the container running
tail -f /dev/null

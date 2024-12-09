#!/bin/sh
set -e

java -Xmx$GRAPHHOPPER_MEMORY_LIMIT -Xms$GRAPHHOPPER_MEMORY_LIMIT -jar graphhopper-web-9.1.jar server config.yml

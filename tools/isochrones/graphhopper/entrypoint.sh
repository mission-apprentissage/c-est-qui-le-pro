#!/bin/sh
set -e

mkdir -p /home/onyxia/work/

if [ -d /home/onyxia/work/pbf ]; then
    echo "PBF files already exist"
else
    # Download pbf
    mkdir -p /home/onyxia/work/pbf
    cd /home/onyxia/work/pbf

    wget --progress=dot:giga https://download.geofabrik.de/europe/france-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/martinique-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/guadeloupe-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/mayotte-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/guyane-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/reunion-latest.osm.pbf

    # Merge pbf
    echo "Merging PBF files"
    osmium merge france-latest.osm.pbf martinique-latest.osm.pbf guadeloupe-latest.osm.pbf mayotte-latest.osm.pbf guyane-latest.osm.pbf reunion-latest.osm.pbf -o full.osm.pbf
fi

if [ -d /home/onyxia/work/gtfs ]; then
    echo "GTFS files already exist"
else
    # Download and clean gtfs
    mkdir -p /home/onyxia/work/gtfs
    cd /home/onyxia/work/gtfs
    bash /scripts/gtfs.sh
fi

cp /scripts/config.yml /home/onyxia/work/
cp /graphhopper/graphhopper-web-9.1.jar /home/onyxia/work/
cd /home/onyxia/work/

echo "Starting Graphhopper"

java -Xmx$GRAPHHOPPER_MEMORY_LIMIT -Xms$GRAPHHOPPER_MEMORY_LIMIT -jar graphhopper-web-9.1.jar server config.yml

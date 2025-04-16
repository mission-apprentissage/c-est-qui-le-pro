#!/bin/sh
set -e

# Use absolute path
script_path="/scripts"
base_path="/home/onyxia/work"
pbf_path="${base_path}/pbf"
gtfs_path="${base_path}/gtfs"

mkdir -p "$base_path"

if [ -d $pbf_path ]; then
    echo "PBF files already exist"
else
    # Download pbf
    mkdir -p $pbf_path
    cd $pbf_path

    wget --progress=dot:giga https://download.geofabrik.de/europe/france-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/martinique-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/guadeloupe-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/mayotte-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/guyane-latest.osm.pbf
    wget --progress=dot:giga https://download.geofabrik.de/europe/france/reunion-latest.osm.pbf

    # Merge pbf
    echo "Merging PBF files"
    osmium merge france-latest.osm.pbf martinique-latest.osm.pbf guadeloupe-latest.osm.pbf mayotte-latest.osm.pbf guyane-latest.osm.pbf reunion-latest.osm.pbf -o full.osm.pbf
    rm france-latest.osm.pbf martinique-latest.osm.pbf guadeloupe-latest.osm.pbf mayotte-latest.osm.pbf guyane-latest.osm.pbf reunion-latest.osm.pbf
fi

if [ -d $gtfs_path ]; then
    echo "GTFS files already exist"
else
    # Download and clean gtfs
    mkdir -p $gtfs_path
    cd $gtfs_path
    bash "${script_path}/gtfs.sh"
fi

cp "${script_path}/config.yml" $base_path
cp /graphhopper/graphhopper-web-9.1.jar $base_path
cd $base_path

echo "Starting Graphhopper"

java -XX:+UseShenandoahGC -XX:ActiveProcessorCount=$GRAPHHOPPER_CPU_COUNT -Xmx$GRAPHHOPPER_MEMORY_LIMIT -Xms$GRAPHHOPPER_MEMORY_LIMIT -jar graphhopper-web-9.1.jar server config.yml

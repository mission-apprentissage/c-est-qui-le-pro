#!/bin/bash
set -e

cd /data

curl ${CQLP_API}/api/etablissements >etablissements.json

mkdir -p isochrones

# Create isochrones scripts
GRAPHHOPPER_URL=http://graphhopper:8989

TIMES=(5400 3600 2700 1800 900)
for TIME in ${TIMES[@]}; do
    mkdir -p isochrones/${TIME}
    jq --raw-output '.[] | select(.latitude!=null)| "\(.uai),\(.latitude),\(.longitude)"' etablissements.json |
        awk -F, -v GRAPHHOPPER_URL="$GRAPHHOPPER_URL" -v DATE="$ISOCHRONE_DATE" -v TIME="$TIME" '{print "curl \""GRAPHHOPPER_URL"/isochrone?point="$2","$3"&profile=pt&pt.earliest_departure_time="DATE"&time_limit="TIME"&buckets=1&result=multipolygon&reverse_flow=true\" > isochrones/"TIME"/"$1".json"}' >liste_${TIME}
done

# Get isochrones
for TIME in ${TIMES[@]}; do
    parallel -j $ISOCHRONE_PARALLEL bash -c "{}" <liste_${TIME}
done

#!/bin/bash
set -e

cd /data

curl ${CQLP_API}/api/etablissements >etablissements.json

mkdir -p isochrones

# Create isochrones scripts
readonly GRAPHHOPPER_URL=$GRAPHHOPPER_URL
readonly GRAPHHOPPER_PROFILE=${1:?"Merci de préciser un profil (ex: pt ou bike)"}
shift

TIMES=(5400 3600 2700 1800 900)
for TIME in ${TIMES[@]}; do
    mkdir -p isochrones/${GRAPHHOPPER_PROFILE}/${TIME}
    jq --raw-output '.[] | select(.latitude!=null)| "\(.uai),\(.latitude),\(.longitude)"' etablissements.json |
        awk -F, -v GRAPHHOPPER_PROFILE="$GRAPHHOPPER_PROFILE" -v GRAPHHOPPER_URL="$GRAPHHOPPER_URL" -v DATE="$ISOCHRONE_DATE" -v TIME="$TIME" '{print "curl \""GRAPHHOPPER_URL"/isochrone?point="$2","$3"&profile="GRAPHHOPPER_PROFILE"&pt.earliest_departure_time="DATE"&time_limit="TIME"&buckets=1&result=multipolygon&reverse_flow=true\" > isochrones/"GRAPHHOPPER_PROFILE"/"TIME"/"$1".json"}' >liste_${GRAPHHOPPER_PROFILE}_${TIME}
done

# Get isochrones
for TIME in ${TIMES[@]}; do
    parallel -j $ISOCHRONE_PARALLEL bash -c "{}" <liste_${GRAPHHOPPER_PROFILE}_${TIME}
done

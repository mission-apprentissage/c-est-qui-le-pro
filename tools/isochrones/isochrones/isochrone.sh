#!/bin/bash
set -e

readonly GRAPHHOPPER_URL=$GRAPHHOPPER_URL
readonly ISOCHRONE_DATE=$ISOCHRONE_DATE
readonly ISOCHRONE_PARALLEL=$ISOCHRONE_PARALLEL
readonly GRAPHHOPPER_PROFILE=${1:?"Merci de préciser un profil (ex: pt ou bike)"}
readonly DATE=${2:?"Merci de préciser une date"}
readonly TIME=${3:?"Merci de préciser un durée"}
readonly UAI=${4:?"Merci de préciser un uai"}
readonly LATITUDE=${5:?"Merci de préciser une latitude"}
readonly LONGITUDE=${6:?"Merci de préciser une longitude"}
readonly RESULT_FILE="done_${GRAPHHOPPER_PROFILE}_${TIME}"

mkdir -p isochrones/${GRAPHHOPPER_PROFILE}/${TIME}

curl --no-progress-meter "${GRAPHHOPPER_URL}/isochrone?point=${LATITUDE},${LONGITUDE}&profile=${GRAPHHOPPER_PROFILE}&pt.earliest_departure_time=${DATE}&time_limit=${TIME}&buckets=1&result=multipolygon&reverse_flow=true" >isochrones/${GRAPHHOPPER_PROFILE}/${TIME}/${UAI}.json
echo "done: ${UAI}" >>${RESULT_FILE}

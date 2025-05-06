#!/bin/bash
set -e

readonly GRAPHHOPPER_URL=${1:?"Merci de préciser l'url de Graphhopper"}
readonly GRAPHHOPPER_PROFILE=${2:?"Merci de préciser un profil (ex: pt ou bike)"}
readonly DATE=${3:?"Merci de préciser une date"}
readonly TIME=${4:?"Merci de préciser un durée"}
readonly UAI=${5:?"Merci de préciser un uai"}
readonly LATITUDE=${6:?"Merci de préciser une latitude"}
readonly LONGITUDE=${7:?"Merci de préciser une longitude"}
readonly RESULT_FILE="done_${GRAPHHOPPER_PROFILE}_${TIME}"

mkdir -p isochrones/${GRAPHHOPPER_PROFILE}/${TIME}

curl --retry 5 --no-progress-meter "${GRAPHHOPPER_URL}/isochrone?point=${LATITUDE},${LONGITUDE}&profile=${GRAPHHOPPER_PROFILE}&pt.earliest_departure_time=${DATE}&time_limit=${TIME}&buckets=1&result=multipolygon&reverse_flow=true" >isochrones/${GRAPHHOPPER_PROFILE}/${TIME}/${UAI}.json
echo "done: ${UAI}"
echo "done: ${UAI}" >>${RESULT_FILE}

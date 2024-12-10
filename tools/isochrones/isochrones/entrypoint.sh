#!/bin/bash
set -e

curl ${CQLP_API}/api/etablissements >etablissements.json

mkdir -p isochrones

# Create isochrones scripts
readonly GRAPHHOPPER_URL=$GRAPHHOPPER_URL
readonly ISOCHRONE_DATE=$ISOCHRONE_DATE
readonly ISOCHRONE_PARALLEL=$ISOCHRONE_PARALLEL
readonly GRAPHHOPPER_PROFILES=${*:?"Merci de préciser au moin un profil (ex: pt ou bike)"}

shift

TIMES=(5400 3600 2700 1800 900)

for GRAPHHOPPER_PROFILE in ${GRAPHHOPPER_PROFILES}; do
    for TIME in ${TIMES[@]}; do
        mkdir -p isochrones/${GRAPHHOPPER_PROFILE}/${TIME}
        jq --raw-output '.[] | select(.latitude!=null)| "\(.uai) \(.latitude) \(.longitude)"' etablissements.json |
            awk -F, -v GRAPHHOPPER_PROFILE="$GRAPHHOPPER_PROFILE" -v ISOCHRONE_DATE="$ISOCHRONE_DATE" -v TIME="$TIME" '{print GRAPHHOPPER_PROFILE" "ISOCHRONE_DATE" "TIME" "$1" "$2" "$3}' >liste_${GRAPHHOPPER_PROFILE}_${TIME}
    done

    # Get isochrones
    for TIME in ${TIMES[@]}; do
        cat liste_${GRAPHHOPPER_PROFILE}_${TIME} | parallel --colsep ' ' --halt-on-error now,fail=1 -j $ISOCHRONE_PARALLEL bash isochrone.sh {1} {2} {3} {4} {5} {6}
    done
done

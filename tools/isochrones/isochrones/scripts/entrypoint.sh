#!/bin/bash
set -e

# Use absolute path
readonly SCRIPT_PATH="/scripts"
readonly BASE_PATH="/home/onyxia/work"
readonly TIMES=(5400 3600 2700 1800 900)

show_help() {
    echo "Usage: $0 [OPTIONS] PROFILE1 [PROFILE2 ...]"
    echo
    echo "Options:"
    echo "  -c URL   URL for the CQLP API (required)"
    echo "  -g URL   URL for the GraphHopper service (required)"
    echo "  -d DATE  Date for isochrone calculation (required)"
    echo "  -p N     Number of parallel executions (required)"
    echo "  -h       Show this help message"
    echo
    echo "At least one profile (e.g., pt or bike) must be specified."
    exit 1
}

while getopts "c:g:d:p:h" opt; do
    case ${opt} in
    c) CQLP_API="$OPTARG" ;;
    g) GRAPHHOPPER_URL="$OPTARG" ;;
    d) ISOCHRONE_DATE="$OPTARG" ;;
    p) ISOCHRONE_PARALLEL="$OPTARG" ;;
    h) show_help ;;
    \?)
        echo "Invalid option: -$OPTARG" >&2
        show_help
        ;;
    :)
        echo "Option -$OPTARG requires an argument." >&2
        show_help
        ;;
    esac
done

# Shift all the processed options
shift $((OPTIND - 1))

# Check required parameters
if [ -z "$CQLP_API" ] || [ -z "$GRAPHHOPPER_URL" ] || [ -z "$ISOCHRONE_DATE" ] || [ -z "$ISOCHRONE_PARALLEL" ]; then
    echo "Error: Missing required parameters" >&2
    show_help
fi

# Check if at least one profile is specified
if [ "$#" -eq 0 ]; then
    echo "Error: At least one profile (e.g., pt or bike) must be specified" >&2
    show_help
fi

readonly GRAPHHOPPER_PROFILES=$@

mkdir -p "$BASE_PATH"
cp ${SCRIPT_PATH}/* ${BASE_PATH}
cd ${BASE_PATH}

curl ${CQLP_API}/api/etablissements >etablissements.json

mkdir -p isochrones

for GRAPHHOPPER_PROFILE in ${GRAPHHOPPER_PROFILES}; do
    for TIME in ${TIMES[@]}; do
        mkdir -p isochrones/${GRAPHHOPPER_PROFILE}/${TIME}
        jq --raw-output '.[] | select(.latitude!=null)| "\(.uai) \(.latitude) \(.longitude)"' etablissements.json |
            awk -F, -v GRAPHHOPPER_URL="$GRAPHHOPPER_URL" -v GRAPHHOPPER_PROFILE="$GRAPHHOPPER_PROFILE" -v ISOCHRONE_DATE="$ISOCHRONE_DATE" -v TIME="$TIME" '{print GRAPHHOPPER_URL" "GRAPHHOPPER_PROFILE" "ISOCHRONE_DATE" "TIME" "$1" "$2" "$3}' >liste_${GRAPHHOPPER_PROFILE}_${TIME}
    done

    # Get isochrones
    for TIME in ${TIMES[@]}; do
        cat liste_${GRAPHHOPPER_PROFILE}_${TIME} | parallel --colsep ' ' --halt-on-error now,fail=1 -j $ISOCHRONE_PARALLEL bash isochrone.sh {1} {2} {3} {4} {5} {6} {7}
    done
done

echo "Creating isochrones done"

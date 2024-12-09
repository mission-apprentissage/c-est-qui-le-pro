#!/bin/bash
set -e

function download_and_clean() {
    wget $*
    filename=$(basename "$*")
    $(go env GOPATH)/bin/gtfsclean -SCRmTcdsOeD $filename
    cd gtfs-out
    zip -0 $filename *
    mv $filename ..
}

download_and_clean https://eu.ftp.opendatasoft.com/stif/GTFS/IDFM-gtfs.zip
download_and_clean https://www.korrigo.bzh/ftp/OPENDATA/KORRIGOBRET.gtfs.zip
download_and_clean https://eu.ftp.opendatasoft.com/sncf/plandata/export-ter-gtfs-last.zip

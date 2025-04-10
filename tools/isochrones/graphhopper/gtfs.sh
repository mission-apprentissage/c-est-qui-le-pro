#!/bin/bash
set -e

OS=$(uname)

function fix_empty_tranfer_type() {
    if [ -f transfers.txt ]; then
        awk -F, '
  NR==1 { 
    for (i=1; i<=NF; i++) {
      if ($i == "transfer_type") {
        col = i;
        break;
      }
    }
    print;
    next;
  }
  {
    if ($col == "") {
      $col = "0";
    }
    OFS=",";
    print;
  }
' transfers.txt >transfers.tmp
        mv transfers.tmp transfers.txt
    fi
}

function download_and_clean() {
    local url="$1"
    local filename="$2"
    local zip_folder="$3"
    local coordinate_correction="$4"

    wget --progress=dot:giga -O "$filename" "$url"

    # Some GTFS zip has a subfolder
    if [[ "$zip_folder" == "1" ]]; then
        mkdir tmp
        unzip "$filename" -d tmp
        cd tmp && cd "$(ls -d */ | head -1 | tr -d '/')"
        zip -0 "$filename" *
        mv "$filename" ../..
        cd ../..
        rm -Rf tmp
    fi

    # Correction of latitude/longitude with a "+" sign
    if [[ "$coordinate_correction" == "1" ]]; then
        mkdir tmp
        unzip "$filename" -d tmp
        cd tmp
        if [ "$OS" = "Darwin" ]; then
            # shapes.txt
            sed -i '' 's/+\([0-9.]\)/\1/g' shapes.txt
            # stops.txt
            sed -i '' 's/+\([0-9.]\)/\1/g' stops.txt
        else
            # shapes.txt
            sed -i 's/+\([0-9.]\)/\1/g' shapes.txt
            # stops.txt
            sed -i 's/+\([0-9.]\)/\1/g' stops.txt
        fi

        zip -0 "$filename" *
        mv "$filename" ../
        cd ../
        rm -Rf tmp
    fi

    $(go env GOPATH)/bin/gtfsclean -SCRmTcsOeD "$filename"
    cd gtfs-out
    fix_empty_tranfer_type
    zip -0 "$filename" *
    mv "$filename" ..
    cd ..
    rm -Rf gtfs-out
}

echo "Downloading GTFS files"

# 01 Guadeloupe
# Pas de source

# 02 Martinique
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/d910480b-c9a5-4f48-a257-4e1aa799c5c8" "martinique-sud.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/82481c27-2e52-40ef-a563-b011ba487ead" "martinique-nord.zip" 1 1
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/6e599077-0719-44b4-82ad-0da90a282846" "martinique-centre.zip"

# 03 Guyane
# Pas de source

# 04 La Réunion
download_and_clean "https://pysae.com/api/v2/groups/car-jaune/gtfs/pub" "reunion-p1.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/fc065c47-8644-4941-a8ca-4d8322a45749" "reunion-p2.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/919b4ca6-11e3-4156-bf59-5c0e7f25d929" "reunion-p3.zip" 0 1
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/8f3642e3-9fc3-45ed-af46-8c532966ace3" "reunion-p4.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/c9c2f609-d0cd-4233-ad1b-cf86b9bf2dc8" "reunion-p5.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/6fee690a-f80c-4083-ac19-34341b864fe8" "reunion-p6.zip"

# 05 Mayotte
# Pas de source

# 11 Ile de france
download_and_clean "https://eu.ftp.opendatasoft.com/stif/GTFS/IDFM-gtfs.zip" "ile-de-france.zip"

# 24 Centre-Val de Loire
download_and_clean "https://data.centrevaldeloire.fr/api/explore/v2.1/catalog/datasets/jvmalin-point-dacces-national/files/e4c49416b6a28d91287b6c81b8ba0569" "centre-val-de-loire.zip"

# 27 Bourgogne-Franche-Comté
# Doubs
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT25" "bfc-doubs.zip"
# Côte d'Or
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT21" "bfc-cote-dor.zip"
# Nièvre
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT58" "bfc-nievre.zip"
# Haute-Saône
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT70" "bfc-haute-saone.zip"
# Saône et Loire
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT71" "bfc-saone-et-loire.zip"
# Jura
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT39" "bfc-jura.zip"
# Yonne
download_and_clean "https://exs.mobigo.cityway.fr/gtfs.aspx?key=OPENDATA&operatorCode=UT89" "bfc-yonne.zip"

# 28 Normandie
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/3873ccc7-44d9-40f3-a133-920944af0c29" "normandie.zip"

# 32 Hauts-de-France
# Aisne
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_02.zip" "hdf-aisne.zip"
# Somme
download_and_clean "https://sig.hautsdefrance.fr/ext/opendata/Transport/GTFS/80/RHDF_GTFS_COM_80.zip" "hdf-somme.zip"
# Pas-de-Calais
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_62.zip" "hdf-pas-de-calais.zip"
# Oise
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_60_P1.zip" "hdf-oise-p1.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_60_P2.zip" "hdf-oise-p2.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_60_P3.zip" "hdf-oise-p3.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_60_P4.zip" "hdf-oise-p4.zip"
# Nord
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_59_P1.zip" "hdf-nord-p1.zip"
# Le dernier fichier est corrompu, utilisation d'une archive
# download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_59_P2.zip" "hdf-nord-p2.zip"
download_and_clean "https://transport-data-gouv-fr-resource-history-prod.cellar-c2.services.clever-cloud.com/81829/81829.20250405.000930.740393.zip" "hdf-nord-p2.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_59_P3A.zip" "hdf-nord-p3a.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_59_P3B.zip" "hdf-nord-p3b.zip"
download_and_clean "https://geocatalogue.hautsdefrance.fr/gtfs/RHDF_GTFS_COM_SCO_59_P4.zip" "hdf-nord-p4.zip"

# 44 Grand Est
# Ardennes
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0045-0000/fluo-grand-est-fluo08-gtfs.zip" "ge-ardennes.zip"
# Aube
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0046-0000/fluo-grand-est-fluo10-gtfs.zip" "ge-aube.zip"
# Bas-Rhin
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0049-0000/fluo-grand-est-fluo67-gtfs.zip" "ge-bas-rhin.zip"
# Haute-Marne
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0055-0000/fluo-grand-est-fluo52-gtfs.zip" "ge-haute-marne.zip"
# Haut-Rhin
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0050-0000/fluo-grand-est-fluo68-gtfs.zip" "ge-haut-rhin.zip"
# Marne
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0043-0000/fluo-grand-est-fluo51-gtfs.zip" "ge-marne.zip"
# Meurthe-et-Moselle
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0051-0000/fluo-grand-est-fluo54-gtfs.zip" "ge-meurthe.zip"
# Meuse
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0048-0000/fluo-grand-est-fluo55-gtfs.zip" "ge-meuse.zip"
# Moselle
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0052-0000/fluo-grand-est-fluo57-gtfs.zip" "ge-moselle.zip"
# Vosges
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0042-0000/fluo-grand-est-fluo88-gtfs.zip" "ge-vosges.zip"

# 52 Pays de la Loire
download_and_clean "https://mobi-iti-pdl.okina.fr/static/mobiiti_technique/gtfs_global.zip" "pays-de-la-loire.zip"

# 53 Bretagne
download_and_clean "https://www.korrigo.bzh/ftp/OPENDATA/KORRIGOBRET.gtfs.zip" "bretagne.zip"

# 75 Nouvelle-Aquitaine
# La dernière version du fichier n'est pas valide, utilisation d'une archive
# download_and_clean "https://www.pigma.org/public/opendata/nouvelle_aquitaine_mobilites/publication/naq-aggregated-gtfs.zip" "nouvelle-aquitaine.zip"
download_and_clean "https://transport-data-gouv-fr-resource-history-prod.cellar-c2.services.clever-cloud.com/82321/82321.20250317.121156.855887.zip" "nouvelle-aquitaine.zip"

# 76 Occitanie
download_and_clean "https://app.mecatran.com/utw/ws/gtfsfeed/static/lio?apiKey=2b160d626f783808095373766f18714901325e45&type=gtfs_lio" "occitanie.zip"

# 84 Auvergne-Rhône-Alpes
download_and_clean "https://mobi-iti-ara.okina.fr/static/mobiiti_technique/DAT_AURA_GTFS_ExportAOM.zip" "auvergne.zip"

# 93 Provence-Alpes-Côte d'Azur
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/3745/resource/5016/download/" "provence-p1.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/3743/resource/5153/download/" "provence-p2.zip"

# 94 Corse
# Haute Corse
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f6fe5d5a-8ad7-4de2-a1b1-ea1f5eacd16a" "corse-haute.zip"
# Corse du Sud
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/416261b8-016d-4639-bab5-39a588665fc7" "corse-sud.zip"

# TER national
download_and_clean "https://eu.ftp.opendatasoft.com/sncf/plandata/export-ter-gtfs-last.zip" "ter-national.zip"

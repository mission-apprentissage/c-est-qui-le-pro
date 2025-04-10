#!/bin/bash
set -e

OS=$(uname)

function fix_empty_tranfer_type() {
    if [ -f transfers.txt ]; then
        awk -F, '
    BEGIN { OFS="," }
      
    NR==1 { 
        # Find the position of transfer_type column
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
        # Replace empty transfer_type with "0"
        if ($col == "") {
            $col = "0";
            # Force record reconstruction with proper OFS
            $1=$1;
        }
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

# Réseaux urbains
# 76 Occitanie
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=figeac" "occitanie-urbain-01.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=tum" "occitanie-urbain-02.zip"
download_and_clean "https://data.toulouse-metropole.fr/explore/dataset/tisseo-gtfs/files/fc1dda89077cf37e4f7521760e0ef4e9/download/" "occitanie-urbain-03.zip"
download_and_clean "https://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_GTFS.zip" "occitanie-urbain-04.zip"
download_and_clean "https://data.montpellier3m.fr/TAM_MMM_GTFSRT/GTFS.zip" "occitanie-urbain-05.zip"
download_and_clean "https://eur.mecatran.com/utw/ws/gtfsfeed/static/perpignan?apiKey=612f606b5e3b0a3e6e1f441a2c4a050f6a345b55" "occitanie-urbain-06.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/15aeb8a5-1cca-4bb9-ae5f-b6e67e4ff2ab" "occitanie-urbain-07.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/b9a0f32e-4386-454c-8759-b82653fa861e" "occitanie-urbain-08.zip"
download_and_clean "https://s3.eu-west-1.amazonaws.com/files.orchestra.ratpdev.com/networks/narbonne/exports/scolaires-sans-tad.zip" "occitanie-urbain-09.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/dccec367-3055-471a-8778-eff45ac9c52c" "occitanie-urbain-10.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/1e710c81-2f14-4423-8eec-decb3930099a" "occitanie-urbain-11.zip"
download_and_clean "https://drive.google.com/uc?export=download&id=1JPmGimO4tfQpzL8A0ixYnYrPDehYILWn" "occitanie-urbain-12.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/941123b0-004e-4f48-81e7-8c62fb4f07aa" "occitanie-urbain-13.zip"
## ERREUR
# download_and_clean "https://www.data.gouv.fr/fr/datasets/r/39b021ab-aca2-477c-9c78-60e37387e06d" "occitanie-urbain-14.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/79bc8313-3499-4bb3-a809-a8d80b44000a" "occitanie-urbain-15.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/eff42667-b36b-4334-bc44-6cf620f90cbf" "occitanie-urbain-16.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/15878ceb-7c8f-4546-bb0f-c540a15f2188" "occitanie-urbain-17.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/3a917f56-ef8f-428d-8608-bb904952dead" "occitanie-urbain-18.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/257e5818-a7cc-49a4-8ad1-3e84827e6458" "occitanie-urbain-19.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/6f4deabd-1cad-435c-8915-235132d74291" "occitanie-urbain-20.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/75f3dd86-0840-445a-92a6-b329bdc61e0c" "occitanie-urbain-21.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=agdecapbus68429531" "occitanie-urbain-22.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f17028a4-61ff-4b84-8856-f7c8937a2c28" "occitanie-urbain-23.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=auch-alliance" "occitanie-urbain-24.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/bbbd5a29-2fbf-47ae-84fd-6d1ebb758eeb" "occitanie-urbain-25.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/1f768fa6-ee56-44d8-b322-75b946128fd8" "occitanie-urbain-26.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/70c9f936-129e-41f4-940a-8e6f272535d1" "occitanie-urbain-27.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/8c9dd4f7-f6a2-4760-915e-89e8f9666c5b" "occitanie-urbain-28.zip"
## SOUS DOSSIER
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/b38a8202-1d7e-4345-964c-f07a335ea90b" "occitanie-urbain-29.zip" 1
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0163a7b9-f4b1-4d9b-9af1-dcc0e583c3b4" "occitanie-urbain-30.zip"

# 94 Corse
download_and_clean "https://pysae.com/api/v2/groups/porto-vecchio/gtfs/pub" "corse-urbain-01.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0057a43c-66be-4584-92a3-6e15a7156102" "corse-urbain-02.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/2b6f8e49-4818-4d0a-9c4d-e25baacaf9fc" "corse-urbain-03.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f88dae7d-cf93-4a4b-aa82-9256d5f3cefc" "corse-urbain-04.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/3f08460c-8ec7-4b9e-a244-8855292b9e24" "corse-urbain-05.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/97dffc79-5284-4da7-b4f0-6dcea3b53f01" "corse-urbain-06.zip"

# 27 Bourgogne-Franche-Comté
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/e0dbd217-15cd-4e28-9459-211a27511a34" "bfc-urbain-01.zip"
download_and_clean "https://api.ginko.voyage/gtfs-ginko.zip" "bfc-urbain-02.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/797c424e-7d28-4e65-84f6-6677e47d8a6e" "bfc-urbain-03.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/b45aa8d8-4bd4-4528-99c7-acfc980fdb09" "bfc-urbain-04.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f11a3766-1fe3-40ff-8d5a-27eacda3d9a7" "bfc-urbain-05.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/4f3f820f-3dd8-4ec5-9e0a-98b4c85f9a99" "bfc-urbain-06.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/ad03b8ed-b904-4c23-aa4d-7544ea531a67" "bfc-urbain-07.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0b65dda9-51d3-4d84-811b-8a11629a5e55" "bfc-urbain-08.zip"
#SOUS DOSSIER
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/ade0bfc2-0e7a-4087-96dd-a76aeb61d196" "bfc-urbain-09.zip" 1
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/5f2edbfa-9025-467d-b769-80f4b1ec4ba6" "bfc-urbain-10.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/a8c743ee-e2d4-408c-ac4b-6434b6eaadf9" "bfc-urbain-11.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/c00d487c-4766-4ca1-b736-e7de110331d9" "bfc-urbain-12.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0fd67eb8-24a4-4ae0-b98b-b442f74244e1" "bfc-urbain-13.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/ec61df69-830c-4ca7-9d78-9a81c515e9de" "bfc-urbain-14.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0d6e6c56-8926-49b3-87e2-13c6f57c136b" "bfc-urbain-15.zip"

# 32 Hauts-de-France
download_and_clean "https://media.ilevia.fr/opendata/gtfs.zip" "hdf-urbain-01.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/d4efef07-b80d-4922-af53-1599f5b5628a" "hdf-urbain-02.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/15438966-8d3c-4dd9-8905-189379ea4c7d" "hdf-urbain-03.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/99cf5e2f-87c2-4ff1-bc0d-32f04cc213ab" "hdf-urbain-04.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f51fabfb-9d7a-44b7-bd03-d1032337fb80" "hdf-urbain-05.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/571e3014-066d-4bd6-9f73-fb8065c928c6" "hdf-urbain-06.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f86c61bb-97c4-40de-8e2c-85f2b728dd38" "hdf-urbain-07.zip"
download_and_clean "https://s3.eu-west-1.amazonaws.com/files.orchestra.ratpdev.com/networks/boulogne/exports/medias.zip" "hdf-urbain-08.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/e3ff01b4-bac9-40b6-83a3-4b91ce0045b5" "hdf-urbain-09.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=COROLIS_INT&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-10.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=COROLIS_URB&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-11.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=AXO&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-12.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/584491f9-0ace-4ee2-a49e-23caedb6f3f1" "hdf-urbain-13.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=TIC_INT&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-14.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=TIC_URB&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-15.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=ALLOTIC&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-16.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/42e3ea9d-251e-47c1-988d-f7227f0e2d0f" "hdf-urbain-17.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/d00d1684-6980-4f84-ac38-363b6f058a68" "hdf-urbain-18.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/71a54454-5b15-4398-991c-b8cb47f0cf93" "hdf-urbain-19.zip"
# SOUS DOSSIER
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/0a10e218-937c-4795-b9e7-c81533a38446" "hdf-urbain-20.zip" 1
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/b66f3a43-2ba1-4b61-8459-439104582a92" "hdf-urbain-21.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/ba655521-6926-47d9-9185-3ec7252aaccd" "hdf-urbain-22.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=CYPRE&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-23.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/f56b6c9c-0a25-4d87-a1b1-4b108e3d0a22" "hdf-urbain-24.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/6b80d2f2-ecd4-4b52-b481-c8b715ae8948" "hdf-urbain-25.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=PASSTHELLE&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-26.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=SABLONS&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-27.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=CCAC&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-28.zip"
download_and_clean "https://s3.eu-west-1.amazonaws.com/files.orchestra.ratpdev.com/networks/tul-gares/exports/medias.zip" "hdf-urbain-29.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=TOHM&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-30.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=LIBBUS&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-31.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/39bc7064-a387-4eef-9fb3-05fe3c00782b" "hdf-urbain-32.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=LEBUS&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-33.zip"
download_and_clean "https://api.oisemob.cityway.fr/dataflow/offre-tc/download?provider=HOPLA&dataFormat=GTFS&dataProfil=OPENDATA" "hdf-urbain-34.zip"

# 44 Grand Est
download_and_clean "https://opendata.cts-strasbourg.eu/google_transit.zip" "ge-urbain-01.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0031-0000/fluo-grand-est-rei-gtfs.zip" "ge-urbain-02.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0014-0000/fluo-grand-est-sitram-gtfs.zip" "ge-urbain-03.zip"
# MAYBE ERROR
download_and_clean "https://eu.ftp.opendatasoft.com/mulhouse/TRANSPORT_GTFS/SOLEA.GTFS_current.zip" "ge-urbain-04.zip"
download_and_clean "https://hstan.g-ny.eu/gtfs/gtfs_stan.zip" "ge-urbain-05.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0039-0000/fluo-grand-est-lesub-gtfs.zip" "ge-urbain-06.zip"
download_and_clean "https://data.lemet.fr/documents/LEMET-gtfs.zip" "ge-urbain-07.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0040-0000/fluo-grand-est-citeline-gtfs.zip" "ge-urbain-08.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/764e07f3-4297-44ac-810e-f3db295dbef6" "ge-urbain-09.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0002-0000/fluo-grand-est-chm-gtfs.zip" "ge-urbain-10.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0004-0000/fluo-grand-est-cac-gtfs.zip" "ge-urbain-11.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0009-0000/fluo-grand-est-imagine-gtfs.zip" "ge-urbain-12.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=haguenau" "ge-urbain-13.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0008-0000/fluo-grand-est-haguenau-gtfs.zip" "ge-urbain-14.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0005-0000/fluo-grand-est-cec-gtfs.zip" "ge-urbain-15.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/2be619cf-5240-4679-ba3f-57f09f6156cb" "ge-urbain-16.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0007-0000/fluo-grand-est-forbus-gtfs.zip" "ge-urbain-17.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/ec0dcec8-ff9d-4097-b4ec-f6932850ae2b" "ge-urbain-18.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0038-0000/fluo-grand-est-lefil-gtfs.zip" "ge-urbain-19.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0016-0000/fluo-grand-est-deobus-gtfs.zip" "ge-urbain-20.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0001-0000/fluo-grand-est-cabus-gtfs.zip" "ge-urbain-21.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0017-0000/fluo-grand-est-cc3f-gtfs.zip" "ge-urbain-22.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0010-0000/fluo-grand-est-sdz-gtfs.zip" "ge-urbain-23.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0015-0000/fluo-grand-est-transavold-gtfs.zip" "ge-urbain-24.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0012-0000/fluo-grand-est-epy-gtfs.zip" "ge-urbain-25.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0026-0000/fluo-grand-est-isibus-gtfs.zip" "ge-urbain-26.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0027-0000/fluo-grand-est-movia-gtfs.zip" "ge-urbain-27.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0029-0000/fluo-grand-est-lan-gtfs.zip" "ge-urbain-28.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0022-0000/fluo-grand-est-lesit-gtfs.zip" "ge-urbain-29.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0023-0000/fluo-grand-est-lebus-gtfs.zip" "ge-urbain-30.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0003-0000/fluo-grand-est-tub-gtfs.zip" "ge-urbain-31.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0020-0000/fluo-grand-est-ccselestat-gtfs.zip" "ge-urbain-32.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0054-0000/fluo-grand-est-selverm-gtfs.zip" "ge-urbain-33.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=sel-et-vermois" "ge-urbain-34.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0025-0000/fluo-grand-est-tmm-gtfs.zip" "ge-urbain-35.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0006-0000/fluo-grand-est-cht-gtfs.zip" "ge-urbain-36.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/e25586ac-9c14-4872-b00e-e66cd23d4413" "ge-urbain-37.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0041-0000/fluo-grand-est-obernai-gtfs.zip" "ge-urbain-38.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0030-0000/fluo-grand-est-smd-gtfs.zip" "ge-urbain-39.zip"
download_and_clean "https://www.datagrandest.fr/metadata/fluo-grand-est/FR-200052264-T0011-0000/fluo-grand-est-tiv-gtfs.zip" "ge-urbain-40.zip"

# 93 Provence-Alpes-Côte d'Azur
download_and_clean "https://app.mecatran.com/utw/ws/gtfsfeed/static/mamp?apiKey=60327e505a214c77303f52206f11483069257343" "paca-urbain-01.zip"
download_and_clean "https://transport.data.gouv.fr/resources/79642/download" "paca-urbain-02.zip"
download_and_clean "https://s3.eu-west-1.amazonaws.com/files.orchestra.ratpdev.com/networks/rd-toulon/exports/gtfs-complet.zip" "paca-urbain-03.zip"
download_and_clean "https://open-share.agglo-casa.fr/s/34FS2SWg36NEZk4/download" "paca-urbain-04.zip"
download_and_clean "https://exs.tcra2.cityway.fr/gtfs.aspx?key=UID&operatorCode=TCRA" "paca-urbain-05.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/47bc8088-6c72-43ad-a959-a5bbdd1aa14f" "paca-urbain-06.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/1760/resource/2210/download/" "paca-urbain-07.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/851decd7-714f-45ad-9579-d60c06fad9dd" "paca-urbain-08.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/1311/resource/5230/download/" "paca-urbain-09.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/52216d2f-072e-4b7d-af0c-15d8d4e98b09" "paca-urbain-10.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/1224/resource/4791/download/" "paca-urbain-11.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/72609821-2459-47fb-a63b-3dbbc0d96c92" "paca-urbain-12.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/2268/resource/5566/download/" "paca-urbain-13.zip"
download_and_clean "https://www.datasud.fr/fr/dataset/datasets/3941/resource/5123/download/" "paca-urbain-14.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/a67da149-19bc-445d-b2d3-855fd82aa240" "paca-urbain-15.zip"
download_and_clean "https://pysae.com/api/v2/groups/st-tropez/gtfs/pub" "paca-urbain-16.zip"
download_and_clean "https://zenbus.net/gtfs/static/download.zip?dataset=cavaillon" "paca-urbain-17.zip"
download_and_clean "https://gtfs-rt.infra-hubup.fr/cagtd/current/revision/gtfs" "paca-urbain-18.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/21b768a8-28d1-4f18-a7b0-c848da95d95e" "paca-urbain-19.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/5b2dfdce-8ab2-41b2-a318-65f884e3ead2" "paca-urbain-20.zip"
download_and_clean "https://exs.sud.cityway.fr/gtfs.aspx?key=SUD&operatorCode=ORANGE" "paca-urbain-21.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/3ee23301-f454-4175-ba53-4734c30d5245" "paca-urbain-22.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/96266ed3-4a0e-4593-8ae7-435e93583160" "paca-urbain-23.zip"
download_and_clean "https://www.data.gouv.fr/fr/datasets/r/bf92984d-4441-4cad-9879-b7209acba875" "paca-urbain-24.zip"

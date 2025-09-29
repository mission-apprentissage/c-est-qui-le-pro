---
title: Traitement des PBF (OpenstreetMap)
parent: 🧑‍🎨 Traitements des données
layout: default
nav_order: 3.2.1
---

# Traitement des PBF (OpenstreetMap)
{: .no_toc }

- TOC
{:toc}

Les fichiers PBF (OpenstreetMap) contiennent les informations cartographiques (principalement les routes) nécessaires à la construction des isochrones.

## Données utilisées

| Zone | Lien |
| --- | --- |
| France métropolitaine | https://download.geofabrik.de/europe/france-latest.osm.pbf |
| Martinique | https://download.geofabrik.de/europe/france/martinique-latest.osm.pbf |
| Guadeloupe |  https://download.geofabrik.de/europe/france/guadeloupe-latest.osm.pbf |
| Mayotte | https://download.geofabrik.de/europe/france/mayotte-latest.osm.pbf |
| Guyane | https://download.geofabrik.de/europe/france/guyane-latest.osm.pbf |
| Réunion | https://download.geofabrik.de/europe/france/reunion-latest.osm.pbf |

## Utilitaires utilisés

[Osmium tool](https://osmcode.org/osmium-tool/) : utilitaire en ligne de commande permettant d’effectuer différents traitements sur les fichiers cartographiques.

## Traitements

On télécharge les différents PBF que l’on va fusionner en un seul.

## Script

[Voir sur Github](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/tools/isochrones/graphhopper/entrypoint.sh#L28)
---
title: Traitement des GTFS
parent: ⚙️ Traitements des données
layout: default
nav_order: 3.2.3
---

# Traitement des GTFS
{: .no_toc }

- TOC
{:toc}

## Données utilisées

Voir : 

- [Pour les transports en commun]({{ site.baseurl }}{% link partners-documentation/data/public-transport.md %})
- [Pour les transports scolaires]({{ site.baseurl }}{% link partners-documentation/data/school-transport.md %})

## Utilitaires utilisés

[gtfsclean](https://github.com/public-transport/gtfsclean) : utilitaire en ligne de commande permettant de nettoyer les fichiers GTFS et de les optimiser.

## Traitements

Pour chaque fichier GTFS on effectue le traitement suivant :

- On regarde si le ZIP contenant les données contient un sous-dossier, si c’est le cas on recréé le ZIP en supprimant le sous-dossier (certains fichiers GTFS distribués par les AOMs peuvent contenir un sous-dossier, ce qui n’est pas standard)
- On corrige le format des latitudes et longitudes des fichiers “shapes.txt” et “stops.txt” :
    - Certains fichiers GTFS contiennent un signe “+” devant les latitudes/longitudes positives ce qui n’est pas standard et provoque des erreurs.
    - Le fichier “shapes.txt” contient la représentation géométriques des lignes de transports
    - Le fichier “stops.txt” contient les informations sur un arrêt particulier (nom, position géographique…)
- On corrige et optimise les fichiers GTFS en utilisant `gtfsclean` afin de réduire leur tailles et de corriger des erreurs (ex: suppression d’un trajet utilisant des arrêts inconnus). On utilise les traitements suivants :
    - S : [Suppressions des shapes dupliqués](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#shape-duplicate-remover)
    - C : [Supprime les services dupliqués](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#service-duplicate-remover)
    - R : [Supprimes les routes dupliquées](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#route-duplicate-remover)
    - m : [Recalcul la distance entre les différents points d’un shapes](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#shape-remeasurer)
    - T : [Réduit les trajets et les horaires des arrêts](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#tripstop-times-minimizer)
    - c : [Réduit le nombre de dates des services](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#service-minimizer)
    - s : [Réduction du nombre de points des shapes (représentation géométriques des lignes de transports)](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#shape-duplicate-remover)
    - O : [Suppression des orphelins](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#orphan-remover)
    - e : [Applique les valeurs par défauts aux entrées contenant des erreurs](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#set-erroneous-values-to-standard-defaults)
    - D : [Supprime les entrées qui ne peuvent pas être corrigés](https://github.com/public-transport/gtfsclean?tab=readme-ov-file#drop-erroneous-entries)

## Script

[Voir sur Github](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/tools/isochrones/graphhopper/scripts/gtfs.py)
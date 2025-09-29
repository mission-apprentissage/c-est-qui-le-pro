---
title: Calcul des isochrones de transports en commun
parent: 🧑‍🎨 Traitements des données
layout: default
nav_order: 3.2.3
---

# Calcul des isochrones de transports en commun
{: .no_toc }

- TOC
{:toc}

## Données utilisées

- [Fichiers PBF traités]({{ site.baseurl }}{% link partners-documentation/processing/pbf-fusion.md %})
- [Fichier GTFS traites]({{ site.baseurl }}{% link partners-documentation/processing/gtfs-import.md %})

## Utilitaire utilisés

- [Graphhopper](https://github.com/graphhopper/graphhopper) :
    - Permet le calcul d’un itinéraire entre deux endroits
    - Permet de créer un isochrone en partant d’un endroit (Géométrie de tout les endroits accessibles en X temps)
- PostgreSQL avec l’extension [PostGis](https://postgis.net/)
- Jobs en cli :
    - [`splitIsochrones`](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/server/src/cli.ts#L182)
    - [`importIsochrones`](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/server/src/cli.ts#L213)

## Fonctionnement

- On importe les fichiers GTFS et PBF dans GraphHopper (on exclut les autoroutes dans la configuration de GraphHopper)
- On exporte la liste des établissements de notre catalogue et leur position géographique
- Pour chaque établissement on interroge GraphHopper afin d’obtenir un isochrone pour chaque durée de trajet maximale qui nous intéresse (ex: 1h30, 1h, …), on sauvegarde les résultats dans des fichiers.
- Pour chaque ensemble d’isochrones pour un établissement :
    - On simplifie les isochrones
    - On découpe les isochrones en plusieurs parties
- On importe nos isochrones simplifiés et découpés dans notre base de données.

## Scripts

- Création de l’instance GraphHopper, voir [Dockerfile](https://github.com/mission-apprentissage/c-est-qui-le-pro/tree/main/tools/isochrones/graphhopper) effectuant :
    - Le téléchargement et le traitements des GTFS et PBF
    - La création d’une instance GraphHopper utilisant ces données
- Création des Isochrones bruts, voir [Dockerfile](https://github.com/mission-apprentissage/c-est-qui-le-pro/tree/main/tools/isochrones/isochrones) :
    - Télécharge la liste des établissements avec leur position
    - Interroge GraphHoper et sauvegarde les isochrones dans des fichiers
- [Simplification et découpage des isochrones](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/server/src/jobs/isochrones/splitIsochrones.ts)
- [Importation des isochrones](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/server/src/jobs/isochrones/importIsochrones.ts)
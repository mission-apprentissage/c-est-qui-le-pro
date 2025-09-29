---
title: OpenStreetMap
parent: 🎨 Jeux de données manipulés
layout: default
nav_order: 3.1.10
---

# OpenStreetMap
{: .no_toc }

- TOC
{:toc}

[OpenStreetMap](https://www.openstreetmap.org/about) est bâti par une communauté de cartographes bénévoles qui contribuent et maintiennent les données des routes, sentiers, cafés, stations ferroviaires et bien plus encore, partout dans le monde.

## Périmètre

Ensemble des territoires

## Périodicité de mise à jour

- Mise à jour quotidienne par le producteur
- Import des données dans le cadre des calculs d'isochrones (manuel, environ 1 fois par mois)

## Format des données

Les données sont disponibles au format PBF.

## Entité responsable

[Geofabrik](https://download.geofabrik.de/)

## Source

Le serveur [Geofabrik](https://download.geofabrik.de/) propose des extraction localisées des données d’OpenStreetMap, mis à jour quotidiennement.

## Utilisation

Les données sont mobilisées calculer les distances entre un lieu donnée et un établissement.

## Limites et risques

Les données pour certaines **collectivités d'outre-mer** sont difficilement récupérables et exploitables (pas de fichiers disponibles unitairement) elles sont donc manquantes dans notre outil (ex: Saint-Barthélemy, Saint-Martin)
---
title: Transports scolaires
parent: 🎨 Jeux de données manipulés
layout: default
nav_order: 3.1.12
---

# Transports scolaires
{: .no_toc }

- TOC
{:toc}

En septembre 2025, seules quelques villes et métropoles possèdent des données de transports scolaires utilisables (données disponibles sur transport.data.gouv et non-mélangées avec celles des transports en commun).

## Périmètre

Régions de France métropolitaine

## Périodicité de mise à jour

- Mise à jour plusieurs fois par an par les différents producteurs
- Import des données dans le cadre des calculs d'isochrones (manuel, environ 1 fois par mois)

## Format des données

Les données sont disponibles au format GTFS.

## Entité responsable

Nous utilisons uniquement les données déposées sur la plateforme transport.data.gouv.  

## Source / Liste des données utilisées

Vous pouvez retrouver la liste des données utilisées dans le fichier [csv utilisé pour l'importation](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/tools/isochrones/graphhopper/data/transports.csv) (Ligne ayant pour type “Scolaire”)

## Utilisation

Les données sont mobilisées pour permettre à l'utilisateur de restreindre les résultats aux formations situées dans un périmètre géographique autour d'un lieu donné et fournir des indications de durée de transport.

## Limites et risques

En plus des limites des [données de transports en commun]({{ site.baseurl }}{% link partners-documentation/data/public-transport.md %}), les données de transports scolaires présentent les difficultés suivantes :

- Les fichiers de données peuvent être mélangés avec des données de transports classiques, demandant un gros travail manuel pour pouvoir les filtrer
- Les intervalles de disponibilités des données de transports scolaires peuvent différer de ceux des transports en commun et ces données peuvent ne pas avoir de date pendant la période estivale.
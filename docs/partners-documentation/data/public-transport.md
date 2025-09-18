---
title: Transports en commun
parent: 🧩 Jeux de données manipulés
layout: default
nav_order: 3.1.10
---

# Transports en commun
{: .no_toc }

- TOC
{:toc}

L’ensemble du territoire métropolitain est couvert par les données de transports en commun diffusées sur les plateformes en open data. 

Il est nécessaire d’agréger les données de transport en commun (cf. [Traitement des PBF (OpenstreetMap)]({{ site.baseurl }}{% link partners-documentation/processing/pbf-fusion.md %})) avant de pouvoir les utiliser dans le calcul des isochrones (cf. [Calcul des isochrones]({{ site.baseurl }}{% link partners-documentation/processing/isochrones.md %})).

## Périmètre

Régions de France métropolitaine

## Périodicité de mise à jour

Potentiellement plusieurs fois par mois

## Format des données

Les données sont disponibles au format GTFS.

## Entité responsable

L’ensemble des données utilisées sont déposées sur la plateforme transport.data.gouv.

## Liste exhaustive des données de transports en commun utilisées

La liste exhaustive des données de transports en commun utilisées pouvant être dynamique et longue, vous pouvez la retrouver directement dans notre [csv utilisé pour l'importation](https://github.com/mission-apprentissage/c-est-qui-le-pro/blob/main/tools/isochrones/graphhopper/data/transports.csv) (Ligne ayant pour type “Transport” ou “Mixte”)

## Utilisation

Les données sont mobilisées pour permettre à l'utilisateur de restreindre les résultats aux formations situées dans un périmètre géographique autour d'un lieu donné et pour fournir des estimations de temps de transport.

## Limites et risques

Les données de transports en commun étant dynamiques (nouvel opérateur, disparition d’un opérateur, non publication des données…) il est nécessaire d’effectuer une vérification de la liste des datasets sur transport.data.gouv à chaque mise à jour. Cela permet de référencer les nouvelles données et de supprimer les datasets n’existant plus.

Le script de téléchargement et de nettoyage des GTFS permet d’ignorer les données n’existant plus et d’indiquer les intervalles de disponibilités des données de transports afin de faciliter le choix d’une date pour la création des isochrones.
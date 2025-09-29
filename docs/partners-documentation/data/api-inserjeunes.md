---
title: API Exposition InserJeunes
parent: 🎨 Jeux de données manipulés
layout: default
nav_order: 3.1.03
---

# API Exposition InserJeunes
{: .no_toc }

- TOC
{:toc}

L’API Exposition InserJeunes permet **la récupération des [données InserJeunes](https://documentation.exposition.inserjeunes.beta.gouv.fr/)** (dont la “part en emploi à 6 mois”, le “taux en formation” et des données liées à la rémunération en sortie de formation).

Les diverses routes permettent de récupérer ces données :

- pour une **formation / certification,** à partir d’un code MEFSTAT11, pour la voie scolaire ou d’un code formation diplôme (CFD), pour la voie apprentissage.
- pour une **formation / certification au sein d’un établissement,** à partir d’un code UAI (Unité Administrative Immatriculée) et d’un code MEFSTAT11 (voie scolaire), CFD (code formation diplôme, pour la voie apprentissage) ou d’un code SISE (système d'information statistique des étudiants, pour le supérieur).

L’API permet en outre de récupérer plusieurs de ces éléments à la fois, et propose divers filtres, par exemple pour récupérer les données à la maille régionale ou académique.

Certaines routes, mentionnées par un cadenas, nécessitent une authentification. Pour obtenir une clef API, il faut [contacter l’équipe](mailto:contact@inserjeunes.beta.gouv.fr) inserjeunes.

Le code source de l’API est public et disponible [sur Github](https://github.com/mission-apprentissage/trajectoires-pro/).

## Périmètre

L'API couvre les données relatives à l'apprentissage et au scolaire, du niveau CAP à BTS pour la partie produite par la DEPP et les licences générales, licences professionnelles, masters, diplômes d’ingénieurs et de management pour la partie produite par le SIES. À terme, l’ensemble des formations du supérieur seront concernées.

## Périodicité de mise à jour

- Les données sont mises à jour plusieurs fois par an, au fil des diffusions des deux producteurs (2 fois par an pour le SIES et 3 fois par an pour la DEPP).
- Les données sont mises à jour dans notre base automatiquement chaque semaine dans le cadre d'un import global

## Format des données

Les données sont disponibles au format JSON.

## Entité responsable

Equipe Exposition InserJeunes

## Source

- [Accès à l'API](https://exposition.inserjeunes.beta.gouv.fr/api/doc/)

## Utilisation

Les données sont mobilisées pour permettre aux utilisateurs d’accéder à des informations sur le devenir à l'issue d'une formation (poursuite d'études, accès à l'emploi, etc.)
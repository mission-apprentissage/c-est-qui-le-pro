---
title: Référentiel national des certifications
parent: Référentiels du Réseau des Carif-Oref
layout: default
nav_order: 3.1.04.1
---

# Référentiel national des certifications
{: .no_toc }

- TOC
{:toc}

Certif Info est un référentiel national de certifications, co-produit par le Réseau des Carif-Oref et l'Onisep. 

### Périmètre

Certif-Info recense l’ensemble des titres et diplômes à finalité professionnelle  délivrés au nom de l’État, les certificats de Qualification Professionnelle élaborés dans le cadre des branches professionnelles, les habilitations, les titres et diplômes élaborés par des organismes de formation publics ou privés accessibles en formation initiale et/ou professionnelle continue.

## Périodicité de mise à jour

- Les données actualisées sont mises à disposition chaque mois par le RCO sur un espace dédié (bucket)
- Les données sont mises à jour dans notre base automatiquement chaque semaine dans le cadre d'un import global

### Format des données

Les données sont disponibles au format CSV depuis [ce lien](https://tabular-api.data.gouv.fr/api/resources/f2981d6f-e55c-42cd-8eba-3e891777e222/data/csv/).

### Entité responsable

Réseau des Carif-Oref

## Source

- [Source open data](https://www.data.gouv.fr/fr/datasets/referentiel-national-des-certifications/) (attention, nous utilisons les fichiers déposés sur le bucket dédié)


### Utilisation

Les données sont mobilisées pour permettre de relier les différents jeux de données et pour associer les formations aux métiers auxquelles elles préparent.

### Limites et risques

Nous n’utilisons pas la version Open Data de ces données qui est incomplète : les  codes historiques ne sont pas présents dans l’Open Data. Le RCO nous met à disponibilité les fichiers complets dans un bucket s3 sur OVH tout les mois. Le format est identique à celui de l’Open Data mais une interruption du dépôt de ces données peut les rendre obsolètes.
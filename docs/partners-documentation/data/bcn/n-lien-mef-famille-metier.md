---
title: N_LIEN_MEF_FAMILLE_METIER (modifiée)
parent: BCN
layout: default
nav_order: 3.1.05.5
---

# Table N_LIEN_MEF_FAMILLE_METIER (modifiée)
{: .no_toc }

- TOC
{:toc}

La table **N_LIEN_MEF_FAMILLE_METIER** permet de faire le lien entre une seconde professionnelle et sa famille de métier.

## Périodicité de mise à jour

- Fréquence de mise à jour par le producteur inconnue
- Les données sont mises à jour ponctuellement

## Format des données

Les données sont disponibles au format CSV.

## Entité responsable

DEPP – Bureau des nomenclatures et répertoires

## Source

- [Page de la table sur le site de la BCN](https://bcn.depp.education.fr/bcn/workspace/documentation/n/N_LIEN_MEF_FAMILLE_METIER)

## Utilisation

Nous utilisons les données pour permettre d'expliciter les liens entre secondes communes et bac pro au sein de familles de métiers.

## Limites et risques

- Un passage à l’API de la BCN sera nécessaire, l’outil de consultation ne nous garantit pas que l’exportation des données ne changera pas.
- En attendant une mise à jour de la table par la BCN, nous avons généré une table personnalisée dans laquelle nous avons : 
  - ajouté les premières et terminales associées à une famille de métiers
  - ajouté les 4 familles de métiers associées au Ministère de l’Agriculture
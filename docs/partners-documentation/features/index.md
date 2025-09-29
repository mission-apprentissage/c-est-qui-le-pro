---
title: 🖼️ Lien entre fonctionnalités et données
parent: 🤝 Pour les partenaires
layout: default
nav_order: 3.3
---

# 🖼️ Lien entre fonctionnalités et données

## Catalogue de formations

La matière principale manipulée par notre outil est une liste de formations (une certification dispensée dans un établissement) : 

- professionnelles
- accessibles en sortie de collège
- en voie scolaire et en apprentissage

Pour construire cette liste de formations, nous réunissons deux catalogues :

- La table [Idéo-Actions de formation initiale-Univers lycée]({{ site.baseurl }}{% link partners-documentation/data/onisep/ideo-actions-formation.md %}), de l'Onisep

- Le [catalogue de l’apprentissage]({{ site.baseurl }}{% link partners-documentation/data/catalogue-apprentissage.md %}), des ministères éducatifs

Le premier nous permet principalement de récupérer les formations en voie scolaire tandis que le second nous fournit les formations en apprentissage.

## Données présentées à l'utilisateur

Une partie des données présentées à l'utilisateur est directement issue de ces deux catalogues.

Ces données sont recoupées et enrichies à l'aide de jeux de données complémentaires (voir [🎨 Jeux de données manipulés]({{ site.baseurl }}{% link partners-documentation/data/index.md %})), permettant d'associer à chaque formation des informations précieuses sur son contenu, ses conditions d'accès ou encore le devenir des élèves.

Certains jeux de données font l'objet de traitements spécifiques, listés dans : [🧑‍🎨 Traitements des données]({{ site.baseurl }}{% link partners-documentation/processing/index.md %}) avant d'être exploités.

Les pages suivantes présentent, pour les deux interfaces principales du site, [la page de recherche]({{ site.baseurl }}{% link partners-documentation/features/search-page.md %}) et [la page de détail]({{ site.baseurl }}{% link partners-documentation/features/detail-page.md %}), et pour chaque visualisation de données, la liste des données manipulées et des traitements effectués. 
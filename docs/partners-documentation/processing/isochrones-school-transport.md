---
title: Calcul des isochrones pour les transports scolaires
parent: 🧑‍🎨 Traitements des données
layout: default
nav_order: 3.2.4
---

# Calcul des isochrones pour les transports scolaires
{: .no_toc }

- TOC
{:toc}

Les traitements sont quasi similaires à ceux effectués dans le cadre du [calcul des isochrones pour les transports en commun]({{ site.baseurl }}{% link partners-documentation/processing/isochrones.md %})

Il y a une différence lors de l’importation des isochrones : pour chaque établissement, on soustrait des différents isochrones (15min, 30min, etc.) les isochrones de “transports en commun”. Cela nous permet de garder un isochrone de lieux uniquement accessibles en transports scolaires (ce qui correspond aux règles d'accès aux transports scolaires que nous avons observé).
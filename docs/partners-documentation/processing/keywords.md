---
title: Mots-clés
parent: ⚙️ Traitements des données
layout: default
nav_order: 3.2.1
---

# Identification de mots-clés associés aux formations
{: .no_toc }

- TOC
{:toc}

## Objectif

Pouvoir faire une recherche de formation à partir de mots-clés (pas forcément présents dans le titre ou la description).

## Solution retenue

Plusieurs pistes ont été explorées (notamment en utilisant des solutions d'IA telles que Mistral ou ChatGPT).

Nous avons finalement opté pour l'utlisation de keybert via le modèle NLP “distiluse-base-multilingual-cased-v1”. Il s’agit d’une solution open source.

## Script

```python
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
import nltk
import spacy
from nltk.corpus import stopwords
import pandas as pd
from tqdm import tqdm

# Chargement des modèles
model = SentenceTransformer('distiluse-base-multilingual-cased-v1')
kw_model = KeyBERT(model)

# Téléchargement des stopwords français
nltk.download('stopwords')
french_stopwords = stopwords.words('french')

# Chargement du modèle spaCy français
nlp = spacy.load("fr_core_news_md")  # Si pas installé : python -m spacy download fr_core_news_md

# Fonction de prétraitement : minuscule + lemmatisation
def preprocess_text(text):
    doc = nlp(text.lower())  # Mise en minuscule ici
    lemmatized_text = " ".join([token.lemma_ for token in doc if not token.is_punct and not token.is_space])
    return lemmatized_text

# Extraction des mots-clés
def extract_keywords_from_text(text, top_n=10, min_score=0.1):
    preprocessed = preprocess_text(text)
    keywords = kw_model.extract_keywords(preprocessed, top_n=top_n, stop_words=french_stopwords)
    
    lemmatized_keywords = []
    for kw, score in keywords:
        if score >= min_score:
            doc = nlp(kw)
            lemma = " ".join([token.lemma_ for token in doc])
            lemmatized_keywords.append((lemma, score))
    return lemmatized_keywords

def extract_keywords_from_list(text_list, top_n=10, min_score=0.1):
    all_results = []
    for i, text in enumerate(tqdm(text_list, desc="🔍 Traitement des textes", unit="texte")):
        keywords = extract_keywords_from_text(text, top_n=top_n, min_score=min_score)
        for lemma, score in keywords:
            all_results.append({
                "id": i,
                "mot_clef": lemma,
                "score": score
            })
    return all_results
  

def extract_keywords_as_dataframe(text_list, top_n=10, min_score=0.1):
    results = extract_keywords_from_list(text_list, top_n, min_score)
    return pd.DataFrame(results)

```

## 🎯 À quoi sert ce script ?

Ce script permet **d'extraire automatiquement les mots-clés les plus importants** d'un ou plusieurs textes en français.

Ces mots-clés peuvent ensuite être utilisés pour **faire des recherches**, **organiser des documents**, **résumer des contenus**, etc.

## 🛠️ Comment fonctionne le script ? (explication étape par étape)

1. **Importation des outils nécessaires**
    - **KeyBERT** : un outil pour trouver les mots-clés d’un texte en utilisant l’intelligence artificielle.
    - **SentenceTransformer** : un modèle d’IA qui transforme des phrases en "vecteurs" pour que l’ordinateur puisse les comparer.
    - **NLTK** et **spaCy** : deux bibliothèques pour le traitement automatique du texte (comme retirer les mots inutiles ou simplifier les mots).
    - **Pandas** : une bibliothèque pour organiser les résultats dans un tableau.
    - **tqdm** : un outil pour afficher une barre de progression (pratique quand il y a beaucoup de textes à traiter).
2. **Préparation des outils**
    - Téléchargement de la liste des **mots vides en français** (ex : "le", "de", "un", "et", qui n'apportent pas beaucoup de sens).
    - Chargement d'un modèle de compréhension du français avec **spaCy**.
    - Préparation du modèle **KeyBERT** qui sera utilisé pour extraire les mots-clés.
3. **Prétraitement des textes**
    - Chaque texte est **converti en minuscules** (ex : "Bonjour" devient "bonjour") pour uniformiser l'analyse.
    - Chaque mot est **simplifié à sa racine** (ex : "étudiants" devient "étudiant", "couraient" devient "courir"). Cela s'appelle la **lemmatisation**.
    - La ponctuation et les espaces inutiles sont supprimés.
4. **Extraction des mots-clés d’un texte**
    - Le texte nettoyé est envoyé au modèle **KeyBERT**.
    - Le modèle renvoie une liste de mots-clés avec un **score** (plus le score est élevé, plus le mot-clé est pertinent par rapport au texte).
    - Seuls les mots-clés dont le score est supérieur à un certain seuil (ex : 0.1) sont conservés.
    - Les mots-clés sont aussi **lemmatisés** pour éviter d’avoir plusieurs versions d’un même mot (ex: "marcher", "marche", "marchait" → "marcher").
5. **Traitement d'une liste de textes**
    - Si on a plusieurs textes, le script :
        - Traite chaque texte un par un (avec une barre de progression).
        - Extrait les mots-clés pour chaque texte.
        - Associe à chaque mot-clé l’identifiant du texte auquel il appartient.
6. **Mise en forme des résultats**
    - À la fin, les résultats sont mis dans un **tableau (DataFrame)** avec trois colonnes :
        - `id` : le numéro du texte d’origine
        - `mot_clef` : le mot-clé extrait
        - `score` : la pertinence du mot-clé
# ADR-001 : Modélisation de l'arbre de décision

**Date :** Décembre 2025  
**Statut :** Accepté  
**Décideurs :** Nicolas DESBAN

## Contexte

L'application doit permettre de créer des questionnaires sous forme d'arbres de décision où :
- Chaque question peut mener à différentes questions suivantes selon le choix de l'utilisateur
- Certaines questions sont des "fins" du parcours (questions terminales)
- Le parcours peut comporter des convergences (plusieurs chemins mènent à la même question)

## Options considérées

### Option 1 : Modèle hiérarchique parent-enfant

```
Question
├── id
├── content
├── parent_id (FK → Question)
└── children[] (inverse)
```

**Avantages :**
- Simple à comprendre
- Pattern classique (arbre N-aire)

**Inconvénients :**
- Ne gère pas les convergences (un nœud = un seul parent)
- Le libellé du choix serait stocké où ?
- Pas de distinction claire entre choix et question

### Option 2 : Table de liaison choix-question (retenue) ✅

```
Question
├── id
├── content
└── questionnaire_id

Choice
├── id
├── label
├── question_id (question parente)
└── target_question_id (question destination)
```

**Avantages :**
- Supporte les convergences nativement
- Chaque choix a son propre libellé
- Question terminale = question sans Choice
- Plus flexible pour des évolutions (pondération, conditions...)

**Inconvénients :**
- Légèrement plus complexe
- Requêtes un peu plus lourdes (JOIN)

### Option 3 : Graphe en JSON

Stocker l'arbre complet dans un champ JSON.

**Avantages :**
- Lecture en une seule requête

**Inconvénients :**
- Difficile à modifier partiellement
- Pas de validation relationnelle
- Impossible de faire des requêtes sur les questions

## Décision

**L'option 2 (table Choice séparée) est retenue.**

Le modèle permet :
1. De représenter un graphe orienté (pas seulement un arbre)
2. D'associer un libellé à chaque transition
3. D'identifier les questions terminales par l'absence de choix
4. D'ajouter facilement des métadonnées aux transitions (ordre, conditions...)

## Conséquences

### Positives
- Flexibilité maximale pour les parcours complexes
- Intégrité référentielle via les FK
- Facilité d'extension (ajout de champs sur Choice)

### Négatives
- Nécessite des JOIN pour charger un questionnaire complet
- Vigilance sur les références circulaires (boucles infinies)

## Notes d'implémentation

- `target_question` est nullable : un choix sans target signifie que la question cible n'existe pas encore
- `ON DELETE SET NULL` sur `target_question_id` : supprimer une question ne casse pas les choix qui pointaient vers elle
- La détection des boucles est laissée à l'interface d'administration (visualisation de l'arbre)

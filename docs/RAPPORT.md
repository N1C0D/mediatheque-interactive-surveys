# 📋 Rapport Technique - Médiathèque Interactive Surveys

**Date :** Décembre 2025  
**Auteur :** Nicolas DESBAN  
**Contexte :** Test technique - Département de la Marne

---

## 1. Modélisation de l'arbre de décision

### 1.1 Principe général

L'arbre de décision est modélisé comme un **graphe orienté** où :
- Chaque **nœud** est une `Question`
- Chaque **arête** est un `Choice` (choix de réponse)
- Les **feuilles** sont des questions sans choix (questions terminales)

Cette approche permet de représenter des parcours complexes avec :
- Plusieurs chemins possibles
- Des convergences (plusieurs choix mènent à la même question)
- Des branches multiples (une question peut avoir N choix)

### 1.2 Modèle de données

```
┌─────────────────────────────────────────────────────────────┐
│                      QUESTIONNAIRE                          │
├─────────────────────────────────────────────────────────────┤
│ id              : integer (PK)                              │
│ title           : varchar(255)                              │
│ description     : text (nullable)                           │
│ start_question  : FK → Question (nullable, point d'entrée)  │
│ created_at      : datetime                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        QUESTION                             │
├─────────────────────────────────────────────────────────────┤
│ id              : integer (PK)                              │
│ content         : text                                      │
│ media_filename  : varchar(255) (nullable)                   │
│ media_type      : varchar(50) (nullable) ["image"|"video"]  │
│ questionnaire   : FK → Questionnaire                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CHOICE                              │
├─────────────────────────────────────────────────────────────┤
│ id              : integer (PK)                              │
│ label           : varchar(255)                              │
│ question        : FK → Question (question parente)          │
│ target_question : FK → Question (nullable, destination)     │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Identification des questions terminales

Une question est **terminale** (fin du parcours) si elle n'a aucun `Choice` associé.

**Avantages de cette approche :**
- Pas de champ booléen `isTerminal` à maintenir
- Cohérence automatique : ajouter un choix = la question n'est plus terminale
- Flexibilité : le message de fin est le `content` de la question terminale

### 1.4 Gestion de la progression

```
┌─────────────────────────────────────────────────────────────┐
│                     PARTICIPATION                           │
├─────────────────────────────────────────────────────────────┤
│ id               : integer (PK)                             │
│ token            : varchar(64) (unique, généré côté API)    │
│ is_completed     : boolean                                  │
│ current_question : FK → Question (nullable, position)       │
│ questionnaire    : FK → Questionnaire                       │
│ respondent       : FK → User (nullable, si connecté)        │
│ updated_at       : datetime                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PARTICIPATION_ANSWER                       │
├─────────────────────────────────────────────────────────────┤
│ id              : integer (PK)                              │
│ participation   : FK → Participation                        │
│ question        : FK → Question                             │
│ choice          : FK → Choice                               │
│ answered_at     : datetime                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Principaux choix d'architecture

### 2.1 Stack technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Backend | Symfony 7 + API Platform | Framework PHP mature, API Platform génère une API REST/OpenAPI automatiquement |
| Frontend | Next.js 15 (App Router) | SSR optionnel, excellent DX, typage TypeScript |
| Database | PostgreSQL 16 | Robuste, excellentes performances, support JSON natif |
| Auth | Session PHP | Simple, sécurisé, compatible multi-devices sans JWT |

### 2.2 Séparation Frontend/Backend

**Choix :** Architecture découplée (SPA + API REST)

**Raisons :**
- Flexibilité pour ajouter d'autres clients (mobile, bornes tactiles)
- Équipes frontend/backend peuvent travailler indépendamment
- API réutilisable et documentée (OpenAPI via API Platform)

### 2.3 Authentification par session

**Choix :** Session PHP côté serveur + cookies `HttpOnly`

**Alternative rejetée :** JWT (JSON Web Tokens)

**Raisons :**
- Plus simple à implémenter et débuguer
- Révocation immédiate possible (logout = détruire session)
- Pas de problème de refresh token
- Cookies `HttpOnly` protègent contre XSS

### 2.4 Stockage des participations

**Utilisateurs anonymes :**
- Token stocké dans `sessionStorage` côté navigateur
- Permet de reprendre le questionnaire dans le même onglet

**Utilisateurs connectés :**
- Token + `respondent` stockés en base
- Progression sauvegardée et accessible depuis n'importe quel appareil

### 2.5 Gestion des médias

**Choix :** Fichiers stockés sur le filesystem (`public/media/`)

**Raisons :**
- Simple pour un MVP
- Pas de dépendance externe (S3, Cloudinary)
- Servie directement par le serveur web

**Structure :**
```
public/media/
├── images/
│   └── *.jpg, *.png, *.gif, *.webp
└── videos/
    └── *.mp4, *.webm, *.ogg
```

---

## 3. Limites connues

### 3.1 Limites techniques

| Limite | Impact | Criticité |
|--------|--------|-----------|
| Pas de cache API | Performances dégradées avec beaucoup d'utilisateurs | Moyenne |
| Médias sur filesystem | Ne scale pas horizontalement | Moyenne |
| Pas de tests automatisés | Régression possible | Haute |
| Session non distribuée | Impossible de load-balancer | Moyenne |

> ⚠️ **Note importante :** Par manque de temps, les batteries de tests (unitaires et intégration) n'ont pas été réalisées. C'est une priorité haute pour garantir la qualité et éviter les régressions. L'infrastructure de test est en place (PHPUnit côté API, Jest côté frontend) mais les tests restent à écrire.

### 3.2 Limites fonctionnelles

| Limite | Description |
|--------|-------------|
| Pas de statistiques | Aucune analyse des réponses collectées |
| Pas d'export | Impossible d'exporter les résultats (CSV, PDF) |
| Pas de versioning | Modifier un questionnaire impacte les participations en cours |
| Pas de preview | L'admin ne peut pas tester un questionnaire avant publication |
| Médias non optimisés | Pas de redimensionnement, compression, ou formats modernes (WebP auto) |

### 3.3 Limites de sécurité

| Limite | Risque |
|--------|--------|
| Pas de rate limiting | Vulnérable au brute force sur /api/login |
| Pas de CAPTCHA | Création de comptes automatisée possible |
| Upload non sandboxé | Risque si un fichier malveillant passe la validation MIME |

---

## 4. Pistes d'amélioration

### 4.1 Court terme (quick wins)

- [ ] **Ajouter des tests** : PHPUnit pour l'API, Jest/Testing Library pour le frontend
- [ ] **Cache HTTP** : Ajouter des headers `Cache-Control` sur les endpoints GET
- [ ] **Validation côté client** : Utiliser Zod ou Yup pour valider les formulaires
- [ ] **Optimistic updates** : Améliorer l'UX en mettant à jour l'UI avant la réponse API

### 4.2 Moyen terme

- [ ] **Dashboard statistiques** : Graphiques de participation, taux de complétion
- [ ] **Export des résultats** : CSV, PDF avec charts
- [ ] **Mode preview** : Tester un questionnaire sans créer de participation
- [ ] **Notifications** : Email de confirmation, rappel de questionnaire non terminé

### 4.3 Long terme

- [ ] **Stockage S3** : Migrer les médias vers un stockage objet (AWS S3, MinIO)
- [ ] **CDN** : Servir les médias via CloudFront ou Cloudflare
- [ ] **Session Redis** : Permettre le scaling horizontal
- [ ] **PWA** : Mode offline pour les bornes tactiles
- [ ] **API GraphQL** : Alternative à REST pour des requêtes plus flexibles

---

## 5. Diagramme de séquence - Participation

```
┌─────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│ Browser │          │ Frontend │          │   API   │          │ Database │
└────┬────┘          └────┬─────┘          └────┬────┘          └────┬─────┘
     │                    │                     │                    │
     │ GET /questionnaires/1                    │                    │
     │───────────────────>│                     │                    │
     │                    │ GET /api/questionnaires/1                │
     │                    │────────────────────>│                    │
     │                    │                     │ SELECT * FROM ...  │
     │                    │                     │───────────────────>│
     │                    │                     │<───────────────────│
     │                    │<────────────────────│                    │
     │<───────────────────│                     │                    │
     │                    │                     │                    │
     │ Click "Commencer"  │                     │                    │
     │───────────────────>│                     │                    │
     │                    │ POST /api/participations                 │
     │                    │────────────────────>│                    │
     │                    │                     │ INSERT INTO ...    │
     │                    │                     │───────────────────>│
     │                    │                     │<───────────────────│
     │                    │<────────────────────│ {token, ...}       │
     │                    │                     │                    │
     │                    │ sessionStorage.set(token)                │
     │<───────────────────│                     │                    │
     │                    │                     │                    │
     │ Click choice       │                     │                    │
     │───────────────────>│                     │                    │
     │                    │ POST /api/participation_answers          │
     │                    │────────────────────>│                    │
     │                    │                     │───────────────────>│
     │                    │                     │<───────────────────│
     │                    │ PATCH /api/participations/{id}           │
     │                    │────────────────────>│ (currentQuestion)  │
     │                    │                     │───────────────────>│
     │                    │                     │<───────────────────│
     │                    │<────────────────────│                    │
     │<───────────────────│ Next question       │                    │
     │                    │                     │                    │
```

---

## 6. Conclusion

Ce projet démontre une architecture moderne et maintenable pour une application de questionnaires interactifs. Les choix technologiques privilégient la simplicité et la rapidité de développement tout en laissant la porte ouverte à des évolutions futures.

Les principales forces sont :
- **Modèle de données flexible** permettant des arbres de décision complexes
- **API REST bien structurée** avec documentation automatique
- **Interface utilisateur intuitive** pour l'administration et la participation
- **Séparation claire des responsabilités** entre frontend et backend

Les axes d'amélioration prioritaires concernent les tests automatisés, les statistiques de participation, et l'optimisation des performances pour un usage à grande échelle.

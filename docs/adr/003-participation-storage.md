# ADR-003 : Stockage des participations

**Date :** Décembre 2025  
**Statut :** Accepté  
**Décideurs :** Nicolas DESBAN

## Contexte

Les utilisateurs doivent pouvoir :
1. Répondre à un questionnaire **sans créer de compte** (mode anonyme)
2. **Sauvegarder leur progression** pour reprendre plus tard
3. **Retrouver leur progression** s'ils sont connectés (multi-device)

Ces trois exigences sont en tension : comment identifier un utilisateur anonyme ?

## Options considérées

### Option 1 : Tout en base, identification par fingerprint

Générer un identifiant unique basé sur le navigateur (IP, User-Agent, résolution...).

**Avantages :**
- Pas de stockage côté client

**Inconvénients :**
- Non fiable (fingerprint change, VPN, navigateur privé)
- Problèmes de vie privée (RGPD)
- Plusieurs utilisateurs sur le même PC = conflits

### Option 2 : Tout en localStorage

Stocker la participation complète côté client.

**Avantages :**
- Pas de requête serveur pour la progression
- Fonctionne offline

**Inconvénients :**
- Perte si nettoyage du navigateur
- Pas de synchronisation multi-device
- Données modifiables par l'utilisateur

### Option 3 : Hybride token + base (retenue) ✅

```
                    ┌─────────────────┐
                    │   Participation │
                    │   - token       │
                    │   - respondent? │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Anonyme              Connecté            Connecté
   (sessionStorage)     (session)           (autre device)
        │                    │                    │
   token stocké         respondent           respondent
   localement           = user.id            = user.id
```

**Avantages :**
- Anonymes : token dans sessionStorage, progression en base
- Connectés : progression liée au compte, accessible partout
- Données toujours en base (analytics possibles)

**Inconvénients :**
- Logique duale à gérer côté frontend
- Token anonyme perdu si fermeture onglet (sessionStorage)

## Décision

**L'option 3 (hybride) est retenue.**

### Fonctionnement détaillé

#### Utilisateur anonyme

1. Clic sur "Commencer" → `POST /api/participations`
2. API génère un `token` unique (64 caractères hex)
3. Token stocké dans `sessionStorage` du navigateur
4. Pour reprendre : récupération via `GET /api/participations?token=xxx`

```typescript
// Stockage
sessionStorage.setItem(`participation_${questionnaireId}`, JSON.stringify({ token, participationId }));

// Récupération
const saved = sessionStorage.getItem(`participation_${questionnaireId}`);
```

#### Utilisateur connecté

1. Clic sur "Commencer" → `POST /api/participations`
2. API associe automatiquement le `respondent` (user connecté)
3. Pour reprendre : `GET /api/participations?questionnaire=X&respondent=Y&isCompleted=false`

```php
// ParticipationProcessor.php
if ($user = $this->security->getUser()) {
    $participation->setRespondent($user);
}
```

## Conséquences

### Positives
- Expérience fluide pour les anonymes (pas d'inscription forcée)
- Progression persistante pour les connectés
- Toutes les données en base = analytics possibles
- Token non prédictible = sécurité

### Négatives
- Anonyme qui ferme l'onglet perd sa progression
- Code frontend plus complexe (vérifier auth state)
- Pas de "conversion" anonyme → connecté (la participation reste anonyme)

## Amélioration future

Permettre la conversion d'une participation anonyme vers un compte :

```
POST /api/participations/{token}/claim
Authorization: Bearer <user_token>
```

Cela associerait le `respondent` à une participation existante, permettant de la retrouver après connexion.

# ADR-002 : Authentification par session

**Date :** Décembre 2025  
**Statut :** Accepté  
**Décideurs :** Nicolas DESBAN

## Contexte

L'application nécessite une authentification pour :
- Protéger l'interface d'administration (ROLE_ADMIN)
- Permettre aux utilisateurs de sauvegarder leur progression de manière persistante
- Offrir une expérience personnalisée

## Options considérées

### Option 1 : JWT (JSON Web Tokens)

```
POST /api/login → { access_token, refresh_token }
Authorization: Bearer <token>
```

**Avantages :**
- Stateless côté serveur
- Facile à scaler horizontalement
- Standard industriel pour les API

**Inconvénients :**
- Complexité du refresh token
- Révocation difficile (blacklist nécessaire)
- Stockage côté client (localStorage = vulnérable XSS)
- Taille du payload augmente les requêtes

### Option 2 : Session PHP avec cookies (retenue) ✅

```
POST /api/login → Set-Cookie: PHPSESSID=xxx; HttpOnly; Secure; SameSite=Lax
```

**Avantages :**
- Simple à implémenter avec Symfony Security
- Cookie HttpOnly = protection XSS native
- Révocation instantanée (détruire la session)
- Pas de logique de refresh token
- Compatible avec le CSRF protection de Symfony

**Inconvénients :**
- État côté serveur (mémoire/fichiers/Redis)
- Scaling horizontal nécessite session partagée (Redis)
- Cookies nécessitent configuration CORS

### Option 3 : OAuth2 / OpenID Connect

**Avantages :**
- Délégation de l'auth (Google, GitHub...)
- Standards robustes

**Inconvénients :**
- Overkill pour ce projet
- Dépendance à des providers externes
- Complexité d'implémentation

## Décision

**L'option 2 (Session PHP) est retenue.**

Pour un MVP destiné à une médiathèque avec un nombre limité d'utilisateurs simultanés, la simplicité prime sur la scalabilité.

## Implémentation

### Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/login` | POST | Authentifie et crée la session |
| `/api/logout` | POST | Détruit la session |
| `/api/me` | GET | Retourne l'utilisateur connecté |

### Configuration Symfony

```yaml
# config/packages/security.yaml
security:
    firewalls:
        api:
            stateless: false  # Sessions activées
            json_login:
                check_path: api_login
```

### Configuration CORS

```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        allow_credentials: true  # Essentiel pour les cookies
        allow_origin: ['http://localhost:3000']
```

### Côté Frontend

```typescript
// Toutes les requêtes incluent les credentials
fetch(url, { credentials: 'include' })
```

## Conséquences

### Positives
- Implémentation rapide (~2h)
- Sécurité XSS native via HttpOnly
- Debug facile (session visible en base/fichier)
- Logout fiable et immédiat

### Négatives
- Si besoin de scaler : migration vers Redis Sessions
- Cookie SameSite peut poser problème en cross-domain
- Pas adapté pour une app mobile native (préférer tokens)

## Évolution future

Si l'application doit supporter des clients mobiles natifs ou une architecture microservices, migrer vers JWT avec :
- Access token courte durée (15min)
- Refresh token en cookie HttpOnly
- Blacklist Redis pour révocation

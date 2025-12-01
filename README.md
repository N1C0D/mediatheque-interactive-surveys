# 📚 Médiathèque Interactive Surveys

![Symfony](https://img.shields.io/badge/Backend-Symfony_7-black?logo=symfony)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Infra-Docker-blue?logo=docker)
![License](https://img.shields.io/badge/Context-Test_Technique-orange)

---

> **Application de création et de diffusion de questionnaires interactifs sous forme d'arbres de décision.**

Ce projet permet à une médiathèque de concevoir des parcours ludiques ou des enquêtes de satisfaction via une interface d'administration simplifiée, et aux usagers d'y répondre sur divers supports avec **sauvegarde de progression**.

## 📌 Contexte

Réalisé dans le cadre du **test technique pour le Département de la Marne**.

**Auteur :** Nicolas DESBAN

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                      (Next.js 15 / React)                       │
│                     http://localhost:3000                       │
├─────────────────────────────────────────────────────────────────┤
│  • Pages publiques : /questionnaires, /questionnaires/[id]      │
│  • Admin : /admin, /admin/questionnaires/[id]                   │
│  • Auth : /login, /register                                     │
│  • Composants UI réutilisables (Card, Button, MediaSelector...) │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (fetch + credentials)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API                                   │
│                  (Symfony 7 + API Platform)                     │
│                    https://127.0.0.1:8000                       │
├─────────────────────────────────────────────────────────────────┤
│  Endpoints REST :                                               │
│  • /api/questionnaires    (CRUD)                                │
│  • /api/questions         (CRUD)                                │
│  • /api/choices           (CRUD)                                │
│  • /api/participations    (gestion progression)                 │
│  • /api/users             (inscription)                         │
│  • /api/login, /logout, /me  (authentification session)         │
│  • /api/media             (upload et liste médias)              │
├─────────────────────────────────────────────────────────────────┤
│  State Processors :                                             │
│  • ParticipationProcessor (génère token, associe user)          │
│  • UserPasswordProcessor  (hash password)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Doctrine ORM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                      PostgreSQL 16                              │
├─────────────────────────────────────────────────────────────────┤
│  Tables : questionnaire, question, choice, participation,       │
│           participation_answer, user                            │
└─────────────────────────────────────────────────────────────────┘
```

### Modélisation de l'arbre de décision

```
                    ┌──────────────────┐
                    │  Questionnaire   │
                    │  - title         │
                    │  - description   │
                    │  - startQuestion ────┐
                    └──────────────────┘   │
                                           │
         ┌─────────────────────────────────┘
         ▼
    ┌──────────────────┐
    │    Question      │◄──────────────────────────────┐
    │  - content       │                               │
    │  - mediaFilename │                               │
    │  - mediaType     │                               │
    └────────┬─────────┘                               │
             │ 1:N                                     │
             ▼                                         │
    ┌──────────────────┐                               │
    │     Choice       │                               │
    │  - label         │                               │
    │  - targetQuestion├───────────────────────────────┘
    └──────────────────┘         (référence vers question suivante)

    Question terminale = Question sans Choice (fin du parcours)
```

---

## 🚀 Installation

### Prérequis

- **Docker** et **Docker Compose** (recommandé)

*Ou pour une installation manuelle :*
- **PHP 8.2+** avec extensions : `pdo_pgsql`, `intl`, `mbstring`
- **Composer 2.x**
- **Node.js 18+** et **npm**
- **PostgreSQL 14+**
- **Symfony CLI** (recommandé)

### 1. Cloner le projet

```bash
git clone https://github.com/N1C0D/mediatheque-interactive-surveys.git
cd mediatheque-interactive-surveys
```

---

### 🐳 Option A : Avec Docker (recommandé)

La méthode la plus simple pour démarrer l'ensemble du projet (API, Frontend, Base de données, Reverse proxy).

```bash
# Lancer tous les services
docker compose up -d
```

> 💡 La base de données est automatiquement initialisée au premier démarrage (migrations + fixtures).

| Service | URL |
|---------|-----|
| Application | **https://app.localhost:8443** |
| API | **https://api.localhost:8443** |
| Adminer (DB) | **https://adminer.localhost:8443** |

> 💡 Les certificats HTTPS sont générés automatiquement par Caddy.

> ⚠️ **Au premier lancement**, ouvrez d'abord l'URL de l'API (https://api.localhost:8443) pour accepter le certificat, puis ouvrez l'application (https://app.localhost:8443).

---

### 🔧 Option B : Installation manuelle

#### 1. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables (DATABASE_URL notamment)
nano .env
```

**Variables importantes :**
```env
DATABASE_URL="postgresql://app:password@127.0.0.1:5432/app?serverVersion=16"
```

#### 2. Installer le Backend (API)

```bash
cd api

# Installer les dépendances PHP
composer install

# Créer la base de données et exécuter les migrations
composer db

# Lancer le serveur de développement
composer start
```

L'API est accessible sur **https://127.0.0.1:8000**

#### 3. Installer le Frontend

```bash
cd ../frontend

# Installer les dépendances Node
npm install

# Lancer le serveur de développement
npm run dev
```

L'application est accessible sur **http://localhost:3000**

---

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@example.com` | `admin` | Administrateur |
| `jean.dupont@example.com` | `password` | Utilisateur |
| `marie.martin@example.com` | `password` | Utilisateur |

---

## 🛠️ Commandes utiles

### Backend (depuis `/api`)

| Commande | Description |
|----------|-------------|
| `composer start` | Démarre le serveur Symfony |
| `composer db` | Réinitialise la base + fixtures |
| `composer test` | Lance tous les tests de qualité |
| `composer fix` | Corrige automatiquement le code |
| `composer test:phpstan` | Analyse statique PHPStan |
| `composer test:csfixer` | Vérifie le style PHP |

### Frontend (depuis `/frontend`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | Vérifie le code avec ESLint |

---

## 📁 Structure du projet

```
mediatheque-interactive-surveys/
├── api/                          # Backend Symfony
│   ├── src/
│   │   ├── Controller/           # Contrôleurs (Auth, Media)
│   │   ├── Entity/               # Entités Doctrine
│   │   ├── Repository/           # Repositories
│   │   ├── State/                # API Platform Processors
│   │   ├── Factory/              # Factories Foundry (fixtures)
│   │   └── DataFixtures/         # Données de test
│   ├── config/                   # Configuration Symfony
│   ├── migrations/               # Migrations Doctrine
│   └── public/media/             # Fichiers médias uploadés
│
├── frontend/                     # Frontend Next.js
│   ├── src/
│   │   ├── app/                  # Pages (App Router)
│   │   │   ├── admin/            # Interface administration
│   │   │   ├── questionnaires/   # Interface publique
│   │   │   ├── login/            # Authentification
│   │   │   └── register/         # Inscription
│   │   ├── components/ui/        # Composants réutilisables
│   │   ├── contexts/             # Context React (Auth)
│   │   ├── hooks/                # Hooks personnalisés
│   │   ├── lib/                  # API client, utilitaires
│   │   └── types/                # Types TypeScript
│   └── public/                   # Assets statiques
│
├── docs/                         # Documentation
│   ├── RAPPORT.md                # Rapport technique
│   └── adr/                      # Architecture Decision Records
│
└── compose.yml                   # Docker Compose (production)
```

---

## 🔐 Sécurité

- **Authentification** : Session PHP avec cookies `HttpOnly`
- **Autorisation** : 
  - Lecture publique des questionnaires
  - Création/modification réservée aux `ROLE_ADMIN`
  - Participations anonymes ou liées à un compte utilisateur
- **Hash des mots de passe** : bcrypt via `UserPasswordHasherInterface`
- **CORS** : Configuré pour le développement local

---

## 📚 Documentation complémentaire

- [Rapport technique](docs/RAPPORT.md) - Modélisation, choix d'architecture, limites
- [ADR-001](docs/adr/001-decision-tree-model.md) - Modélisation de l'arbre de décision
- [ADR-002](docs/adr/002-session-authentication.md) - Authentification par session
- [ADR-003](docs/adr/003-participation-storage.md) - Stockage des participations

---

## 📄 Licence

Projet réalisé dans le cadre d'un test technique. Usage personnel et éducatif uniquement.

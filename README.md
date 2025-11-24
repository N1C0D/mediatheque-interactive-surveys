<div style="text-align:center">

# 📚 Médiathèque Interactive Surveys

![Symfony](https://img.shields.io/badge/Backend-Symfony_7-black?logo=symfony)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![Docker](https://img.shields.io/badge/Infra-Docker-blue?logo=docker)
![License](https://img.shields.io/badge/Context-Test_Technique-orange)

</div>

---

> **Application de création et de diffusion de questionnaires interactifs sous forme d'arbres de décision.**

Ce projet permet à une médiathèque de concevoir des parcours ludiques ou des enquêtes de satisfaction via une interface d'administration simplifiée, et aux usagers d'y répondre sur divers supports avec **sauvegarde de progression**.

### 📌 Contexte
Réalisé dans le cadre du **test technique pour le Département de la Marne**.

---
**Auteur :** Nicolas DESBAN

---

## 🛠️ Scripts (Composer)

Les scripts définis dans `api/composer.json` facilitent le développement, l'analyse statique et la correction du style.

Remarque : exécuter depuis le dossier `api`, par exemple `cd api && composer <commande>`.

- `composer start`  
  Lance le serveur de développement Symfony (via `symfony serve`).

- `composer test`  
  Lance l'ensemble des vérifications de qualité : `test:csfixer`, `test:phpstan`, `test:twig`, `test:yaml`.

- `composer test:csfixer`  
  Vérifie le style PHP en mode dry-run et affiche les différences (`vendor/bin/php-cs-fixer fix --dry-run --diff`).

- `composer fix:csfixer`  
  Corrige automatiquement le style PHP (`vendor/bin/php-cs-fixer fix`).

- `composer test:phpstan`  
  Lance l'analyse statique avec PHPStan (`vendor/bin/phpstan analyse`).

- `composer test:twig`  
  Vérifie les templates Twig (`vendor/bin/twig-cs-fixer lint`).

- `composer fix:twig`  
  Corrige les templates Twig (`vendor/bin/twig-cs-fixer fix`).

- `composer test:yaml`  
  Vérifie la syntaxe des fichiers YAML de configuration (`php bin/console lint:yaml config`).

- `composer fix`  
  Exécute les corrections automatiques principales (`@fix:csfixer` et `@fix:twig`).

---

## Exemples rapides

- Démarrer le serveur :
    - `cd api && composer start`

- Lancer tous les tests de qualité :
    - `cd api && composer test`

- Corriger le code automatiquement :
    - `cd api && composer fix`

---

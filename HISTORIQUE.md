# Historique du projet CareTrack

## Contexte
Application médicale de suivi de patients chroniques.
- **Backend** : Spring Boot 3.5.0 / Java 21 / PostgreSQL
- **Frontend** : Angular 20 / PrimeNG / TailwindCSS 4
- **Base de données** : PostgreSQL 16 (base `caretrackdb`, port 5433)
- **URL production** : https://caretrack.gilmotech.be (port backend 8083)

## Chronologie

### 2026-05-09 — Initialisation du projet et configuration déploiement
- Clonage du dépôt : `git@github.com:gilles888/caretrack.git` → `/home/claude-worker/caretrack/`
- Analyse de la structure : backend Spring Boot (Phase 1 / H2), frontend Angular 20
- **Passage Phase 2** : activation du driver PostgreSQL dans `pom.xml`
- Création des fichiers de déploiement :
  - `deploy.sh` — script build + déploiement (backend | frontend | all), inspiré du pattern arsbotanica
  - `setup-server.sh` — setup initial serveur (PostgreSQL, systemd, Nginx, Certbot)
- Configuration Nginx créée pour `caretrack.gilmotech.be` (port 8083)
- Service systemd `caretrack.service` défini
- Fichier `frontend/src/environments/environment.production.ts` créé
- `angular.json` mis à jour : ajout `fileReplacements` pour l'environnement production
- `application-prod.yml` mis à jour : port 8083, `ddl-auto: update`, Flyway désactivé
- DNS à configurer : `A 45.88.223.242` / `AAAA 2a02:c207:2293:6009::1`
- Création de la documentation : `CLAUDE.md`, `HISTORIQUE.md`, `CHANGELOG.md`

---

### 2026-05-09 — Premier déploiement production + corrections critiques

**Problèmes rencontrés et résolus :**

1. **Spring Boot 3.5.0 — référence circulaire MAIL_HOST**
   - Cause : `setup-server.sh` écrivait `${MAIL_HOST:-localhost}` (syntaxe bash) comme valeur de la propriété JVM `-DMAIL_HOST`. Spring 3.5.0 détecte une référence circulaire lors de la résolution.
   - Fix : résoudre les variables shell avant l'écriture dans le service systemd — valeurs codées en dur dans le `.service`.

2. **H2ConsoleProperties manquant en profil prod**
   - Cause : `SecurityConfig` utilisait `PathRequest.toH2Console()` qui requiert le bean `H2ConsoleProperties`, non créé quand `spring.h2.console.enabled=false`.
   - Fix : `SecurityConfig` rendue conditionnelle via `@Value("${spring.h2.console.enabled:false}")`.

3. **Permissions root sur `target/` et le JAR**
   - Cause : premier `sudo ./install.sh` exécutait Maven en root.
   - Fix : `fix-deploy.sh` corrige les permissions avant chaque build.

4. **Health check trop court**
   - Spring Boot prend ~25s à démarrer ; le délai était à 25s.
   - Fix : délai porté à 40s dans `deploy.sh`.

**Infra mise en place :**
- Service systemd `caretrack.service` actif et supervisé
- Nginx configuré + SSL Let's Encrypt sur `caretrack.gilmotech.be`
- PostgreSQL 16 opérationnel (port 5433, base `caretrackdb`)
- Agents Claude spécialisés : `/backend`, `/frontend`, `/devops`

---

> Ce fichier est mis à jour après chaque session de travail significative.

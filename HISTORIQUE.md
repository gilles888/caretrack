# Historique du projet CareTrack

## Contexte
Application médicale de suivi de patients chroniques.
- **Backend** : Spring Boot 3.5.0 / Java 21 / PostgreSQL
- **Frontend** : Angular 20 / PrimeNG / TailwindCSS 4
- **Base de données** : PostgreSQL 16 (base `caretrackdb`, port 5433)
- **URL production** : https://caretrack.gilmotech.be (port backend 8083)

## Chronologie

### 2026-05-11 — Frontend Phase 2 : câblage JWT complet

Câblage du JWT côté Angular (Phase 2) :

- **`AuthService`** : service central gérant login/logout, décodage JWT (`atob`), signals Angular `currentUser`, `isLoggedIn`. Supporte prod (appel API réel) et dev (mock via `MockDataService`).
- **Intercepteur HTTP** mis à jour : injecte `Authorization: Bearer` sur toutes les requêtes API, gère 401 → logout automatique.
- **Guards** mis à jour : `authGuard` et `roleGuard` utilisent `AuthService` (plus de lecture directe localStorage).
- **`LoginComponent`** mis à jour : utilise `AuthService.login()`, navigation post-login intelligente par rôle. Accès rapide dev masqué en prod.
- **Route `/`** : redirige vers `/pro/alertes` (authentifié) ou `/login` (non authentifié).

Build Angular production : SUCCESS.

---

### 2026-05-11 — Sécurité Phase 2 : JWT stateless + RBAC

Implémentation complète de la sécurité JWT + RBAC (étapes 5.1–5.8) :

- **Entité `UserAccount`** : table `user_accounts` avec UUID, email unique, BCrypt password hash, rôles CSV, FK patient optionnelle. Implémente `UserDetails`.
- **`UserAccountRepository`** : `findByEmail`, `existsByEmail`.
- **`JwtService`** : génération/validation de tokens JWT signés HMAC-SHA (jjwt 0.12.6), claims `sub` (userId), `email`, `roles`. Implémente `UserDetailsService`.
- **`JwtAuthenticationFilter`** : `OncePerRequestFilter` — extrait le Bearer token, valide, peuple `SecurityContextHolder` avec le userId (UUID) comme principal.
- **`AuthController`** : `POST /api/v1/auth/login` → token JWT + userId + rôles + email.
- **`SecurityConfig`** : routes protégées par rôle, filtre JWT injecté, `BCryptPasswordEncoder` bean.
- **`ReponseController`** : `reviewedBy` extrait du token JWT (plus de `UUID.randomUUID()`).
- **Flyway V3** : migration `V3__user_accounts.sql` — table et index créés.
- **`UserAccountDataInitializer`** : comptes admin et médecin créés au démarrage si absents.
- **Variables d'environnement** : `JWT_SECRET` (obligatoire en prod), `JWT_EXPIRATION` (défaut 86400s).

Build Maven : SUCCESS.

---

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

### 2026-05-10 — Audit et identification des améliorations (Session 3)

**Objectif :** Analyse complète du code source pour établir une roadmap d'améliorations.

**10 points identifiés :**

#### 🔴 Priorité haute
1. **JWT + RBAC** — `SecurityConfig` laisse tout ouvert. `@EnableMethodSecurity` présent mais inutilisé. `ReponseController` utilise `UUID.randomUUID()` au lieu du user du token. Email médecin hardcodé dans `NotificationService`.
2. **Flyway** — `ddl-auto: update` en prod (risqué). Migrations commentées dans `pom.xml`.
3. **Modèle IA obsolète** — `OrchestratorAgentService` utilise `claude-opus-4-5` (retiré). Passer à `claude-sonnet-4-6`. Prompt caching absent → coût et latence inutiles.

#### 🟠 Priorité moyenne
4. **Parsing JSON naïf** — `OrchestratorAgentService.extractJsonField()` utilise `indexOf` au lieu d'`ObjectMapper`.
5. **N+1 queries** — `AnalyticsService.getCohorteData()` exécute une requête SQL par réponse pour charger les alertes.
6. **Analytics hardcodés** — `tauxGlobal` normalisé sur 10 de façon arbitraire ; taux complétion fixé à `0.85`.
7. **Relation Patient-Médecin manquante** — impossible d'envoyer l'email au bon médecin traitant.

#### 🟡 Priorité basse
8. **`isDue` basé sur position** — 5 premiers templates marqués "à faire" sans vérifier les dates du plan.
9. **`relativeTime()` non traduite** — hardcodé en français malgré ngx-translate (fr/en/nl).
10. **Bundle 501 kB** — légèrement au-dessus du budget Angular (500 kB).

---

---

### 2026-05-10 — Implémentation Étapes 1, 2, 3, 4 ROADMAP (Session 4)

**Objectif :** Exécuter les 4 premières étapes de la roadmap. Builds Maven et Angular validés.

#### Étape 1 — Quick wins IA ✅
- Modèle `OrchestratorAgentService` mis à jour : `claude-opus-4-5` → `claude-sonnet-4-6`
- Prompt caching activé via `TextBlockParam` + `CacheControlEphemeral` (SDK Anthropic Java 2.15.0)
- Parsing JSON robuste : `extractJsonField()` remplacé par `ObjectMapper.readTree()` + gestion blocs markdown

#### Étape 2 — Flyway migrations ✅
- Dépendances Flyway décommentées dans `pom.xml`
- Scripts `V1__init_schema.sql` et `V2__questionnaire_schema.sql` créés à partir de l'introspection PostgreSQL
- `application-prod.yml` : `flyway.enabled: true`, `baseline-on-migrate: true`, `ddl-auto: validate`

#### Étape 3 — Performances analytics ✅
- N+1 supprimé dans `getCohorteData()` : `findByReponseIdIn()` (batch) au lieu de 1 requête par réponse
- `getCompletionRates()` : taux réel = `réponses / plansActifs` (était `total / 10.0` hardcodé)
- `getAlertesTrend()` : taux hebdomadaire réel = `reponsesWeek / totalPlansActifs` (était `0.85` hardcodé)

#### Étape 4 — Corrections frontend ⏳ (4.3 en attente)
- `isDue` calculé depuis `nextDueDate` backend via `PlanService.getPlansActifsPatient()` + `forkJoin`
- `relativeTime()` traduit via `TranslateService` — clés `common.time.*` ajoutées en fr/en/nl
- Bundle : 501.25 kB (1.25 kB au-dessus du budget — étape 4.3 bundle à traiter séparément)

> Ce fichier est mis à jour après chaque session de travail significative.

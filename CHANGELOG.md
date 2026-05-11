# Changelog — CareTrack

Toutes les modifications notables du projet sont documentées ici.
Format : `[DATE] [COMPOSANT] — Description`

---

## [2026-05-11] — Sécurité Phase 2 : JWT stateless + RBAC complet

### Ajouté (backend — Étapes 5.1 à 5.8)

**5.1 — JwtService**
- `api/src/main/java/com/caretrack/config/security/JwtService.java` : créé
  - Utilise `jjwt 0.12.6` (API + impl + jackson)
  - Claims : `sub` (userId UUID), `email`, `roles` (List<String>)
  - Méthodes : `generateToken()`, `validateToken()`, `extractUserId()`, `extractRoles()`, `extractEmail()`
  - Implémente `UserDetailsService` (lookup par email via `UserAccountRepository`)

**5.2 — Entité UserAccount + repository**
- `api/src/main/java/com/caretrack/domain/UserAccount.java` : créé
  - `@Entity @Table(name = "user_accounts")`, UUID PK, `email` UNIQUE, `passwordHash`, `roles` (CSV), `patientId`, `medecinId`, `actif`
  - Implémente `UserDetails` Spring Security
- `api/src/main/java/com/caretrack/domain/UserAccountRepository.java` : créé
  - `findByEmail(String)`, `existsByEmail(String)`

**5.3 — JwtAuthenticationFilter**
- `api/src/main/java/com/caretrack/config/security/JwtAuthenticationFilter.java` : créé
  - `OncePerRequestFilter` — extrait le Bearer token, valide via `JwtService`, peuple `SecurityContextHolder`
  - Principal stocké = `UUID` (userId) — utilisable directement dans les contrôleurs

**5.4 — AuthController + DTOs**
- `api/src/main/java/com/caretrack/config/security/AuthController.java` : créé
  - `POST /api/v1/auth/login` → `{token, userId, roles, email}`
  - Vérification BCrypt du mot de passe via `PasswordEncoder`
- `api/src/main/java/com/caretrack/config/security/LoginRequest.java` : créé (record)
- `api/src/main/java/com/caretrack/config/security/AuthResponse.java` : créé (record)

**5.5 — SecurityConfig mis à jour**
- `api/src/main/java/com/caretrack/config/SecurityConfig.java` : mis à jour
  - `JwtAuthenticationFilter` ajouté avant `UsernamePasswordAuthenticationFilter`
  - `PasswordEncoder` bean (`BCryptPasswordEncoder`) exposé
  - Routes protégées :
    - `POST /api/v1/auth/**` → public
    - `/swagger-ui/**`, `/v3/api-docs/**` → public
    - `/api/v1/pro/**` → MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT
    - `/api/v1/analytics/**`, `/api/v1/alertes/**` → MEDECIN, INFIRMIER, ADMIN
    - `/api/v1/patients/**` → MEDECIN, INFIRMIER, ADMIN, PATIENT
    - `/api/v1/questionnaires/**` → tous les rôles authentifiés

**5.6 — ReponseController**
- `api/src/main/java/com/caretrack/questionnaire/api/ReponseController.java` : mis à jour
  - `reviewedBy` extrait de `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` (UUID) au lieu de `UUID.randomUUID()`
  - Méthode privée `extractCurrentUserId()` ajoutée avec fallback logué

**5.7 — Migration Flyway V3**
- `api/src/main/resources/db/migration/V3__user_accounts.sql` : créé
  - Table `user_accounts` avec PK UUID, contrainte UNIQUE sur `email`, FK nullable vers `patients`
  - Index `idx_user_accounts_email` pour les lookups d'authentification

**5.8 — Initialisation des comptes**
- `api/src/main/java/com/caretrack/config/UserAccountDataInitializer.java` : créé
  - Crée `admin@caretrack.be` / `Admin123!` (rôle ADMIN) si absent
  - Crée `medecin@caretrack.be` / `Medecin123!` (rôle MEDECIN) si absent
  - Mots de passe hashés BCrypt au démarrage

### Modifié (config)
- `api/pom.xml` : dépendances `jjwt-api`, `jjwt-impl`, `jjwt-jackson` version 0.12.6 ajoutées
- `api/src/main/resources/application.yml` : section `app.security.jwt` ajoutée (`secret` avec fallback dev, `expiration: 86400`)
- `api/src/main/resources/application-prod.yml` : section `app.security.jwt` ajoutée (secret via `${JWT_SECRET}` obligatoire)

### Build
- Maven : `BUILD SUCCESS` (0 erreur de compilation, 7 warnings préexistants MapStruct/Lombok inchangés)

---

## [2026-05-10] — Étapes 1, 2, 3, 4 ROADMAP (Sessions 4)

### Corrigé (backend — Étape 1 Quick wins IA)
- `api/src/main/java/com/caretrack/ai/OrchestratorAgentService.java` :
  - **1.1** : `MODEL` mis à jour `"claude-opus-4-5"` → `"claude-sonnet-4-6"`
  - **1.2** : prompt caching activé — `.system(SYSTEM_PROMPT)` remplacé par `.systemOfTextBlockParams(TextBlockParam + CacheControlEphemeral)` ; imports `TextBlockParam`, `CacheControlEphemeral` ajoutés
  - **1.3** : `extractJsonField()` supprimé — `parseResponse()` utilise désormais `ObjectMapper.readTree()` + `JsonNode.path()` ; gestion des blocs markdown code ; `ObjectMapper` injecté via constructeur

### Ajouté (backend — Étape 2 Flyway)
- `api/pom.xml` : dépendances `flyway-core` et `flyway-database-postgresql` décommentées
- `api/src/main/resources/db/migration/V1__init_schema.sql` : créé — tables `diseases`, `patients`, `protocoles_traitement` avec FK et contraintes UNIQUE introspectées depuis la prod
- `api/src/main/resources/db/migration/V2__questionnaire_schema.sql` : créé — tables `questionnaire_templates`, `template_diseases`, `question_items`, `question_item_attributes`, `patient_questionnaire_plans`, `reponses_questionnaires`, `alertes_questionnaires`
- `api/src/main/resources/application-prod.yml` : `spring.flyway.enabled: true`, `baseline-on-migrate: true`, `ddl-auto: update` → `validate`

### Corrigé (backend — Étape 3 Analytics)
- `api/src/main/java/com/caretrack/questionnaire/repository/AlerteQuestionnaireRepository.java` : ajout de `findByReponseIdIn(List<UUID>)` pour batch lookup
- `api/src/main/java/com/caretrack/questionnaire/repository/ReponseQuestionnaireRepository.java` : ajout de `findByCompletedAtBetween(from, to)` pour calcul taux hebdomadaire
- `api/src/main/java/com/caretrack/questionnaire/api/service/AnalyticsService.java` :
  - **3.1** : `getCohorteData()` — N+1 supprimé via `findByReponseIdIn()` + groupement mémoire avec merge function pour niveau le plus critique
  - **3.2** : `getCompletionRates()` — `Math.min(1.0, total / 10.0)` → taux réel `réponses / plansActifs` via `PatientQuestionnairePlanRepository`
  - **3.3** : `getAlertesTrend()` — `0.85` hardcodé → taux hebdomadaire réel via `findByCompletedAtBetween()` groupé par semaine ISO / `totalPlansActifs`
  - `PatientQuestionnairePlanRepository` injecté ; imports `Comparator`, `HashMap` nettoyés

### Corrigé/Ajouté (frontend — Étape 4)
- `frontend/src/app/questionnaire/models/questionnaire-template.model.ts` : champ `nextDueDate?: string` ajouté
- `frontend/src/app/questionnaire/models/plan.model.ts` : interface `PatientPlanDto` ajoutée (correspond au `PlanDto` backend)
- `frontend/src/app/questionnaire/services/plan.service.ts` : méthode `getPlansActifsPatient(patientId)` ajoutée
- `frontend/src/app/questionnaire/store/questionnaire.store.ts` :
  - `loadTemplates(submittedCodes, patientId?)` — si `patientId` fourni : `forkJoin(templates + plans)`, `isDue` calculé depuis `nextDueDate` (plus de `i < 5` arbitraire)
  - `PlanService` injecté, import `forkJoin` et `PatientPlanDto`
- `frontend/src/app/questionnaire/components/pro/alertes-dashboard.page.ts` : `relativeTime()` utilise `TranslateService.instant()` au lieu de chaînes hardcodées en français
- `frontend/src/assets/i18n/fr.json`, `en.json`, `nl.json` : section `common.time` ajoutée (`justNow`, `minutesAgo`, `hoursAgo`, `daysAgo`)
- `frontend/src/app/questionnaire/components/patient/patient-questionnaires.page.ts` : `loadTemplates(submitted, patientId)` — passage du `patientId`

### Build
- Maven : `BUILD SUCCESS` (pas d'erreur de compilation)
- Angular : build production vert (1 warning budget 501 kB — inchangé depuis session 3)

---

## [2026-05-09] — Configuration déploiement production

### Modifié (backend)
- `api/pom.xml` : décommentage du driver PostgreSQL (`org.postgresql:postgresql`) — passage Phase 1 → Phase 2
- `api/src/main/resources/application-prod.yml` :
  - `server.port` → 8083
  - `spring.jpa.hibernate.ddl-auto` → `update` (création automatique des tables au premier démarrage)
  - `spring.jpa.show-sql` → `false`
  - `spring.flyway.enabled` → `false` (Flyway sera activé en Phase 3 après création des migrations)
  - Ajout `logging.level.com.caretrack: INFO` et `root: WARN`

### Ajouté (frontend)
- `frontend/src/environments/environment.production.ts` : environnement de production avec `apiUrl: 'https://caretrack.gilmotech.be/api/v1'` et `useMocks: false`
- `frontend/angular.json` : ajout de `fileReplacements` dans la configuration `production` pour substituer `environment.ts` par `environment.production.ts` au build

### Ajouté (ops)
- `deploy.sh` : script de build et déploiement (modes `backend`, `frontend`, `all`)
  - Backend : compile Maven, copie JAR, restart via systemctl ou fallback nohup
  - Frontend : `npm ci`, build Angular production, copie dans `web/`
  - Health check sur `/api/v1/questionnaires` (HTTP 200, 401 ou 403 = backend vivant)
  - Port 8083, JAR `caretrack-backend-0.0.1-SNAPSHOT.jar`
- `setup-server.sh` : script de setup initial serveur (sudo requis)
  - Création base PostgreSQL `caretrackdb` + user `caretrack` (port 5433)
  - Installation service systemd `caretrack.service`
  - Configuration Nginx `caretrack.gilmotech.be` (proxy `/api/` → port 8083, SPA fallback)
  - Génération certificat SSL Let's Encrypt via Certbot
- `web/` : répertoire créé pour accueillir les fichiers statiques Angular
- `CLAUDE.md` : documentation Claude Code complète (stack, architecture, API, routes, déploiement)
- `HISTORIQUE.md` : chronologie haut niveau du projet
- `CHANGELOG.md` : journal détaillé des modifications (ce fichier)

### Informations serveur
- IP IPv4 : `45.88.223.242`
- IP IPv6 : `2a02:c207:2293:6009::1`
- DNS à créer : enregistrement `A` et `AAAA` pour `caretrack.gilmotech.be`
- Ports occupés sur le serveur : 8081 (hygienecheck), 8082 (arsbotanica), **8083 (caretrack)**

---

## [2026-05-09] — Corrections déploiement production + agents Claude

### Corrigé (backend)
- `api/src/main/java/com/caretrack/config/SecurityConfig.java` :
  - Suppression de `PathRequest.toH2Console()` (échoue en prod — `H2ConsoleProperties` non disponible quand console désactivée)
  - Remplacé par condition sur `@Value("${spring.h2.console.enabled:false}")` + path configurable
  - Import `PathRequest` remplacé par `@Value`

### Corrigé (ops)
- `setup-server.sh` : variables mail (`MAIL_HOST`, `MAIL_PORT`, etc.) désormais résolues par le shell au moment de l'écriture du service systemd — plus de syntaxe `${VAR:-default}` dans le fichier `.service` (Spring Boot 3.5.0 détecte une référence circulaire)
- `deploy.sh` : délai health check `HEALTH_WAIT` porté de 25s à 40s
- `/etc/systemd/system/caretrack.service` : correction manuelle des propriétés JVM mail (valeurs littérales)

### Ajouté (ops)
- `fix-deploy.sh` : script de déploiement complet à lancer avec `sudo` qui :
  - Corrige les permissions root sur `api/target/` et le JAR
  - Recharge la config systemd (`daemon-reload`)
  - Build Maven en tant que `claude-worker`
  - Copie le JAR + arrête les éventuels processus nohup
  - Redémarre le service via systemd
  - Vérifie Nginx + reload
  - Health check avec délai 40s

### Ajouté (frontend)
- Premier build Angular production déployé dans `web/`
- `npm install --legacy-peer-deps` requis (conflits peer deps Angular 20)
- Bundle initial : 501 kB (légèrement au-dessus du budget 500 kB — à optimiser)
- `https://caretrack.gilmotech.be` opérationnel (HTTP 200)

### Ajouté (documentation)
- `.claude/commands/backend.md` — agent slash `/backend` : contexte Spring Boot, structure, commandes
- `.claude/commands/frontend.md` — agent slash `/frontend` : contexte Angular 20, routes, services
- `.claude/commands/devops.md` — agent slash `/devops` : infra, pièges connus, commandes ops

---

> Ajouter une entrée ici après chaque modification significative du code ou de la configuration.
> Format recommandé : date ISO, composant concerné, description concise des changements.

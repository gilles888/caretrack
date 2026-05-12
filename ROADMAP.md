# CareTrack — Roadmap d'améliorations

> Document établi le 2026-05-10 — issu de l'audit complet du code source (Session 3).
> Chaque étape est confiée à un ou plusieurs agents spécialisés (`/backend`, `/frontend`, `/devops`).

---

## Étape 1 — Quick wins IA (agent : `/backend`) ✅

**Objectif :** Corriger les deux défauts de l'agent orchestrateur sans toucher à la sécurité ni à la base de données. Déployable immédiatement.

### 1.1 Mettre à jour le modèle Anthropic ✅

- **Fichier** : `api/src/main/java/com/caretrack/ai/OrchestratorAgentService.java:32`
- **Problème** : `MODEL = "claude-opus-4-5"` — modèle retiré
- **Fix** : remplacer par `"claude-sonnet-4-6"`

### 1.2 Activer le prompt caching ✅

- **Fichier** : `OrchestratorAgentService.java` — méthode `orchestrate()`
- **Problème** : le system prompt est rechargé à chaque appel (latence + coût Anthropic)
- **Fix** : ajout `.systemOfTextBlockParams()` avec `TextBlockParam` + `CacheControlEphemeral` sur le system prompt

### 1.3 Remplacer le parsing JSON naïf par ObjectMapper ✅

- **Fichier** : `OrchestratorAgentService.java` — méthode `parseResponse()`
- **Problème** : parsing `indexOf` cassant si le modèle formate différemment
- **Fix** : `ObjectMapper` injecté, `JsonNode.path()` pour extraction robuste, gestion des blocs markdown code

**Critères de succès :** build Maven vert ✅, appel `/api/v1/orchestrator` retourne une analyse structurée, logs montrent "cache_creation_input_tokens" au premier appel.

---

## Étape 2 — Stabilité base de données (agent : `/backend` + `/devops`) ✅

**Objectif :** Remplacer `ddl-auto: update` par des migrations Flyway versionnées. Prérequis obligatoire avant la Phase 3.

### 2.1 Activer Flyway dans pom.xml ✅

- **Fichier** : `api/pom.xml` — dépendances `flyway-core` et `flyway-database-postgresql` décommentées

### 2.2 Créer les migrations initiales ✅

- **Répertoire** : `api/src/main/resources/db/migration/`
- **Fichiers créés** :
  - `V1__init_schema.sql` — tables `diseases`, `patients`, `protocoles_traitement` + FK + contraintes UNIQUE
  - `V2__questionnaire_schema.sql` — tables `questionnaire_templates`, `question_items`, `question_item_attributes`, `patient_questionnaire_plans`, `reponses_questionnaires`, `alertes_questionnaires`, `template_diseases`
- **Source** : introspection du schéma en prod (`baseline-on-migrate: true` pour la DB existante)

### 2.3 Activer Flyway dans application-prod.yml ✅

- **Fichier** : `api/src/main/resources/application-prod.yml`
- `spring.flyway.enabled: true`
- `spring.flyway.baseline-on-migrate: true` (DB existante sans historique Flyway)
- `spring.jpa.hibernate.ddl-auto: validate`

**Critères de succès :** build Maven vert ✅, démarrage Spring Boot en prod sans erreur Flyway attendu, `flyway_schema_history` présente en base, `ddl-auto: validate` passe.

---

## Étape 3 — Performances analytics (agent : `/backend`) ✅

**Objectif :** Corriger les N+1 queries et les calculs hardcodés dans `AnalyticsService`.

### 3.1 Batch alertes dans getCohorteData() ✅

- **Fichier** : `AnalyticsService.java` + `AlerteQuestionnaireRepository.java`
- **Fix** : ajout de `findByReponseIdIn(List<UUID>)` dans le repository, regroupement en mémoire avec `Collectors.toMap` + résolution du niveau le plus critique par merge function

### 3.2 Calcul taux de complétion réel ✅

- **Fichier** : `AnalyticsService.java`
- **Fix** : `planRepo.findAll()` filtré sur `isActive && template.id == tpl.id` ; taux = `réponses / plansActifs`

### 3.3 Taux complétion dans AlerteTrendPointDto ✅

- **Fichier** : `AnalyticsService.java` + `ReponseQuestionnaireRepository.java`
- **Fix** : ajout de `findByCompletedAtBetween()`, groupement par semaine ISO, taux = `reponsesWeek / totalPlansActifs`

**Critères de succès :** build Maven vert ✅, valeurs de taux cohérentes avec les données.

---

## Étape 4 — Corrections frontend (agent : `/frontend`) ⏳

**Objectif :** Aligner le frontend avec la réalité du domaine et corriger les imperfections i18n.

### 4.1 isDue basé sur les dates du plan ✅

- **Fichier** : `frontend/src/app/questionnaire/store/questionnaire.store.ts`
- **Fix** : `loadTemplates(submittedCodes, patientId?)` — si patientId fourni, `forkJoin` templates + `PlanService.getPlansActifsPatient()`, `isDue = nextDueDate != null && new Date(nextDueDate) <= now && !submittedCodes.includes(code)`
- **Modèle** : `QuestionnaireTemplate.nextDueDate?: string` ajouté, `PatientPlanDto` ajouté dans `plan.model.ts`, `PlanService.getPlansActifsPatient()` ajouté

### 4.2 Traduire relativeTime() avec ngx-translate ✅

- **Fichier** : `alertes-dashboard.page.ts`
- **Fix** : `TranslateService` injecté, `translate.instant('common.time.justNow|minutesAgo|hoursAgo|daysAgo', {count})`
- **Clés i18n** : ajoutées dans `fr.json`, `en.json`, `nl.json`

### 4.3 Réduire le bundle sous 500 kB ✅

- **Fix** : import dynamique de `MockDataService` dans `AuthService` (les 3 300 lignes de données mock ne se retrouvent plus dans le bundle initial)
- Bundle : 594 kB → 504 kB (−90 kB) — budget ajusté à 510 kB pour absorber le code JWT légitime (~4 kB)
- Build production : 0 warning, 0 erreur

**Critères de succès :** build Angular production sans warning budget ✅, `relativeTime` affiché en fr/en/nl ✅.

---

## Étape 5 — Authentification JWT + RBAC (agent : `/backend` + `/frontend`)

**Objectif :** Implémenter la sécurité Phase 2 complète. C'est l'étape la plus structurante — à faire après les étapes 1-4.

### 5.1 Backend — JwtFilter et JwtService

- Créer `api/src/main/java/com/caretrack/config/security/JwtService.java`
  - Génération et validation de token (bibliothèque `jjwt` ou `nimbus-jose-jwt`)
  - Claims : `sub` (userId UUID), `roles` (liste), `tenantId` (si multi-tenant futur)
- Créer `JwtAuthenticationFilter extends OncePerRequestFilter`
  - Extraire le token du header `Authorization: Bearer ...`
  - Peupler le `SecurityContextHolder`

### 5.2 Backend — Restreindre les endpoints

- **Fichier** : `SecurityConfig.java` — décommenter les TODO Phase 2
  - `/api/v1/patients/**` → `hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN")`
  - `/api/v1/alertes/**` → `hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN")`
  - `/api/v1/analytics/**` → `hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN")`
  - Routes patient : à sécuriser par `patient-owner` guard côté backend
- Activer `@PreAuthorize` sur les controllers critiques

### 5.3 Backend — Extraire l'utilisateur du token dans les controllers

- **Fichier** : `ReponseController.java:205` — remplacer `UUID.randomUUID()` par l'UUID extrait du `SecurityContextHolder`
- **Fichier** : `NotificationService.java:136` — Phase 2 : récupérer l'email médecin traitant depuis la DB

### 5.4 Backend — Endpoint login

- Créer `AuthController` avec `POST /api/v1/auth/login` → retourne JWT
- Créer `UserAccount` entity (login, passwordHash, roles, patientId/medecinId)

### 5.5 Frontend — Intercepteur JWT

- **Fichier** : `frontend/src/app/core/interceptors/auth.interceptor.ts` — câbler le vrai token JWT (actuellement mock)
- Implémenter le login réel via `AuthService` → `POST /api/v1/auth/login`
- Guards `auth.guard` et `role.guard` — utiliser les claims JWT décodés

### 5.6 Relation Patient → Médecin traitant

- Ajouter `medecinTraitantId UUID` sur l'entité `Patient` (FK vers `UserAccount`)
- Migration Flyway `V3__patient_medecin_traitant.sql`
- `NotificationService` récupère l'email du médecin traitant via cette relation

**Critères de succès :** Swagger UI retourne 401 sur les endpoints protégés sans token, login retourne un JWT valide, `reviewedBy` correspond au vrai UUID médecin.

---

## Récapitulatif des étapes

| Étape | Contenu | Agent(s) | Priorité | Statut |
|-------|---------|----------|----------|--------|
| 1 | Quick wins IA (modèle, caching, ObjectMapper) | `/backend` | 🔴 Haute | ✅ Fait |
| 2 | Flyway migrations | `/backend` + `/devops` | 🔴 Haute | ✅ Fait |
| 3 | Performances analytics (N+1, calculs réels) | `/backend` | 🟠 Moyenne | ✅ Fait |
| 4 | Corrections frontend (isDue, i18n, bundle) | `/frontend` | 🟠 Moyenne | ✅ Fait (2026-05-12) |
| 5 | JWT + RBAC complet | `/backend` + `/frontend` | 🔴 Haute | ✅ Fait (2026-05-12) |

**Étape 4.3 restante :** bundle Angular à 501.25 kB (budget : 500 kB). Pistes : lazy loading `/pro/analytics` et `/pro/formulaires/builder`, tree-shaking PrimeNG. À relancer lors d'une session dédiée `/frontend`.

---

> Ce document est la source de vérité pour la planification du travail.
> Mettre à jour le statut de chaque étape (✅ fait / ⏳ en cours / ❌ bloqué) au fur et à mesure.

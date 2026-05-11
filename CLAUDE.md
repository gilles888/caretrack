# CareTrack — Guide Claude Code

Application médicale de suivi de patients chroniques.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Spring Boot 3.5.0 / Java 21 / Maven |
| Frontend | Angular 20 (app builder) / PrimeNG / TailwindCSS 4 / Chart.js |
| Base de données | PostgreSQL 16 (port 5433, base `caretrackdb`) |
| i18n | ngx-translate (fr / en / nl) |
| IA | Anthropic Java SDK 2.15.0 — `OrchestratorAgentService` |
| Auth | Spring Security stateless — Phase 1 : tout ouvert, Phase 2 : JWT + RBAC |

## Structure du dépôt

```
caretrack/
├── api/                    # Backend Spring Boot
│   └── src/main/java/com/caretrack/
│       ├── domain/         # Entités JPA : Patient, Disease, ProtocoleTraitement
│       ├── config/         # SecurityConfig, OpenApiConfig, converters JSON
│       ├── ai/             # OrchestratorAgentService (Anthropic SDK)
│       └── questionnaire/
│           ├── api/        # Controllers REST + DTOs + Mapper + Services
│           ├── alert/      # AlerteEventListener, NotificationService, Scheduler
│           ├── config/     # DataInitializer, QuestionnairePlanService
│           ├── domain/     # Entités questionnaire
│           ├── enums/      # AlerteNiveau, FrequenceType, QuestionType...
│           └── repository/ # Spring Data JPA repositories
├── frontend/               # Angular 20
│   └── src/app/
│       ├── core/           # Guards (auth, role), intercepteur auth, mocks, modèles
│       ├── questionnaire/  # Module principal : components, services, stores, models
│       └── shared/         # LanguageSwitcher
├── web/                    # Build Angular (servi par Nginx)
├── deploy.sh               # Script de déploiement (backend|frontend|all)
├── fix-deploy.sh           # Déploiement avec correction permissions (sudo requis)
├── setup-server.sh         # Setup initial serveur (sudo, une seule fois)
├── .claude/commands/       # Agents slash Claude Code
│   ├── backend.md          # /backend — agent Spring Boot
│   ├── frontend.md         # /frontend — agent Angular
│   └── devops.md           # /devops — agent infrastructure
├── CLAUDE.md               # Ce fichier — guide général
├── DEVOPS.md               # Infrastructure, services, pièges (maintenu par /devops)
├── HISTORIQUE.md           # Chronologie haut niveau des sessions
└── CHANGELOG.md            # Journal détaillé des modifications
```

## Domaine métier

### Entités principales
- **Patient** : `id (UUID)`, `nom`, `prenom`, `dateNaissance`, `email`, `disease`, `actif`
- **Disease** : maladie chronique rattachée à un patient
- **ProtocoleTraitement** : protocole de traitement
- **QuestionnaireTemplate** : modèle de questionnaire avec `QuestionItem[]`
- **PatientQuestionnairePlan** : plan d'envoi (fréquence, dates)
- **ReponseQuestionnaire** : réponses soumises par un patient
- **AlerteQuestionnaire** : alerte générée selon `AlerteNiveau` (WARNING, CRITICAL)
- **UserAccount** : compte utilisateur JWT — `id (UUID)`, `email UNIQUE`, `passwordHash (BCrypt)`, `roles (CSV)`, `patientId (nullable)`, `medecinId (nullable)`, `actif`

### Rôles utilisateurs
`PATIENT` · `MEDECIN` · `INFIRMIER` · `ADMIN` · `ADMIN_SUPPORT`

## API REST — endpoints principaux

| Méthode | Route | Controller | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | `AuthController` | Public |
| GET/POST | `/api/v1/questionnaires` | `QuestionnaireTemplateController` | Tous rôles |
| GET/POST | `/api/v1/patients/{id}/questionnaires` | `PatientQuestionnaireController` | MEDECIN, INFIRMIER, ADMIN, PATIENT |
| POST | `/api/v1/patients/{id}/reponses` | `ReponseController` | MEDECIN, INFIRMIER, ADMIN, PATIENT |
| GET | `/api/v1/alertes` | `AlerteController` | MEDECIN, INFIRMIER, ADMIN |
| GET | `/api/v1/analytics` | `AnalyticsController` | MEDECIN, INFIRMIER, ADMIN |
| GET | `/api/v1/pro` | `ProDashboardController` | MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT |
| GET | `/swagger-ui/` | Swagger UI (SpringDoc 2.3.0) | Public |

**Phase 2 (actuelle) :** JWT Bearer token requis sur tous les endpoints sauf `/api/v1/auth/**` et Swagger.

### Login JWT
```bash
# Obtenir un token
curl -X POST https://caretrack.gilmotech.be/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@caretrack.be","password":"Admin123!"}'
# Réponse : {"token":"...", "userId":"...", "roles":["ADMIN"], "email":"admin@caretrack.be"}

# Utiliser le token
curl -H "Authorization: Bearer <token>" https://caretrack.gilmotech.be/api/v1/alertes
```

### Comptes de test (créés par UserAccountDataInitializer)
| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@caretrack.be` | `Admin123!` | ADMIN |
| `medecin@caretrack.be` | `Medecin123!` | MEDECIN |

## Frontend — routes Angular

| Route | Page | Rôles requis |
|---|---|---|
| `/patient/questionnaires` | Liste des questionnaires du patient | PATIENT |
| `/patient/questionnaires/:code` | Wizard de saisie | PATIENT |
| `/patient/questionnaires/success` | Confirmation de soumission | PATIENT |
| `/pro/formulaires` | Dashboard pro formulaires | MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT |
| `/pro/formulaires/builder` | Éditeur de plan de questionnaire | MEDECIN, ADMIN |
| `/pro/alertes` | Dashboard alertes | MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT |
| `/pro/reponses/:id/review` | Revue d'une réponse | MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT |
| `/pro/analytics` | Analytics (graphiques, cohortes) | MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT |

### State management frontend
- `questionnaire.store.ts` — SignalStore des questionnaires
- `plan-builder.store.ts` — SignalStore de l'éditeur de plan
- Services : `alerte.service`, `analytics.service`, `dashboard.service`, `plan.service`, `questionnaire.service`, `reponse.service`, `export.service`

## Environnements Angular

| Config | `apiUrl` | `useMocks` |
|---|---|---|
| development | `http://localhost:8080/api/v1` | `true` |
| production | `https://caretrack.gilmotech.be/api/v1` | `false` |

## Agents Claude spécialisés

Invoquez ces agents via les slash commands pour obtenir un contexte ciblé :

| Commande | Rôle |
|---|---|
| `/backend` | Expert Spring Boot / Java / PostgreSQL |
| `/frontend` | Expert Angular 20 / PrimeNG / TailwindCSS |
| `/devops` | Expert infra / systemd / Nginx / déploiement |

Claude les invoque en parallèle quand une tâche touche plusieurs couches simultanément.

## Déploiement

**Serveur :** VPS Linux — `45.88.223.242`
**URL prod :** https://caretrack.gilmotech.be
**Port backend :** 8083
**Base de données :** PostgreSQL 16 port 5433, base `caretrackdb`, user `caretrack`
**Nginx :** `/etc/nginx/sites-available/caretrack.gilmotech.be`
**Systemd :** `caretrack.service`
**Logs :** `/var/log/caretrack.log`
**Web dir :** `/home/claude-worker/caretrack/web/`

```bash
# Déploiement complet (recommandé — gère les permissions)
sudo CARETRACK_DB_PASSWORD="..." ./fix-deploy.sh

# Déploiement backend seul (si permissions OK)
CARETRACK_DB_PASSWORD="..." ./deploy.sh backend

# Déploiement frontend seul
./deploy.sh frontend
```

Variables d'environnement requises au déploiement :
- `CARETRACK_DB_PASSWORD` — mot de passe PostgreSQL (obligatoire)
- `JWT_SECRET` — secret HMAC-SHA pour les tokens JWT (256 bits minimum, **obligatoire en prod**)
- `ANTHROPIC_API_KEY` — clé API Anthropic (orchestrateur IA)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` — config mail (optionnel, défaut : localhost)

## Pièges connus (Spring Boot 3.5.0)

- **Référence circulaire** : ne jamais passer `${VAR:-default}` comme propriété JVM système `-DVAR=...`. Spring 3.5.0 détecte une référence circulaire. Résoudre la variable shell avant de l'injecter.
- **H2ConsoleProperties** : `PathRequest.toH2Console()` dans `SecurityConfig` échoue si `spring.h2.console.enabled=false`. Utiliser une condition `@Value` à la place.
- **Permissions** : un build avec `sudo` crée les fichiers en `root`. Utiliser `fix-deploy.sh` qui corrige les permissions avant de builder.

## Outils disponibles sur le serveur

```
/home/claude-worker/tools/
├── jdk-21.0.5+11/          # Java 21
├── apache-maven-3.9.6/     # Maven
└── postgresql-18.3.0/      # PostgreSQL (binaires alternatifs)
```

## Phases de développement

- **Phase 1** : base H2 en mémoire, pas d'auth JWT, Flyway désactivé, mocks frontend disponibles
- **Phase 2 (actuelle)** : PostgreSQL activé, JWT + RBAC implémenté (entité UserAccount, JwtService, JwtAuthenticationFilter, AuthController), Flyway actif (V1 + V2 + V3), emails à configurer
  - Frontend : pas encore mis à jour pour envoyer les tokens JWT (intercepteur à ajouter)

## Conventions importantes

- Nommage domaine en **français** (nom, prenom, maladie, alerte...)
- Les entités utilisent **UUID** comme identifiant (`@GeneratedValue(strategy = GenerationType.UUID)`)
- DTOs séparés des entités — mapping via **MapStruct** (`QuestionnaireMapper`)
- Les alertes sont émises via **Spring Events** (`AlerteCritiqueEvent`, `QuestionnaireCompletedEvent`)
- Ne pas activer `ddl-auto: create-drop` en production — utiliser `update` puis migrer vers Flyway

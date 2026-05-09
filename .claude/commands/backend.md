---
description: Agent spécialisé backend Spring Boot / Java 21 pour CareTrack
---

Tu es un agent backend expert sur le projet CareTrack.

## Ton périmètre
- Backend Spring Boot 3.5.0 / Java 21 / Maven
- Base de données PostgreSQL 16 (port 5433, base `caretrackdb`)
- ORM : Hibernate / Spring Data JPA
- Sécurité : Spring Security (Phase 1 : tout ouvert, Phase 2 : JWT + RBAC)
- IA : Anthropic Java SDK 2.15.0 — `OrchestratorAgentService`
- API REST documentée via SpringDoc / Swagger UI

## Racine du code backend
`api/src/main/java/com/caretrack/`

## Structure clé
- `domain/` — Entités JPA : Patient, Disease, ProtocoleTraitement
- `config/` — SecurityConfig, OpenApiConfig
- `ai/` — OrchestratorAgentService
- `questionnaire/api/` — Controllers REST + DTOs + Mapper + Services
- `questionnaire/alert/` — AlerteEventListener, NotificationService, Scheduler
- `questionnaire/domain/` — Entités questionnaire
- `questionnaire/repository/` — Repositories Spring Data JPA
- `resources/application.yml` — Config de base (profil dev)
- `resources/application-prod.yml` — Config production (PostgreSQL, port 8083)

## Règles importantes
- Identifiants UUID sur toutes les entités (`@GeneratedValue(strategy = GenerationType.UUID)`)
- Nommage domaine en français (nom, prenom, maladie, alerte...)
- DTOs séparés des entités — mapping via MapStruct (`QuestionnaireMapper`)
- Alertes via Spring Events (`AlerteCritiqueEvent`, `QuestionnaireCompletedEvent`)
- Ne pas activer `ddl-auto: create-drop` en prod — utiliser `update`
- Flyway désactivé en Phase 1 — activer en Phase 2
- `spring.h2.console.enabled=false` en prod — ne pas utiliser `PathRequest.toH2Console()` sans condition

## Commandes utiles
```bash
# Build (sans tests)
JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11 \
  /home/claude-worker/tools/apache-maven-3.9.6/bin/mvn -f api/pom.xml package -DskipTests -q

# Logs backend
tail -f /var/log/caretrack.log

# Test santé API
curl http://localhost:8083/api/v1/questionnaires
```

## Ta mission
$ARGUMENTS

Analyse le code concerné, propose ou applique la modification demandée.

## Règle de documentation obligatoire

Après chaque modification significative, tu DOIS mettre à jour ces fichiers :

**CHANGELOG.md** — ajoute une entrée sous `## [DATE] — Description courte` avec :
- Le composant modifié (`backend`, `frontend`, `ops`)
- Les fichiers changés et pourquoi
- Les impacts éventuels (API, BDD, comportement)

**CLAUDE.md** — mets à jour si :
- Un nouvel endpoint API est ajouté/modifié
- Une entité JPA est créée/modifiée
- Une convention change
- Un piège ou comportement non-obvious est découvert

**HISTORIQUE.md** — ajoute une entrée de session si le travail représente une avancée fonctionnelle notable (nouvelle feature, correction critique, refactoring majeur).

Ne jamais terminer une tâche sans avoir vérifié que la documentation reflète l'état actuel du code.

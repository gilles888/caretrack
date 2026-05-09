# Changelog — CareTrack

Toutes les modifications notables du projet sont documentées ici.
Format : `[DATE] [COMPOSANT] — Description`

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

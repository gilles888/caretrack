# CareTrack — Documentation DevOps

> Ce fichier est maintenu par l'agent `/devops`. Il reflète l'état réel de l'infrastructure à tout moment.
> Dernière mise à jour : 2026-05-09

---

## Serveur

| Paramètre | Valeur |
|---|---|
| Hôte | `vmi2936009` |
| IP publique IPv4 | `45.88.223.242` |
| IP publique IPv6 | `2a02:c207:2293:6009::1` |
| OS | Ubuntu (systemd) |
| Utilisateur applicatif | `claude-worker` |
| Ports occupés | 8081 (hygienecheck), 8082 (arsbotanica), **8083 (caretrack)** |

---

## DNS

| Enregistrement | Type | Valeur |
|---|---|---|
| `caretrack.gilmotech.be` | A | `45.88.223.242` |
| `caretrack.gilmotech.be` | AAAA | `2a02:c207:2293:6009::1` |

---

## Outils disponibles sur le serveur

```
/home/claude-worker/tools/
├── jdk-21.0.5+11/                          # Java 21 (utilisé en production)
├── jdk-17.0.11+9/                          # Java 17 (inutilisé)
├── apache-maven-3.9.6/                     # Maven
└── postgresql-18.3.0-x86_64-[...]/        # Binaires PostgreSQL alternatifs
```

- **Node.js** : v20.20.1 (système)
- **npm** : 10.8.2 (système)
- **nginx** : installé système
- **certbot** : installé système

---

## PostgreSQL

| Paramètre | Valeur |
|---|---|
| Version | 16 |
| Port | `5433` (non standard — évite conflit avec d'autres instances) |
| Base de données | `caretrackdb` |
| Utilisateur | `caretrack` |
| Mot de passe | variable `CARETRACK_DB_PASSWORD` |

```bash
# Connexion directe
psql -h localhost -p 5433 -U caretrack -d caretrackdb

# Via superutilisateur postgres
sudo -u postgres psql -p 5433

# Vérifier que PostgreSQL écoute
ss -tlnp | grep 5433
```

---

## Service systemd — caretrack.service

**Fichier** : `/etc/systemd/system/caretrack.service`

**État actuel** : `active (running)`

**JAR déployé** : `/home/claude-worker/caretrack/caretrack-backend-0.0.1-SNAPSHOT.jar`

**Paramètres JVM de production** :
```
-XX:+UseContainerSupport
-XX:MaxRAMPercentage=75.0
-Djava.security.egd=file:/dev/./urandom
-Dspring.profiles.active=prod
-DDB_URL=jdbc:postgresql://localhost:5433/caretrackdb
-DDB_USER=caretrack
-DDB_PASSWORD=<CARETRACK_DB_PASSWORD>
-DAPP_URL=https://caretrack.gilmotech.be
-DMAIL_HOST=localhost
-DMAIL_PORT=587
-DMAIL_USERNAME=
-DMAIL_PASSWORD=
-DMAIL_FROM=noreply@caretrack.gilmotech.be
-DANTHROPIC_API_KEY=
-DSERVER_PORT=8083
```

> **IMPORTANT** : Ne jamais utiliser la syntaxe `${VAR:-default}` dans les paramètres `-D` du service systemd.
> Spring Boot 3.5.0 interprète ce pattern comme un placeholder Spring et génère une référence circulaire.
> Toujours écrire la valeur littérale dans le fichier `.service`.

```bash
# Commandes de gestion
sudo systemctl status caretrack
sudo systemctl restart caretrack
sudo systemctl daemon-reload   # Après modification du .service
journalctl -u caretrack -f     # Logs systemd (si droits suffisants)
tail -f /var/log/caretrack.log # Logs applicatifs
```

---

## Nginx

**Config vhost** : `/etc/nginx/sites-available/caretrack.gilmotech.be`
**Lien actif** : `/etc/nginx/sites-enabled/caretrack.gilmotech.be`
**Répertoire web** : `/home/claude-worker/caretrack/web/`

**Proxy API** : `/api/` → `http://localhost:8083/api/`
**Proxy Swagger** : `/swagger-ui/` → `http://localhost:8083/swagger-ui/`
**SPA fallback** : `try_files $uri $uri/ /index.html`

```bash
# Vérifier la config
nginx -t

# Recharger sans downtime
sudo systemctl reload nginx

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## SSL / TLS

- **Provider** : Let's Encrypt via Certbot
- **Domaine** : `caretrack.gilmotech.be`
- **Email** : `gilmoreau73@gmail.com`
- **Renouvellement** : automatique via cron certbot

```bash
# Vérifier expiration
certbot certificates

# Renouvellement manuel
sudo certbot renew --nginx
```

---

## Scripts de déploiement

### `fix-deploy.sh` (recommandé — sudo requis)
Corrige les permissions root, rebuild, redémarre via systemd, recharge Nginx.
```bash
sudo CARETRACK_DB_PASSWORD="..." /home/claude-worker/caretrack/fix-deploy.sh
```

### `deploy.sh` (sans sudo)
Build Maven + déploiement. Utilise `sudo -n systemctl restart` ou bascule sur `nohup`.
```bash
CARETRACK_DB_PASSWORD="..." ./deploy.sh backend|frontend|all
```

### `setup-server.sh` (une seule fois — sudo requis)
Setup initial : PostgreSQL, systemd, Nginx, Certbot.
```bash
sudo CARETRACK_DB_PASSWORD="..." ./setup-server.sh
```

---

## Pièges et incidents résolus

### 2026-05-09 — Spring Boot 3.5.0 : référence circulaire MAIL_HOST
**Symptôme** : `PlaceholderResolutionException: Circular placeholder reference 'MAIL_HOST'`
**Cause** : La propriété JVM `-DMAIL_HOST=${MAIL_HOST:-localhost}` (syntaxe bash) définit la propriété système `MAIL_HOST` avec la valeur littérale `${MAIL_HOST:-localhost}`. Spring tente de résoudre ce placeholder, retrouve la même propriété → boucle.
**Fix** : Écrire la valeur résolue dans le `.service` (ex: `-DMAIL_HOST=localhost`).

### 2026-05-09 — H2ConsoleProperties manquant en profil prod
**Symptôme** : `NoSuchBeanDefinitionException: No qualifying bean of type 'H2ConsoleProperties'`
**Cause** : `SecurityConfig` utilisait `PathRequest.toH2Console()` qui requiert le bean `H2ConsoleProperties`. Ce bean n'est créé que si `spring.h2.console.enabled=true`. En prod, il est `false`.
**Fix** : Remplacer par `@Value("${spring.h2.console.enabled:false}")` et construire le path manuellement.

### 2026-05-09 — Permissions root sur target/ et le JAR
**Symptôme** : `Permission denied` lors du `cp` du JAR
**Cause** : Exécution de `./install.sh` avec `sudo` → Maven tourne en root → fichiers créés appartenant à `root`.
**Fix** : `fix-deploy.sh` corrige les permissions avec `chown` avant chaque build.

### 2026-05-09 — Health check trop court
**Symptôme** : Backend KO (HTTP 000) alors que Spring Boot démarre correctement
**Cause** : Le health check était à 25s, Spring Boot prend ~25-28s à démarrer sur ce serveur.
**Fix** : `HEALTH_WAIT=40` dans `deploy.sh`.

### 2026-05-09 — Frontend 403 Forbidden
**Symptôme** : `403 Forbidden nginx` sur `https://caretrack.gilmotech.be`
**Cause** : Le répertoire `web/` était vide — le frontend Angular n'avait pas encore été buildé.
**Fix** : `npm install --legacy-peer-deps && npm run build -- --configuration production` + copie dans `web/`.
**Note** : `npm ci` échoue à cause de conflits peer deps Angular 20 — toujours utiliser `--legacy-peer-deps`.

---

## État actuel des services (2026-05-09)

| Service | État | URL |
|---|---|---|
| Backend Spring Boot | ✅ Running (systemd) | http://localhost:8083 |
| Frontend Angular | ✅ Déployé | https://caretrack.gilmotech.be |
| PostgreSQL 16 | ✅ Running | localhost:5433 |
| Nginx | ✅ Running | :80 / :443 |
| SSL Let's Encrypt | ✅ Actif | caretrack.gilmotech.be |

---

## Variables d'environnement requises

| Variable | Requis | Description |
|---|---|---|
| `CARETRACK_DB_PASSWORD` | Oui | Mot de passe PostgreSQL user `caretrack` |
| `ANTHROPIC_API_KEY` | Non | Clé API Anthropic pour l'orchestrateur IA |
| `MAIL_HOST` | Non | Serveur SMTP (défaut: `localhost`) |
| `MAIL_PORT` | Non | Port SMTP (défaut: `587`) |
| `MAIL_USERNAME` | Non | Login SMTP |
| `MAIL_PASSWORD` | Non | Mot de passe SMTP |

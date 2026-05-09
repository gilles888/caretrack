#!/usr/bin/env bash
# =============================================================================
# setup-server.sh — Configuration initiale du serveur pour CareTrack
# À exécuter UNE SEULE FOIS avec sudo sur le VPS
# Usage : sudo ./setup-server.sh
# =============================================================================
set -euo pipefail

CARETRACK_DB_PASSWORD="${CARETRACK_DB_PASSWORD:-changeme}"
BASE_DIR=/home/claude-worker/caretrack
NGINX_SITES=/etc/nginx/sites-available

log_info() { echo "[INFO]  $*"; }
log_ok()   { echo "[OK]    $*"; }

# ---------------------------------------------------------------------------
# 1. Répertoire web
# ---------------------------------------------------------------------------
log_info "Création du répertoire web/..."
mkdir -p "${BASE_DIR}/web"
chown claude-worker:claude-worker "${BASE_DIR}/web"
log_ok "Répertoire ${BASE_DIR}/web créé."

# ---------------------------------------------------------------------------
# 2. Base de données PostgreSQL
# ---------------------------------------------------------------------------
log_info "Création de la base de données caretrackdb..."
sudo -u postgres psql -p 5433 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'caretrack') THEN
    CREATE ROLE caretrack LOGIN PASSWORD '${CARETRACK_DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE caretrackdb OWNER caretrack'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'caretrackdb')\gexec
SQL
log_ok "Base caretrackdb prête."

# ---------------------------------------------------------------------------
# 3. Service systemd
# ---------------------------------------------------------------------------
log_info "Installation du service systemd caretrack..."
cat > /etc/systemd/system/caretrack.service <<SERVICE
[Unit]
Description=CareTrack API (Spring Boot)
After=network.target postgresql.service

[Service]
User=claude-worker
Group=claude-worker
WorkingDirectory=${BASE_DIR}

Environment="JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11"
Environment="PATH=/home/claude-worker/tools/jdk-21.0.5+11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

ExecStart=/home/claude-worker/tools/jdk-21.0.5+11/bin/java \\
  -XX:+UseContainerSupport \\
  -XX:MaxRAMPercentage=75.0 \\
  -Djava.security.egd=file:/dev/./urandom \\
  -Dspring.profiles.active=prod \\
  -DDB_URL=jdbc:postgresql://localhost:5433/caretrackdb \\
  -DDB_USER=caretrack \\
  -DDB_PASSWORD=${CARETRACK_DB_PASSWORD} \\
  -DAPP_URL=https://caretrack.gilmotech.be \\
  -DMAIL_HOST=${MAIL_HOST:-localhost} \\
  -DMAIL_PORT=${MAIL_PORT:-587} \\
  -DMAIL_USERNAME=${MAIL_USERNAME:-} \\
  -DMAIL_PASSWORD=${MAIL_PASSWORD:-} \\
  -DMAIL_FROM=noreply@caretrack.gilmotech.be \\
  -DANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-} \\
  -DSERVER_PORT=8083 \\
  -jar ${BASE_DIR}/caretrack-backend-0.0.1-SNAPSHOT.jar

Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/caretrack.log
StandardError=append:/var/log/caretrack.log

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable caretrack
log_ok "Service systemd caretrack installé et activé."

# ---------------------------------------------------------------------------
# 4. Configuration Nginx
# ---------------------------------------------------------------------------
log_info "Configuration Nginx pour caretrack.gilmotech.be..."
cat > "${NGINX_SITES}/caretrack.gilmotech.be" <<NGINX
# =============================================================================
# Vhost Nginx pour CareTrack - caretrack.gilmotech.be
# =============================================================================

server {
    server_name caretrack.gilmotech.be;

    root ${BASE_DIR}/web;
    index index.html;

    server_tokens off;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml
        font/woff
        font/woff2;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~* \.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        try_files \$uri =404;
    }

    location /api/ {
        proxy_pass http://localhost:8083/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 30s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
        proxy_buffering off;
    }

    location /swagger-ui/ {
        proxy_pass http://localhost:8083/swagger-ui/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /v3/api-docs {
        proxy_pass http://localhost:8083/v3/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location = /favicon.ico { log_not_found off; access_log off; }
    location = /robots.txt  { log_not_found off; access_log off; }

    listen 80;
    listen [::]:80;
}
NGINX

ln -sfn "${NGINX_SITES}/caretrack.gilmotech.be" /etc/nginx/sites-enabled/caretrack.gilmotech.be
nginx -t && systemctl reload nginx
log_ok "Nginx configuré et rechargé."

# ---------------------------------------------------------------------------
# 5. Certificat SSL Let's Encrypt
# ---------------------------------------------------------------------------
log_info "Génération du certificat SSL avec Certbot..."
certbot --nginx -d caretrack.gilmotech.be --non-interactive --agree-tos -m gilmoreau73@gmail.com
log_ok "Certificat SSL généré."

echo ""
echo "============================================================"
echo " Setup terminé ! Prochaines étapes :"
echo "   1. Définir CARETRACK_DB_PASSWORD dans votre environnement"
echo "   2. Lancer le premier déploiement : ./deploy.sh all"
echo "   3. Vérifier les logs : journalctl -u caretrack -f"
echo "============================================================"

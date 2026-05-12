#!/usr/bin/env bash
# =============================================================================
# fix-deploy.sh — Déploiement complet CareTrack (backend + frontend + Nginx)
#
# Usage :
#   sudo CARETRACK_DB_PASSWORD="..." JWT_SECRET="..." ./fix-deploy.sh
#   sudo CARETRACK_DB_PASSWORD="..." JWT_SECRET="..." ANTHROPIC_API_KEY="..." ./fix-deploy.sh
#
# Variables obligatoires :
#   CARETRACK_DB_PASSWORD   — mot de passe PostgreSQL
#   JWT_SECRET              — secret HMAC-SHA256 pour les tokens JWT (≥32 chars)
#
# Variables optionnelles :
#   ANTHROPIC_API_KEY       — clé Anthropic pour l'orchestrateur IA
#   MAIL_HOST               — serveur SMTP (défaut : localhost)
#   MAIL_PORT               — port SMTP (défaut : 587)
#   MAIL_USERNAME           — login SMTP
#   MAIL_PASSWORD           — mot de passe SMTP
#   MAIL_FROM               — expéditeur (défaut : noreply@caretrack.gilmotech.be)
#   SKIP_FRONTEND           — mettre à 1 pour sauter le build frontend
#   SKIP_BACKEND            — mettre à 1 pour sauter le build backend
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
BASE_DIR=/home/claude-worker/caretrack
OWNER=claude-worker
JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11
MAVEN=/home/claude-worker/tools/apache-maven-3.9.6/bin/mvn
JAR_NAME=caretrack-backend-0.0.1-SNAPSHOT.jar
SERVICE_FILE=/etc/systemd/system/caretrack.service
NGINX_CONF_REPO="${BASE_DIR}/nginx/caretrack.gilmotech.be.conf"
NGINX_CONF_LIVE=/etc/nginx/sites-available/caretrack.gilmotech.be
HEALTH_URL=http://localhost:8083/api/v1/auth/login
HEALTH_WAIT=45

# Optionnel
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
MAIL_HOST="${MAIL_HOST:-localhost}"
MAIL_PORT="${MAIL_PORT:-587}"
MAIL_USERNAME="${MAIL_USERNAME:-}"
MAIL_PASSWORD="${MAIL_PASSWORD:-}"
MAIL_FROM="${MAIL_FROM:-noreply@caretrack.gilmotech.be}"
SKIP_FRONTEND="${SKIP_FRONTEND:-0}"
SKIP_BACKEND="${SKIP_BACKEND:-0}"

log_info() { echo "[INFO]  $*"; }
log_ok()   { echo "[OK]    $*"; }
log_warn() { echo "[WARN]  $*"; }
log_err()  { echo "[ERREUR] $*" >&2; }

# ── 0. Vérifications préalables ───────────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
    log_err "Ce script doit être exécuté en tant que root (sudo)."
    exit 1
fi

if [ -z "${CARETRACK_DB_PASSWORD:-}" ]; then
    log_err "CARETRACK_DB_PASSWORD est obligatoire."
    log_err "Usage : sudo CARETRACK_DB_PASSWORD='...' JWT_SECRET='...' ./fix-deploy.sh"
    exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
    log_err "JWT_SECRET est obligatoire (secret HMAC-SHA256, ≥32 caractères)."
    log_err "Générer avec : openssl rand -hex 32"
    exit 1
fi

if [ "${#JWT_SECRET}" -lt 32 ]; then
    log_err "JWT_SECRET trop court (${#JWT_SECRET} chars). Minimum 32 caractères."
    exit 1
fi

echo ""
echo "============================================================"
echo "  CareTrack — Déploiement complet"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"
echo ""

# ── 1. Mise à jour du fichier de service systemd ─────────────────────────────
log_info "Mise à jour du service systemd avec les nouvelles variables..."
cat > "${SERVICE_FILE}" << UNIT
[Unit]
Description=CareTrack API (Spring Boot 3.5 / Java 21)
After=network.target postgresql.service

[Service]
User=${OWNER}
Group=${OWNER}
WorkingDirectory=${BASE_DIR}

Environment="JAVA_HOME=${JAVA_HOME}"
Environment="PATH=${JAVA_HOME}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

ExecStart=${JAVA_HOME}/bin/java \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.profiles.active=prod \
  -DDB_URL=jdbc:postgresql://localhost:5433/caretrackdb \
  -DDB_USER=caretrack \
  -DDB_PASSWORD=${CARETRACK_DB_PASSWORD} \
  -DJWT_SECRET=${JWT_SECRET} \
  -DAPP_URL=https://caretrack.gilmotech.be \
  -DMAIL_HOST=${MAIL_HOST} \
  -DMAIL_PORT=${MAIL_PORT} \
  -DMAIL_USERNAME=${MAIL_USERNAME} \
  -DMAIL_PASSWORD=${MAIL_PASSWORD} \
  -DMAIL_FROM=${MAIL_FROM} \
  -DANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
  -DSERVER_PORT=8083 \
  -jar ${BASE_DIR}/${JAR_NAME}

Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/caretrack.log
StandardError=append:/var/log/caretrack.log

[Install]
WantedBy=multi-user.target
UNIT

chmod 640 "${SERVICE_FILE}"
log_ok "Service systemd mis à jour."

# ── 2. Rechargement systemd ───────────────────────────────────────────────────
log_info "Rechargement de la configuration systemd..."
systemctl daemon-reload
log_ok "systemd rechargé."

# ── 3. Correction des permissions (fichiers créés en root par un sudo précédent)
log_info "Correction des permissions..."
chown -R ${OWNER}:${OWNER} "${BASE_DIR}/api/target/"    2>/dev/null || true
chown     ${OWNER}:${OWNER} "${BASE_DIR}/${JAR_NAME}"   2>/dev/null || true
chown -R  ${OWNER}:${OWNER} "${BASE_DIR}/frontend/node_modules" 2>/dev/null || true
chown -R  ${OWNER}:${OWNER} "${BASE_DIR}/web/"          2>/dev/null || true
log_ok "Permissions corrigées."

# ── 4. Build backend ──────────────────────────────────────────────────────────
if [ "${SKIP_BACKEND}" = "1" ]; then
    log_warn "SKIP_BACKEND=1 — build backend ignoré."
else
    log_info "Build du backend Maven (tests ignorés)..."
    sudo -u ${OWNER} bash -c "
        export JAVA_HOME=${JAVA_HOME}
        export PATH=\$JAVA_HOME/bin:\$PATH
        cd ${BASE_DIR}/api
        ${MAVEN} clean package -DskipTests -q
    "
    log_ok "Build backend terminé."

    log_info "Copie du JAR en production..."
    cp "${BASE_DIR}/api/target/${JAR_NAME}" "${BASE_DIR}/${JAR_NAME}"
    chown ${OWNER}:${OWNER} "${BASE_DIR}/${JAR_NAME}"
    log_ok "JAR copié → ${BASE_DIR}/${JAR_NAME}"
fi

# ── 5. Build frontend ─────────────────────────────────────────────────────────
if [ "${SKIP_FRONTEND}" = "1" ]; then
    log_warn "SKIP_FRONTEND=1 — build frontend ignoré."
else
    log_info "Build du frontend Angular (production)..."
    sudo -u ${OWNER} bash -c "
        cd ${BASE_DIR}/frontend
        npm install --legacy-peer-deps --prefer-offline 2>/dev/null \
          || npm install --legacy-peer-deps
        npm run build -- --configuration production
    "
    log_ok "Build frontend terminé."

    log_info "Mise à jour du répertoire web/..."
    rm -rf "${BASE_DIR}/web/"*
    cp -r "${BASE_DIR}/frontend/dist/caretrack-frontend/browser/." "${BASE_DIR}/web/"
    chown -R ${OWNER}:${OWNER} "${BASE_DIR}/web/"

    if [ -f "${BASE_DIR}/web/index.html" ]; then
        log_ok "Frontend déployé → ${BASE_DIR}/web/"
    else
        log_err "index.html absent dans web/ — vérifiez le build Angular."
        exit 1
    fi
fi

# ── 6. Redémarrage du service backend ─────────────────────────────────────────
log_info "Arrêt des processus nohup résiduels..."
pkill -f "${JAR_NAME}" 2>/dev/null || true
sleep 2

log_info "Redémarrage du service caretrack..."
systemctl restart caretrack
log_ok "Service caretrack redémarré."

# ── 7. Health check backend ───────────────────────────────────────────────────
log_info "Attente ${HEALTH_WAIT}s que Spring Boot démarre..."
sleep "${HEALTH_WAIT}"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"probe","password":"probe"}' \
    "${HEALTH_URL}" 2>/dev/null || echo "000")

# 400 = validation JSON échoue → Spring Boot répond → backend vivant
# 401 = Spring Security actif → backend vivant
# 200 = réponse normale → backend vivant
if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "400" ] || \
   [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
    log_ok "Backend opérationnel (HTTP ${HTTP_CODE})"
else
    log_err "Backend KO (HTTP ${HTTP_CODE})"
    log_err "Dernières lignes de log :"
    tail -30 /var/log/caretrack.log 2>/dev/null || true
    exit 1
fi

# ── 8. Config Nginx ───────────────────────────────────────────────────────────
if [ -f "${NGINX_CONF_REPO}" ]; then
    if ! diff -q "${NGINX_CONF_REPO}" "${NGINX_CONF_LIVE}" > /dev/null 2>&1; then
        log_info "Config Nginx modifiée — mise à jour..."
        cp "${NGINX_CONF_REPO}" "${NGINX_CONF_LIVE}"
        log_ok "Config Nginx copiée → ${NGINX_CONF_LIVE}"
    else
        log_info "Config Nginx inchangée."
    fi
else
    log_warn "Fichier ${NGINX_CONF_REPO} absent — config Nginx non modifiée."
fi

log_info "Vérification de la configuration Nginx..."
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    log_ok "Nginx rechargé."
else
    log_err "Configuration Nginx invalide — rechargement annulé."
    nginx -t
    exit 1
fi

# ── 9. Résumé ─────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
log_ok "Déploiement terminé avec succès !"
echo ""
echo "  Backend  : https://caretrack.gilmotech.be/api/v1/auth/login"
echo "  Frontend : https://caretrack.gilmotech.be"
echo "  Swagger  : https://caretrack.gilmotech.be/swagger-ui/"
echo "  Logs     : tail -f /var/log/caretrack.log"
echo ""
echo "  Comptes de test :"
echo "    admin@caretrack.be   / Admin123!   (ADMIN)"
echo "    medecin@caretrack.be / Medecin123! (MEDECIN)"
echo "============================================================"

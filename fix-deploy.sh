#!/usr/bin/env bash
# =============================================================================
# fix-deploy.sh — Corrige les permissions root + rebuild + redéploiement
# Usage : sudo ./fix-deploy.sh
# =============================================================================
set -euo pipefail

BASE_DIR=/home/claude-worker/caretrack
OWNER=claude-worker

log_info() { echo "[INFO]  $*"; }
log_ok()   { echo "[OK]    $*"; }
log_err()  { echo "[ERREUR] $*" >&2; }

# ---------------------------------------------------------------------------
# 1. Correction des permissions (fichiers créés par un sudo précédent)
# ---------------------------------------------------------------------------
log_info "Correction des permissions..."
chown -R ${OWNER}:${OWNER} "${BASE_DIR}/api/target/" 2>/dev/null || true
chown     ${OWNER}:${OWNER} "${BASE_DIR}/caretrack-backend-0.0.1-SNAPSHOT.jar" 2>/dev/null || true
log_ok "Permissions corrigées."

# ---------------------------------------------------------------------------
# 2. Rechargement systemd (service file mis à jour)
# ---------------------------------------------------------------------------
log_info "Rechargement de la configuration systemd..."
systemctl daemon-reload
log_ok "systemd rechargé."

# ---------------------------------------------------------------------------
# 3. Build backend (en tant que claude-worker)
# ---------------------------------------------------------------------------
log_info "Build du backend..."
export JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11
export PATH="${JAVA_HOME}/bin:${PATH}"
export MAVEN=/home/claude-worker/tools/apache-maven-3.9.6/bin/mvn

cd "${BASE_DIR}/api"
sudo -u ${OWNER} bash -c "
  export JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11
  export PATH=\$JAVA_HOME/bin:\$PATH
  /home/claude-worker/tools/apache-maven-3.9.6/bin/mvn clean package -DskipTests -q
"
log_ok "Build terminé."

# ---------------------------------------------------------------------------
# 4. Copie du JAR + redémarrage via systemd (on est root ici)
# ---------------------------------------------------------------------------
log_info "Copie du JAR en production..."
cp "${BASE_DIR}/api/target/caretrack-backend-0.0.1-SNAPSHOT.jar" "${BASE_DIR}/caretrack-backend-0.0.1-SNAPSHOT.jar"
chown ${OWNER}:${OWNER} "${BASE_DIR}/caretrack-backend-0.0.1-SNAPSHOT.jar"
log_ok "JAR copié."

log_info "Arrêt des éventuels processus nohup..."
pkill -f "caretrack-backend.*SNAPSHOT.jar" 2>/dev/null || true
sleep 2

log_info "Redémarrage du service systemd caretrack..."
systemctl restart caretrack
log_ok "Service redémarré."

log_info "Attente de 40s avant vérification santé..."
sleep 40
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/api/v1/questionnaires || true)
if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
    log_ok "Backend opérationnel (HTTP ${HTTP_CODE})"
else
    log_err "Backend KO (HTTP ${HTTP_CODE})"
    log_err "Consultez : tail -f /var/log/caretrack.log"
    exit 1
fi

# ---------------------------------------------------------------------------
# 4. Nginx — vérification + rechargement si la config a changé
# ---------------------------------------------------------------------------
log_info "Vérification de la configuration Nginx..."
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    log_ok "Nginx rechargé."
else
    log_err "Configuration Nginx invalide — rechargement annulé."
    nginx -t
fi

echo ""
echo "============================================================"
log_ok "Déploiement complet terminé."
echo "  Backend  : http://localhost:8083/api/v1/questionnaires"
echo "  Frontend : https://caretrack.gilmotech.be"
echo "  Logs     : tail -f /var/log/caretrack.log"
echo "============================================================"

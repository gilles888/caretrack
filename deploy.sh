#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Script de build et déploiement CareTrack
# Usage : ./deploy.sh [backend|frontend|all]
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Variables de configuration
# ---------------------------------------------------------------------------
JAVA_HOME=/home/claude-worker/tools/jdk-21.0.5+11
MAVEN=/home/claude-worker/tools/apache-maven-3.9.6/bin/mvn
BASE_DIR=/home/claude-worker/caretrack
JAR_NAME=caretrack-backend-0.0.1-SNAPSHOT.jar
API_URL=http://localhost:8083/api/v1/questionnaires
HEALTH_WAIT=40

JVM_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
SPRING_OPTS="-Dspring.profiles.active=prod \
  -DDB_URL=jdbc:postgresql://localhost:5433/caretrackdb \
  -DDB_USER=caretrack \
  -DDB_PASSWORD=${CARETRACK_DB_PASSWORD:-changeme} \
  -DAPP_URL=https://caretrack.gilmotech.be \
  -DMAIL_HOST=${MAIL_HOST:-localhost} \
  -DMAIL_PORT=${MAIL_PORT:-587} \
  -DMAIL_USERNAME=${MAIL_USERNAME:-} \
  -DMAIL_PASSWORD=${MAIL_PASSWORD:-} \
  -DMAIL_FROM=${MAIL_FROM:-noreply@caretrack.gilmotech.be} \
  -DANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-} \
  -DSERVER_PORT=8083"

# ---------------------------------------------------------------------------
# Fonctions utilitaires
# ---------------------------------------------------------------------------

log_info()  { echo "[INFO]  $*"; }
log_ok()    { echo "[OK]    $*"; }
log_err()   { echo "[ERREUR] $*" >&2; }

restart_service() {
    if sudo -n systemctl restart caretrack 2>/dev/null; then
        log_info "Service caretrack redémarré via systemctl."
    else
        log_info "sudo sans mot de passe indisponible — bascule sur kill + nohup."

        local OLD_PIDS
        OLD_PIDS=$(pgrep -f "${JAR_NAME}" 2>/dev/null || true)
        if [ -n "$OLD_PIDS" ]; then
            log_info "Arrêt du processus existant (PID : ${OLD_PIDS})..."
            # shellcheck disable=SC2086
            kill -TERM ${OLD_PIDS} 2>/dev/null || true
            sleep 3
            if pgrep -f "${JAR_NAME}" > /dev/null 2>&1; then
                # shellcheck disable=SC2086
                kill -KILL ${OLD_PIDS} 2>/dev/null || true
                sleep 1
            fi
        fi

        log_info "Démarrage du nouveau JAR via nohup..."
        # shellcheck disable=SC2086
        nohup "${JAVA_HOME}/bin/java" \
            ${JVM_OPTS} \
            ${SPRING_OPTS} \
            -jar "${BASE_DIR}/${JAR_NAME}" \
            >> "${BASE_DIR}/app.log" 2>&1 &

        log_info "Nouveau processus lancé (PID : $!)."
    fi
}

check_backend_health() {
    log_info "Attente de ${HEALTH_WAIT}s avant vérification santé..."
    sleep "${HEALTH_WAIT}"
    local HTTP_CODE
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}" || true)
    # 401 = Spring Security actif = backend vivant
    if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
        log_ok "Backend opérationnel (HTTP ${HTTP_CODE}) — ${API_URL}"
        return 0
    else
        log_err "Backend KO (HTTP ${HTTP_CODE}) — ${API_URL}"
        return 1
    fi
}

# ---------------------------------------------------------------------------
# deploy_backend
# ---------------------------------------------------------------------------
deploy_backend() {
    log_info "=== Déploiement BACKEND ==="

    cd "${BASE_DIR}/api"

    log_info "Compilation Maven (tests ignorés)..."
    export JAVA_HOME
    export PATH="${JAVA_HOME}/bin:${PATH}"
    "${MAVEN}" clean package -DskipTests

    log_info "Copie du JAR en production..."
    cp target/caretrack-backend-*.jar "${BASE_DIR}/${JAR_NAME}"

    restart_service

    if check_backend_health; then
        log_ok "=== Déploiement BACKEND terminé avec succès ==="
    else
        log_err "=== Déploiement BACKEND terminé avec des erreurs ==="
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# deploy_frontend
# ---------------------------------------------------------------------------
deploy_frontend() {
    log_info "=== Déploiement FRONTEND ==="

    cd "${BASE_DIR}/frontend"

    log_info "Installation des dépendances npm..."
    npm ci --prefer-offline 2>/dev/null || npm install

    log_info "Build Angular (configuration production)..."
    npm run build -- --configuration production

    log_info "Mise à jour du répertoire web/..."
    rm -rf "${BASE_DIR}/web/"*
    cp -r dist/caretrack-frontend/browser/. "${BASE_DIR}/web/"

    if [ -f "${BASE_DIR}/web/index.html" ]; then
        log_ok "index.html présent dans web/"
        log_ok "=== Déploiement FRONTEND terminé avec succès ==="
    else
        log_err "index.html absent dans web/ — déploiement échoué"
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------
COMMAND="${1:-}"

case "${COMMAND}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "Usage : $(basename "$0") [backend|frontend|all]"
        echo ""
        echo "  backend   — Rebuild + redéploiement du backend Spring Boot uniquement"
        echo "  frontend  — Rebuild + redéploiement du frontend Angular uniquement"
        echo "  all       — Rebuild + redéploiement des deux"
        exit 1
        ;;
esac

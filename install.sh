#!/usr/bin/env bash
# =============================================================================
# install.sh — Installation complète CareTrack (une seule fois)
# Usage : sudo ./install.sh
# =============================================================================
set -euo pipefail

EXPECTED_IP="45.88.223.242"
DOMAIN="caretrack.gilmotech.be"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info() { echo "[INFO]  $*"; }
log_ok()   { echo "[OK]    $*"; }
log_err()  { echo "[ERREUR] $*" >&2; }

# ---------------------------------------------------------------------------
# Mot de passe DB
# ---------------------------------------------------------------------------
if [ -z "${CARETRACK_DB_PASSWORD:-}" ]; then
    read -rsp "Mot de passe pour la base caretrackdb : " CARETRACK_DB_PASSWORD
    echo ""
    export CARETRACK_DB_PASSWORD
fi

# ---------------------------------------------------------------------------
# Vérification DNS
# ---------------------------------------------------------------------------
log_info "Vérification DNS de ${DOMAIN}..."
RESOLVED_IP=$(dig +short "${DOMAIN}" A | tail -1)

if [ "${RESOLVED_IP}" != "${EXPECTED_IP}" ]; then
    log_err "DNS pas encore propagé."
    log_err "  Attendu  : ${EXPECTED_IP}"
    log_err "  Obtenu   : ${RESOLVED_IP:-<vide>}"
    log_err "Relance le script une fois le DNS propagé."
    exit 1
fi

log_ok "DNS OK — ${DOMAIN} → ${RESOLVED_IP}"

# ---------------------------------------------------------------------------
# Setup serveur (PostgreSQL + Nginx + systemd + SSL)
# ---------------------------------------------------------------------------
log_info "Lancement du setup serveur..."
bash "${BASE_DIR}/setup-server.sh"

# ---------------------------------------------------------------------------
# Build et déploiement
# ---------------------------------------------------------------------------
log_info "Lancement du déploiement complet (backend + frontend)..."
bash "${BASE_DIR}/deploy.sh" all

# ---------------------------------------------------------------------------
# Résumé final
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
log_ok "Installation terminée !"
echo ""
echo "  URL        : https://${DOMAIN}"
echo "  Backend    : http://localhost:8083"
echo "  Swagger    : https://${DOMAIN}/swagger-ui/"
echo "  Logs       : journalctl -u caretrack -f"
echo "  Redéployer : ./deploy.sh [backend|frontend|all]"
echo "============================================================"

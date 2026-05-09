package com.caretrack.questionnaire.api.dto;

/**
 * DTO représentant les statistiques agrégées du dashboard médecin.
 *
 * <p>Phase 1 : valeurs statiques retournées par {@code ProDashboardController}.
 * Phase 2 : ces valeurs seront calculées dynamiquement depuis la base de données.
 *
 * @param totalPatients          nombre total de patients suivis
 * @param alertesCritiques       nombre d'alertes CRITICAL non acquittées
 * @param questionnairesEnAttente nombre de questionnaires en attente de complétion
 * @param tauxCompliance         taux de compliance en pourcentage (0.0 – 100.0)
 */
public record DashboardStatsDto(
        int totalPatients,
        int alertesCritiques,
        int questionnairesEnAttente,
        double tauxCompliance
) {}

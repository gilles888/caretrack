package com.caretrack.questionnaire.api;

import com.caretrack.questionnaire.api.dto.DashboardStatsDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST pour le dashboard du professionnel de santé (médecin / infirmier).
 *
 * <p>Phase 1 : les statistiques retournées sont statiques.
 * Phase 2 : les valeurs seront calculées dynamiquement depuis la base de données
 * (nombre réel de patients, alertes actives, questionnaires en attente, taux de compliance).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/pro")
@Tag(name = "Dashboard professionnel",
     description = "Statistiques agrégées pour le tableau de bord du professionnel de santé.")
public class ProDashboardController {

    /**
     * Retourne les statistiques agrégées du dashboard médecin.
     *
     * <p>Phase 1 : valeurs statiques de démonstration.
     *
     * @return {@link DashboardStatsDto} contenant les indicateurs clés
     */
    @GetMapping("/dashboard")
    @Operation(
            summary = "Statistiques du dashboard médecin",
            description = "Retourne les indicateurs clés : patients suivis, alertes critiques, " +
                          "questionnaires en attente et taux de compliance.")
    @ApiResponse(responseCode = "200", description = "Statistiques retournées avec succès")
    public DashboardStatsDto getDashboard() {
        log.debug("Requête dashboard professionnel — Phase 1 : statistiques statiques");
        // Phase 1 : données statiques de démonstration
        // Phase 2 : remplacer par des appels aux repositories
        return new DashboardStatsDto(15, 2, 3, 87.5);
    }
}

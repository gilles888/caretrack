package com.caretrack.questionnaire.api;

import com.caretrack.questionnaire.api.dto.AlerteTrendPointDto;
import com.caretrack.questionnaire.api.dto.CohortePointDto;
import com.caretrack.questionnaire.api.dto.CompletionRateDto;
import com.caretrack.questionnaire.api.dto.EvolutionPointDto;
import com.caretrack.questionnaire.api.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Endpoints REST pour les données analytiques et rapports d'évolution clinique.
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Données analytiques et rapports d'évolution")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Évolution longitudinale des scores d'un patient pour un questionnaire donné.
     *
     * @param patientId    UUID du patient
     * @param templateCode code du questionnaire (ex: PHQ9, ESAS_R)
     * @param from         date de début (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @param to           date de fin (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @return liste de points d'évolution triés chronologiquement
     */
    @GetMapping("/patient/{patientId}/evolution")
    @Operation(summary = "Évolution longitudinale d'un patient")
    public ResponseEntity<List<EvolutionPointDto>> getPatientEvolution(
            @PathVariable UUID patientId,
            @RequestParam String templateCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(
                analyticsService.getPatientEvolution(
                        patientId, templateCode,
                        from.atStartOfDay(), to.atTime(LocalTime.MAX)
                )
        );
    }

    /**
     * Données cohorte : matrice patients × semaines pour une maladie donnée.
     *
     * @param diseaseCode code de la maladie (ex: IC, CANCER)
     * @param from        date de début (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @param to          date de fin (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @return liste de points cohorte
     */
    @GetMapping("/cohorte")
    @Operation(summary = "Données cohorte par maladie")
    public ResponseEntity<List<CohortePointDto>> getCohorteData(
            @RequestParam String diseaseCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(
                analyticsService.getCohorteData(
                        diseaseCode,
                        from.atStartOfDay(), to.atTime(LocalTime.MAX)
                )
        );
    }

    /**
     * Taux de complétion par questionnaire sur une période.
     *
     * @param from date de début (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @param to   date de fin (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @return liste de taux de complétion, un par template actif
     */
    @GetMapping("/completion-rate")
    @Operation(summary = "Taux de complétion par questionnaire")
    public ResponseEntity<List<CompletionRateDto>> getCompletionRates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(
                analyticsService.getCompletionRates(
                        from.atStartOfDay(), to.atTime(LocalTime.MAX)
                )
        );
    }

    /**
     * Tendance des alertes cliniques par semaine ISO sur une période.
     *
     * @param from date de début (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @param to   date de fin (inclusive, format ISO 8601 : yyyy-MM-dd)
     * @return liste de points de tendance hebdomadaire
     */
    @GetMapping("/alertes-trend")
    @Operation(summary = "Tendance des alertes par semaine")
    public ResponseEntity<List<AlerteTrendPointDto>> getAlertesTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(
                analyticsService.getAlertesTrend(
                        from.atStartOfDay(), to.atTime(LocalTime.MAX)
                )
        );
    }
}

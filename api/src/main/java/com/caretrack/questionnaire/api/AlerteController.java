package com.caretrack.questionnaire.api;

import com.caretrack.questionnaire.api.dto.AlerteDto;
import com.caretrack.questionnaire.api.dto.AlerteStatsDto;
import com.caretrack.questionnaire.api.mapper.QuestionnaireMapper;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * API REST pour la consultation et la gestion des alertes cliniques.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/alertes")
@RequiredArgsConstructor
@Tag(name = "Alertes cliniques",
     description = "Consultation, acquittement et statistiques des alertes cliniques générées par les questionnaires.")
public class AlerteController {

    private final AlerteQuestionnaireRepository alerteRepo;
    private final QuestionnaireMapper mapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Lecture
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Toutes les alertes non acquittées",
               description = "Retourne toutes les alertes non acquittées, triées par date décroissante.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public List<AlerteDto> getToutes() {
        return alerteRepo.findByIsAcknowledgedFalseOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/patient/{patientId}")
    @Transactional(readOnly = true)
    @Operation(summary = "Alertes non acquittées d'un patient",
               description = "Retourne les alertes non acquittées pour un patient spécifique.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public List<AlerteDto> getParPatient(@PathVariable UUID patientId) {
        return alerteRepo.findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/critiques")
    @Transactional(readOnly = true)
    @Operation(summary = "Alertes CRITICAL non acquittées",
               description = "Retourne uniquement les alertes de niveau CRITICAL non encore acquittées.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public List<AlerteDto> getCritiques() {
        return alerteRepo.findByNiveauAndIsAcknowledgedFalse(AlerteNiveau.CRITICAL)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    @Operation(summary = "Statistiques des alertes non acquittées",
               description = "Retourne le nombre d'alertes non acquittées par niveau (INFO, WARNING, CRITICAL) et le total.")
    @ApiResponse(responseCode = "200", description = "Statistiques calculées avec succès")
    public AlerteStatsDto getStats() {
        List<AlerteQuestionnaire> toutes = alerteRepo.findByIsAcknowledgedFalseOrderByCreatedAtDesc();

        long info = toutes.stream()
                .filter(a -> a.getNiveau() == AlerteNiveau.INFO)
                .count();
        long warning = toutes.stream()
                .filter(a -> a.getNiveau() == AlerteNiveau.WARNING)
                .count();
        long critical = toutes.stream()
                .filter(a -> a.getNiveau() == AlerteNiveau.CRITICAL)
                .count();

        return new AlerteStatsDto(info, warning, critical, toutes.size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Acquittement
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{alerteId}/acknowledge")
    @Transactional
    @Operation(summary = "Acquitter une alerte",
               description = "Marque l'alerte comme acquittée avec l'horodatage et l'auteur (UUID aléatoire en Phase 1).")
    @ApiResponse(responseCode = "200", description = "Alerte acquittée")
    @ApiResponse(responseCode = "404", description = "Alerte introuvable")
    public AlerteDto acknowledge(@PathVariable UUID alerteId) {
        AlerteQuestionnaire alerte = alerteRepo.findById(alerteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Alerte introuvable : " + alerteId));

        // Phase 1 : UUID aléatoire pour acknowledgedBy (Phase 2 : extraire du token JWT)
        alerte.setAcknowledged(true);
        alerte.setAcknowledgedAt(LocalDateTime.now());
        alerte.setAcknowledgedBy(UUID.randomUUID());

        AlerteQuestionnaire saved = alerteRepo.save(alerte);
        log.info("Alerte acquittée : alerteId={} niveau={}", alerteId, saved.getNiveau());
        return mapper.toDto(saved);
    }
}

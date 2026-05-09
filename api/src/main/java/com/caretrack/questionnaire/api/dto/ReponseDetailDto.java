package com.caretrack.questionnaire.api.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO détaillé pour une {@code ReponseQuestionnaire}.
 */
public record ReponseDetailDto(
        UUID id,
        UUID patientId,
        String templateCode,
        LocalDateTime completedAt,
        Map<String, Object> answers,
        Map<String, Double> scores,
        Double scoreGlobal,
        Integer dureeSecondes,
        UUID reviewedBy,
        LocalDateTime reviewedAt,
        String notesMedecin
) {}

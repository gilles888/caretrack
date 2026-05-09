package com.caretrack.questionnaire.api.dto;

import com.caretrack.questionnaire.enums.AlerteNiveau;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour une {@code AlerteQuestionnaire}.
 */
public record AlerteDto(
        UUID id,
        UUID patientId,
        UUID reponseId,
        AlerteNiveau niveau,
        String itemCode,
        Double valeurObservee,
        Double seuilDeclenche,
        String message,
        boolean isAcknowledged,
        LocalDateTime createdAt
) {}

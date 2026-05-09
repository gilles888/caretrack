package com.caretrack.questionnaire.api.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Corps de réponse après la soumission d'un questionnaire.
 */
public record ReponseSoumissionResponse(
        UUID reponseId,
        Map<String, Double> scores,
        Double scoreGlobal,
        List<AlerteDto> alertes,
        String message
) {}

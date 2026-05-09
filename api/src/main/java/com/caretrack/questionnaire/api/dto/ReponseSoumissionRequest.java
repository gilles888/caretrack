package com.caretrack.questionnaire.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Corps de requête pour la soumission d'un questionnaire complété.
 */
public record ReponseSoumissionRequest(
        @NotBlank String templateCode,
        @NotNull Map<String, Object> answers,
        Integer dureeSecondes
) {}

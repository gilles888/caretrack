package com.caretrack.questionnaire.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Corps de requête pour annoter (reviewer) une réponse de questionnaire.
 */
public record ReviewRequest(@NotBlank String notesMedecin) {}

package com.caretrack.ai.dto;

import java.util.UUID;

/**
 * Requête envoyée à l'agent orchestrateur IA.
 *
 * @param patientId identifiant UUID du patient concerné
 * @param question  question clinique posée à l'agent
 */
public record OrchestratorRequest(
        UUID patientId,
        String question
) {}

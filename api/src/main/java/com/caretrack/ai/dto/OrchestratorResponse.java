package com.caretrack.ai.dto;

/**
 * Réponse structurée de l'agent orchestrateur IA.
 *
 * @param analysis       analyse clinique synthétique
 * @param recommendation recommandation d'action
 * @param alertGenerated indique si une alerte clinique a été générée
 */
public record OrchestratorResponse(
        String analysis,
        String recommendation,
        boolean alertGenerated
) {}

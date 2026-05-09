package com.caretrack.questionnaire.api.dto;

/**
 * DTO de statistiques d'alertes par niveau.
 */
public record AlerteStatsDto(
        long info,
        long warning,
        long critical,
        long total
) {}

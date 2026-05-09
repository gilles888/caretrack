package com.caretrack.questionnaire.api.dto;

import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.ScopeType;

import java.util.Set;
import java.util.UUID;

/**
 * DTO de liste pour un {@code QuestionnaireTemplate}.
 */
public record TemplateDto(
        UUID id,
        String code,
        String nom,
        String description,
        String version,
        ScopeType scope,
        FrequenceType frequence,
        boolean isActive,
        Integer dureeEstimeeMinutes,
        String licenceInfo,
        Set<String> diseaseCodes
) {}

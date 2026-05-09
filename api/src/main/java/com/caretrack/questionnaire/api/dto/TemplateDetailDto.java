package com.caretrack.questionnaire.api.dto;

import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.ScopeType;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * DTO détaillé pour un {@code QuestionnaireTemplate}, incluant ses items.
 */
public record TemplateDetailDto(
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
        Set<String> diseaseCodes,
        List<QuestionItemDto> items
) {}

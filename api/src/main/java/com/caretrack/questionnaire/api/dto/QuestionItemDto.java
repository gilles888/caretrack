package com.caretrack.questionnaire.api.dto;

import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.enums.ItemAttributeType;
import com.caretrack.questionnaire.enums.QuestionType;

import java.util.Set;
import java.util.UUID;

/**
 * DTO pour un {@code QuestionItem}.
 */
public record QuestionItemDto(
        UUID id,
        String texte,
        String texteCourt,
        QuestionType type,
        Integer ordre,
        Set<ItemAttributeType> attributes,
        Double seuilAlerteMin,
        Double seuilAlerteMax,
        AlerteNiveau alerteNiveau,
        String domaineCode,
        boolean isInverse,
        String labelMin,
        String labelMax
) {}

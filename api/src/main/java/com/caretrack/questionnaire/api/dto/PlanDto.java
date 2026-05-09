package com.caretrack.questionnaire.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour un {@code PatientQuestionnairePlan}.
 */
public record PlanDto(
        UUID id,
        UUID patientId,
        TemplateDto template,
        LocalDate dateDebut,
        LocalDate dateFin,
        LocalDate nextDueDate,
        LocalDateTime lastCompletedAt,
        boolean isActive
) {}

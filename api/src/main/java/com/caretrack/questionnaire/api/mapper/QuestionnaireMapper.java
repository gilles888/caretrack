package com.caretrack.questionnaire.api.mapper;

import com.caretrack.questionnaire.api.dto.AlerteDto;
import com.caretrack.questionnaire.api.dto.PlanDto;
import com.caretrack.questionnaire.api.dto.QuestionItemDto;
import com.caretrack.questionnaire.api.dto.TemplateDetailDto;
import com.caretrack.questionnaire.api.dto.TemplateDto;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper MapStruct pour la couche questionnaire.
 * Toutes les méthodes qui accèdent aux collections lazy (diseases, items)
 * doivent être appelées depuis un contexte transactionnel.
 */
@Mapper(componentModel = "spring")
public interface QuestionnaireMapper {

    @Mapping(
        target = "diseaseCodes",
        expression = "java(t.getDiseases().stream().map(d -> d.getCode()).collect(java.util.stream.Collectors.toSet()))"
    )
    TemplateDto toDto(QuestionnaireTemplate t);

    @Mapping(
        target = "diseaseCodes",
        expression = "java(t.getDiseases().stream().map(d -> d.getCode()).collect(java.util.stream.Collectors.toSet()))"
    )
    TemplateDetailDto toDetailDto(QuestionnaireTemplate t);

    QuestionItemDto toDto(QuestionItem item);

    @Mapping(target = "patientId", expression = "java(plan.getPatient().getId())")
    @Mapping(target = "template", expression = "java(toDto(plan.getTemplate()))")
    PlanDto toDto(PatientQuestionnairePlan plan);

    @Mapping(target = "patientId", expression = "java(a.getPatient().getId())")
    @Mapping(target = "reponseId", expression = "java(a.getReponse().getId())")
    AlerteDto toDto(AlerteQuestionnaire a);
}

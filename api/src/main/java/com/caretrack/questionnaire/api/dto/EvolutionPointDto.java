package com.caretrack.questionnaire.api.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record EvolutionPointDto(
    LocalDateTime date,
    Map<String, Double> scores,     // {domaine: score}
    Double scoreGlobal,
    List<String> alerteNiveaux,     // ex: ["CRITICAL"] si alerte ce jour
    String reponseId
) {}

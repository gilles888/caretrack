package com.caretrack.questionnaire.api.dto;

import java.util.Map;

public record CompletionRateDto(
    String templateCode,
    String templateNom,
    double tauxGlobal,           // 0.0–1.0
    Map<String, Double> parMaladie  // {diseaseCode: taux}
) {}

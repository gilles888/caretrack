package com.caretrack.questionnaire.api.dto;

import java.time.LocalDate;

public record AlerteTrendPointDto(
    LocalDate semaine,
    long nbWarning,
    long nbCritical,
    double tauxCompletion     // 0.0–1.0
) {}

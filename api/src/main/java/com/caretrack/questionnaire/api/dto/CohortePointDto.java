package com.caretrack.questionnaire.api.dto;

import java.time.LocalDate;

public record CohortePointDto(
    String patientId,
    String patientNom,
    LocalDate semaine,           // lundi de la semaine
    Double scoreGlobal,
    String alerteNiveau          // null si aucune alerte
) {}

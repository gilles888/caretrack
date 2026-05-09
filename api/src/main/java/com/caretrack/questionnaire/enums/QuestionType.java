package com.caretrack.questionnaire.enums;

public enum QuestionType {
    VAS_0_10,   // échelle visuelle analogique 0-10
    LIKERT_4,   // 4 niveaux (0-3 ou 1-4)
    LIKERT_5,   // 5 niveaux (0-4 ou 1-5)
    LIKERT_6,   // 6 niveaux (0-5) — MLHFQ, DDS17
    LIKERT_7,   // 7 niveaux (1-7) — SIBDQ
    YESNO,      // Oui / Non
    TEXT        // réponse libre
}

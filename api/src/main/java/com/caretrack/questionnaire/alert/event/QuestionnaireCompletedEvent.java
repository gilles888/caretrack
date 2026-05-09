package com.caretrack.questionnaire.alert.event;

import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import org.springframework.context.ApplicationEvent;

/**
 * Événement publié après qu'un questionnaire a été complété et a généré au moins une alerte.
 * Permet une extensibilité future (tableau de bord temps réel, audit trail, etc.).
 */
public class QuestionnaireCompletedEvent extends ApplicationEvent {

    private final ReponseQuestionnaire reponse;

    public QuestionnaireCompletedEvent(Object source, ReponseQuestionnaire reponse) {
        super(source);
        this.reponse = reponse;
    }

    public ReponseQuestionnaire getReponse() {
        return reponse;
    }
}

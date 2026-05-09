package com.caretrack.questionnaire.alert.event;

import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import org.springframework.context.ApplicationEvent;

/**
 * Événement publié dès qu'une alerte de niveau CRITICAL est créée.
 * Déclenche l'envoi immédiat d'un email au médecin via {@code AlerteEventListener}.
 */
public class AlerteCritiqueEvent extends ApplicationEvent {

    private final AlerteQuestionnaire alerte;

    public AlerteCritiqueEvent(Object source, AlerteQuestionnaire alerte) {
        super(source);
        this.alerte = alerte;
    }

    public AlerteQuestionnaire getAlerte() {
        return alerte;
    }
}

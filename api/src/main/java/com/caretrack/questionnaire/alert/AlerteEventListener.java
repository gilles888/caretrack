package com.caretrack.questionnaire.alert;

import com.caretrack.questionnaire.alert.event.AlerteCritiqueEvent;
import com.caretrack.questionnaire.alert.event.QuestionnaireCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener Spring pour les événements du cycle de vie des questionnaires et alertes.
 *
 * <p>Les handlers sont asynchrones ({@code @Async}) afin de ne pas bloquer
 * la transaction principale lors de la soumission d'une réponse.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlerteEventListener {

    private final NotificationService notificationService;

    /**
     * Déclenché dès qu'une alerte CRITICAL est créée.
     * Envoie immédiatement un email au médecin.
     *
     * @param event l'événement contenant l'alerte critique
     */
    @Async
    @EventListener
    public void onAlerteCritique(AlerteCritiqueEvent event) {
        log.info("Event AlerteCritique reçu : alerteId={}", event.getAlerte().getId());
        notificationService.sendAlerteMedecin(event.getAlerte());
    }

    /**
     * Déclenché après qu'un questionnaire a généré au moins une alerte.
     * Extensibilité future : tableau de bord temps réel, audit trail, etc.
     *
     * @param event l'événement contenant la réponse complétée
     */
    @Async
    @EventListener
    public void onQuestionnaireCompleted(QuestionnaireCompletedEvent event) {
        log.info("Event QuestionnaireCompleted reçu : reponseId={}", event.getReponse().getId());
        // Notification de complétion : future extensibilité (tableau de bord temps réel, etc.)
    }
}

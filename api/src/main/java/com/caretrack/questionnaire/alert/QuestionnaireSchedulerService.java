package com.caretrack.questionnaire.alert;

import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import com.caretrack.questionnaire.repository.PatientQuestionnairePlanRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduler chargé de vérifier périodiquement les questionnaires échus
 * et d'envoyer les rappels ou créer des alertes de retard.
 *
 * <p>Tâches planifiées :
 * <ul>
 *   <li>Chaque matin à 7h : {@link #checkDueQuestionnaires()} — rappels et alertes de retard.</li>
 *   <li>Chaque lundi à 8h : {@link #weeklyDashboardDigest()} — résumé hebdomadaire en log.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionnaireSchedulerService {

    private final PatientQuestionnairePlanRepository planRepo;
    private final AlerteQuestionnaireRepository alerteRepo;
    private final ReponseQuestionnaireRepository reponseRepo;
    private final NotificationService notificationService;

    @Value("${caretrack.alertes.retard-jours-warning:2}")
    private int retardJoursWarning;

    @Value("${caretrack.alertes.retard-jours-critical:5}")
    private int retardJoursCritical;

    /**
     * Chaque matin à 7h : vérifie les questionnaires échus et envoie les rappels.
     * Crée des alertes WARNING/CRITICAL si un questionnaire est en retard.
     */
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void checkDueQuestionnaires() {
        LocalDate today = LocalDate.now();
        log.info("Scheduler checkDueQuestionnaires démarré pour {}", today);

        List<PatientQuestionnairePlan> plansDus = planRepo
                .findByNextDueDateLessThanEqualAndIsActiveTrue(today);

        log.info("{} plan(s) échu(s) trouvé(s)", plansDus.size());

        for (PatientQuestionnairePlan plan : plansDus) {
            Patient patient = plan.getPatient();
            long joursRetard = 0;
            if (plan.getNextDueDate() != null) {
                joursRetard = ChronoUnit.DAYS.between(plan.getNextDueDate(), today);
            }

            // Envoyer rappel email
            notificationService.sendRappelQuestionnaire(patient, plan.getTemplate());

            // Créer alerte si en retard
            if (joursRetard >= retardJoursWarning) {
                AlerteNiveau niveau = joursRetard >= retardJoursCritical
                        ? AlerteNiveau.CRITICAL : AlerteNiveau.WARNING;
                String message = String.format(
                        "Questionnaire '%s' en retard de %d jour(s) (patient: %s %s)",
                        plan.getTemplate().getNom(), joursRetard,
                        patient.getNom(), patient.getPrenom());

                // Éviter les doublons : vérifier qu'il n'y a pas déjà une alerte non acquittée pour ce plan
                boolean dejaAlerte = alerteRepo
                        .findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(patient.getId())
                        .stream()
                        .anyMatch(a -> a.getMessage() != null
                                && a.getMessage().contains(plan.getTemplate().getNom())
                                && a.getMessage().contains("retard"));

                if (!dejaAlerte) {
                    // Lier l'alerte à la dernière réponse connue (ou ignorer si aucune réponse)
                    var lastReponse = reponseRepo
                            .findTop1ByPatientIdAndTemplateCodeOrderByCompletedAtDesc(
                                    patient.getId(), plan.getTemplate().getCode())
                            .orElse(null);

                    if (lastReponse != null) {
                        AlerteQuestionnaire alerte = AlerteQuestionnaire.builder()
                                .reponse(lastReponse)
                                .patient(patient)
                                .niveau(niveau)
                                .itemCode("RETARD_QUESTIONNAIRE")
                                .valeurObservee((double) joursRetard)
                                .seuilDeclenche((double) retardJoursWarning)
                                .message(message)
                                .isAcknowledged(false)
                                .build();
                        alerteRepo.save(alerte);
                        log.warn("Alerte retard créée : {}", message);
                    } else {
                        log.info("Pas de réponse précédente pour créer alerte retard : patient={} template={}",
                                patient.getId(), plan.getTemplate().getCode());
                    }
                }
            }
        }
    }

    /**
     * Chaque lundi à 8h : résumé hebdomadaire des alertes en attente pour les médecins.
     * Phase 1 : log uniquement. Phase 2 : envoi email aux médecins.
     */
    @Scheduled(cron = "0 0 8 * * MON")
    @Transactional(readOnly = true)
    public void weeklyDashboardDigest() {
        log.info("Scheduler weeklyDashboardDigest démarré");

        long totalAlertesNonAcq = alerteRepo.findByIsAcknowledgedFalseOrderByCreatedAtDesc().size();
        long alertesCritiques = alerteRepo.findByNiveauAndIsAcknowledgedFalse(AlerteNiveau.CRITICAL).size();
        long alertesWarning = alerteRepo.findByNiveauAndIsAcknowledgedFalse(AlerteNiveau.WARNING).size();

        LocalDate debutSemaine = LocalDate.now().minusWeeks(1);

        log.info("=== RÉSUMÉ HEBDOMADAIRE CARETRACK ===");
        log.info("Alertes non acquittées : {}", totalAlertesNonAcq);
        log.info("  - CRITICAL : {}", alertesCritiques);
        log.info("  - WARNING  : {}", alertesWarning);
        log.info("  - Depuis   : {}", debutSemaine);
        log.info("=====================================");

        // TODO Phase 2 : récupérer liste médecins depuis UserRepository et envoyer digest email
    }
}

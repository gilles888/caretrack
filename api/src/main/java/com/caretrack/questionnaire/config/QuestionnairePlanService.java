package com.caretrack.questionnaire.config;

import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.ScopeType;
import com.caretrack.questionnaire.repository.PatientQuestionnairePlanRepository;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionnairePlanService {

    private final QuestionnaireTemplateRepository templateRepo;
    private final PatientQuestionnairePlanRepository planRepo;

    /**
     * Assigne les questionnaires CORE + ceux spécifiques à la maladie du patient.
     * Idempotent : ignore les templates déjà planifiés pour ce patient.
     */
    @Transactional
    public List<PatientQuestionnairePlan> assignDefaultPlan(Patient patient) {
        LocalDate today = LocalDate.now();

        // 1. Récupère tous les templates applicables
        List<QuestionnaireTemplate> applicable = templateRepo.findAll().stream()
            .filter(QuestionnaireTemplate::isActive)
            .filter(t -> {
                if (t.getScope() == ScopeType.CORE) return true;
                // DISEASE_SPECIFIC : inclus si le patient a la maladie concernée
                if (patient.getDisease() == null) return false;
                return t.getDiseases().stream()
                    .anyMatch(d -> d.getId().equals(patient.getDisease().getId()));
            })
            .toList();

        // 2. Crée les plans manquants
        return applicable.stream()
            .filter(t -> planRepo.findByPatientIdAndTemplateId(patient.getId(), t.getId()).isEmpty())
            .map(t -> {
                PatientQuestionnairePlan plan = PatientQuestionnairePlan.builder()
                    .patient(patient)
                    .template(t)
                    .dateDebut(today)
                    .nextDueDate(today)
                    .isActive(true)
                    .rappelActif(true)
                    .build();
                PatientQuestionnairePlan saved = planRepo.save(plan);
                log.info("Plan assigné : patient={} template={}", patient.getId(), t.getCode());
                return saved;
            })
            .toList();
    }

    /**
     * Calcule la prochaine date d'échéance selon la fréquence du template.
     *
     * @param template le template de questionnaire
     * @param from     date de départ (généralement la date de complétion)
     * @return prochaine date d'échéance
     */
    public LocalDate calculateNextDueDate(QuestionnaireTemplate template, LocalDate from) {
        return switch (template.getFrequence()) {
            case QUOTIDIEN   -> from.plusDays(1);
            case HEBDO       -> from.plusWeeks(1);
            case MENSUEL     -> from.plusMonths(1);
            case TRIMESTRIEL -> from.plusMonths(3);
            case PAR_CYCLE   -> from.plusWeeks(3); // cycle chimio typique = 21 jours
            case PAR_VISITE  -> from.plusWeeks(4); // estimation conservative entre consultations
        };
    }

    /**
     * Met à jour la prochaine échéance d'un plan après complétion d'une réponse.
     */
    @Transactional
    public void markCompleted(PatientQuestionnairePlan plan) {
        plan.setLastCompletedAt(java.time.LocalDateTime.now());
        plan.setNextDueDate(calculateNextDueDate(plan.getTemplate(), LocalDate.now()));
        planRepo.save(plan);
    }
}

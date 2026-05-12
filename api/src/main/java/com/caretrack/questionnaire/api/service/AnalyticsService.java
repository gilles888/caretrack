package com.caretrack.questionnaire.api.service;

import com.caretrack.questionnaire.api.dto.AlerteTrendPointDto;
import com.caretrack.questionnaire.api.dto.CohortePointDto;
import com.caretrack.questionnaire.api.dto.CompletionRateDto;
import com.caretrack.questionnaire.api.dto.EvolutionPointDto;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import com.caretrack.questionnaire.repository.PatientQuestionnairePlanRepository;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service d'analyse longitudinale et de cohorte des questionnaires.
 * <p>
 * Fournit quatre axes analytiques :
 * <ul>
 *   <li>Évolution temporelle d'un patient pour un template donné</li>
 *   <li>Vue cohorte patients × semaines par maladie</li>
 *   <li>Taux de complétion par questionnaire</li>
 *   <li>Tendance hebdomadaire des alertes cliniques</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ReponseQuestionnaireRepository reponseRepo;
    private final AlerteQuestionnaireRepository alerteRepo;
    private final QuestionnaireTemplateRepository templateRepo;
    private final PatientQuestionnairePlanRepository planRepo;

    /**
     * Retourne l'évolution longitudinale d'un patient pour un questionnaire donné.
     *
     * @param patientId    identifiant du patient
     * @param templateCode code du questionnaire (ex: PHQ9, ESAS_R)
     * @param from         début de la période (inclusif)
     * @param to           fin de la période (inclusif)
     * @return liste de points d'évolution triés par date croissante
     */
    public List<EvolutionPointDto> getPatientEvolution(
            UUID patientId, String templateCode,
            LocalDateTime from, LocalDateTime to) {

        log.debug("Calcul évolution patient={} template={} période [{}, {}]",
                patientId, templateCode, from, to);

        List<ReponseQuestionnaire> reponses = reponseRepo
                .findByPatientIdAndTemplateCodeAndCompletedAtBetweenOrderByCompletedAtAsc(
                        patientId, templateCode, from, to);

        List<AlerteQuestionnaire> alertes = alerteRepo
                .findByPatientIdAndCreatedAtBetweenOrderByCreatedAtAsc(patientId, from, to);

        // Index alertes par reponseId pour lookup O(1)
        Map<UUID, List<String>> alertesByReponse = alertes.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getReponse().getId(),
                        Collectors.mapping(a -> a.getNiveau().name(), Collectors.toList())
                ));

        return reponses.stream()
                .map(r -> new EvolutionPointDto(
                        r.getCompletedAt(),
                        r.getScores(),
                        r.getScoreGlobal(),
                        alertesByReponse.getOrDefault(r.getId(), List.of()),
                        r.getId().toString()
                ))
                .toList();
    }

    /**
     * Retourne la matrice cohorte patients × semaines pour une maladie donnée.
     * <p>
     * Chaque point représente la dernière réponse d'un patient pour une semaine ISO donnée,
     * avec le niveau d'alerte maximum observé sur cette réponse.
     *
     * @param diseaseCode code de la maladie (ex: IC, CANCER)
     * @param from        début de la période (inclusif)
     * @param to          fin de la période (inclusif)
     * @return liste de points cohorte
     */
    public List<CohortePointDto> getCohorteData(
            String diseaseCode, LocalDateTime from, LocalDateTime to) {

        log.debug("Calcul cohorte disease={} période [{}, {}]", diseaseCode, from, to);

        List<ReponseQuestionnaire> reponses = reponseRepo
                .findByDiseaseCodeAndPeriod(diseaseCode, from, to);

        // Récupérer le niveau d'alerte maximum par réponse — une seule requête batch (évite le N+1)
        List<UUID> reponseIds = reponses.stream().map(ReponseQuestionnaire::getId).toList();
        Map<UUID, String> alerteNiveauByReponse = alerteRepo.findByReponseIdIn(reponseIds).stream()
                .collect(Collectors.toMap(
                        a -> a.getReponse().getId(),
                        a -> a.getNiveau().name(),
                        (existing, replacement) -> {
                            // Conserver le niveau le plus critique
                            int existingOrd = AlerteNiveau.valueOf(existing).ordinal();
                            int replacementOrd = AlerteNiveau.valueOf(replacement).ordinal();
                            return existingOrd >= replacementOrd ? existing : replacement;
                        }
                ));

        return reponses.stream()
                .map(r -> {
                    LocalDate lundi = r.getCompletedAt().toLocalDate()
                            .with(WeekFields.ISO.dayOfWeek(), 1);
                    String patId = r.getPatient().getId().toString();
                    String patNom = r.getPatient().getNom() + ", " + r.getPatient().getPrenom();
                    return new CohortePointDto(
                            patId,
                            patNom,
                            lundi,
                            r.getScoreGlobal(),
                            alerteNiveauByReponse.get(r.getId())
                    );
                })
                .toList();
    }

    /**
     * Calcule le taux de complétion par questionnaire sur la période.
     * <p>
     * Le taux global est calculé sur la base du nombre de réponses reçues.
     * Le taux par maladie est normalisé par rapport à 5 réponses attendues par maladie.
     *
     * @param from début de la période (inclusif)
     * @param to   fin de la période (inclusif)
     * @return liste de taux de complétion, un par template actif
     */
    public List<CompletionRateDto> getCompletionRates(LocalDateTime from, LocalDateTime to) {

        log.debug("Calcul taux complétion période [{}, {}]", from, to);

        List<QuestionnaireTemplate> templates = templateRepo.findAll();

        return templates.stream().map(tpl -> {
            List<ReponseQuestionnaire> reponses = reponseRepo
                    .findByTemplate_CodeAndCompletedAtBetweenOrderByCompletedAtAsc(
                            tpl.getCode(), from, to);

            long total = reponses.size();
            // Taux global = réponses reçues / plans actifs pour ce template
            long plansActifs = planRepo.findAll().stream()
                    .filter(p -> p.isActive() && p.getTemplate().getId().equals(tpl.getId()))
                    .count();
            double tauxGlobal = plansActifs > 0 ? Math.min(1.0, (double) total / plansActifs) : 0.0;

            // Taux par maladie : nombre de réponses normalisé sur 5 attendues
            Map<String, Double> parMaladie = reponses.stream()
                    .filter(r -> r.getPatient().getDisease() != null)
                    .collect(Collectors.groupingBy(
                            r -> r.getPatient().getDisease().getCode(),
                            Collectors.collectingAndThen(
                                    Collectors.counting(),
                                    count -> Math.min(1.0, count / 5.0)
                            )
                    ));

            return new CompletionRateDto(tpl.getCode(), tpl.getNom(), tauxGlobal, parMaladie);
        }).toList();
    }

    /**
     * Retourne la tendance hebdomadaire des alertes cliniques sur la période.
     * <p>
     * Génère un point par semaine ISO (lundi), même si aucune alerte n'est survenue.
     * Le taux de complétion est actuellement une valeur indicative fixe (0.85).
     *
     * @param from début de la période (inclusif)
     * @param to   fin de la période (inclusif)
     * @return liste de points de tendance, triés par semaine croissante
     */
    public List<AlerteTrendPointDto> getAlertesTrend(LocalDateTime from, LocalDateTime to) {

        log.debug("Calcul tendance alertes période [{}, {}]", from, to);

        List<AlerteQuestionnaire> alertes = alerteRepo
                .findByCreatedAtBetweenOrderByCreatedAtAsc(from, to);

        // Grouper par lundi de la semaine ISO
        Map<LocalDate, List<AlerteQuestionnaire>> byWeek = alertes.stream()
                .collect(Collectors.groupingBy(a ->
                        a.getCreatedAt().toLocalDate()
                                .with(WeekFields.ISO.dayOfWeek(), 1)
                ));

        // Taux de complétion hebdomadaire réel : réponses reçues / plans actifs — 2 requêtes en tout
        Map<LocalDate, Long> reponsesParSemaine = reponseRepo
                .findByCompletedAtBetween(from, to).stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCompletedAt().toLocalDate().with(WeekFields.ISO.dayOfWeek(), 1),
                        Collectors.counting()
                ));
        long totalPlansActifs = planRepo.findAll().stream()
                .filter(p -> p.isActive())
                .count();

        // Générer un point pour chaque semaine de la période, y compris les semaines vides
        List<AlerteTrendPointDto> result = new ArrayList<>();
        LocalDate current = from.toLocalDate().with(WeekFields.ISO.dayOfWeek(), 1);
        LocalDate end = to.toLocalDate();

        while (!current.isAfter(end)) {
            LocalDate semaine = current;
            List<AlerteQuestionnaire> weekAlertes = byWeek.getOrDefault(semaine, List.of());
            long nbWarning = weekAlertes.stream()
                    .filter(a -> a.getNiveau() == AlerteNiveau.WARNING).count();
            long nbCritical = weekAlertes.stream()
                    .filter(a -> a.getNiveau() == AlerteNiveau.CRITICAL).count();
            long reponsesWeek = reponsesParSemaine.getOrDefault(semaine, 0L);
            double tauxCompletion = totalPlansActifs > 0
                    ? Math.min(1.0, (double) reponsesWeek / totalPlansActifs)
                    : 0.0;
            result.add(new AlerteTrendPointDto(semaine, nbWarning, nbCritical, tauxCompletion));
            current = current.plusWeeks(1);
        }

        return result;
    }
}

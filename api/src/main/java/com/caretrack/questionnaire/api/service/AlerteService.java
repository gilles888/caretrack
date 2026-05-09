package com.caretrack.questionnaire.api.service;

import com.caretrack.questionnaire.alert.event.AlerteCritiqueEvent;
import com.caretrack.questionnaire.alert.event.QuestionnaireCompletedEvent;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Évalue les seuils d'alerte pour chaque item d'une réponse soumise.
 * Crée et persiste les {@link AlerteQuestionnaire} déclenchées.
 *
 * <p>Règles métier critiques :
 * <ul>
 *   <li>PHQ-9 item 9 (idéations suicidaires) : valeur &ge; 1 → CRITICAL systématique.</li>
 *   <li>Item isInverse=true : alerte si valeur &le; seuilAlerteMax (ex. bien-être ESAS-R &le; 4).</li>
 *   <li>Item normal : alerte si valeur &ge; seuilAlerteMin ou valeur &gt; seuilAlerteMax.</li>
 *   <li>KCCQ12 : delta OSS &ge; 10 pts → WARNING, &ge; 17 pts → CRITICAL.</li>
 *   <li>MSIS29 : dégradation &ge; 8 pts par rapport à la baseline → WARNING.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlerteService {

    private final AlerteQuestionnaireRepository alerteRepo;
    private final ReponseQuestionnaireRepository reponseRepo;
    private final ApplicationEventPublisher publisher;

    /**
     * Évalue tous les items du template par rapport aux seuils définis,
     * et crée une {@link AlerteQuestionnaire} pour chaque dépassement détecté.
     * Publie également les événements applicatifs correspondants.
     *
     * @param reponse  la réponse questionnaire persistée
     * @param template le template de questionnaire
     * @param answers  les réponses brutes soumises par le patient
     * @return liste des alertes créées et persistées
     */
    @Transactional
    public List<AlerteQuestionnaire> evaluate(ReponseQuestionnaire reponse,
                                               QuestionnaireTemplate template,
                                               Map<String, Object> answers) {
        List<AlerteQuestionnaire> alertes = new ArrayList<>();

        for (QuestionItem item : template.getItems()) {
            Double valeur = extractValue(answers, item);
            if (valeur == null) continue;

            AlerteQuestionnaire alerte = buildAlerte(reponse, template, item, valeur);
            if (alerte != null) {
                AlerteQuestionnaire saved = alerteRepo.save(alerte);
                alertes.add(saved);
                log.info("Alerte {} créée : patient={} template={} item={} valeur={}",
                        saved.getNiveau(), reponse.getPatient().getId(),
                        template.getCode(), item.getOrdre(), valeur);

                if (saved.getNiveau() == AlerteNiveau.CRITICAL) {
                    publisher.publishEvent(new AlerteCritiqueEvent(this, saved));
                }
            }
        }

        // Règles de dégradation inter-réponses
        checkKccq12Delta(reponse, template, alertes);
        checkMsis29Baseline(reponse, template, alertes);

        // Publier l'event de complétion si au moins une alerte a été générée
        if (!alertes.isEmpty()) {
            publisher.publishEvent(new QuestionnaireCompletedEvent(this, reponse));
        }

        return alertes;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Règles inter-réponses
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Vérifie la dégradation de l'Overall Summary Score (OSS) pour KCCQ12.
     * Delta OSS &ge; 10 → WARNING ; &ge; 17 → CRITICAL.
     * La réponse précédente est la plus récente avant la réponse actuelle.
     */
    private void checkKccq12Delta(ReponseQuestionnaire reponse,
                                   QuestionnaireTemplate template,
                                   List<AlerteQuestionnaire> alertes) {
        if (!"KCCQ12".equals(template.getCode())) return;

        Double ossActuel = reponse.getScores() != null ? reponse.getScores().get("OSS") : null;
        if (ossActuel == null) return;

        UUID patientId = reponse.getPatient().getId();
        reponseRepo.findTop1ByPatientIdAndTemplateCodeOrderByCompletedAtDesc(patientId, "KCCQ12")
                .ifPresent(previous -> {
                    if (previous.getId().equals(reponse.getId())) return; // même réponse
                    Double ossPrecedent = previous.getScores() != null
                            ? previous.getScores().get("OSS") : null;
                    if (ossPrecedent == null) return;

                    double delta = ossPrecedent - ossActuel; // positif = dégradation
                    if (delta >= 10.0) {
                        AlerteNiveau niveau = delta >= 17.0 ? AlerteNiveau.CRITICAL : AlerteNiveau.WARNING;
                        String message = String.format(
                                "KCCQ12 : dégradation OSS de %.0f points (%.0f → %.0f)",
                                delta, ossPrecedent, ossActuel);
                        AlerteQuestionnaire alerte = AlerteQuestionnaire.builder()
                                .reponse(reponse)
                                .patient(reponse.getPatient())
                                .niveau(niveau)
                                .itemCode("OSS_DELTA")
                                .valeurObservee(delta)
                                .seuilDeclenche(10.0)
                                .message(message)
                                .isAcknowledged(false)
                                .build();
                        AlerteQuestionnaire saved = alerteRepo.save(alerte);
                        alertes.add(saved);
                        log.warn("Alerte KCCQ12 delta OSS : patient={} delta={} niveau={}",
                                patientId, delta, niveau);
                        if (niveau == AlerteNiveau.CRITICAL) {
                            publisher.publishEvent(new AlerteCritiqueEvent(this, saved));
                        }
                    }
                });
    }

    /**
     * Vérifie la dégradation cliniquement significative pour MSIS29.
     * Dégradation &ge; 8 pts par rapport à la baseline (première réponse) → WARNING.
     */
    private void checkMsis29Baseline(ReponseQuestionnaire reponse,
                                      QuestionnaireTemplate template,
                                      List<AlerteQuestionnaire> alertes) {
        if (!"MSIS29".equals(template.getCode())) return;

        Double scoreActuel = reponse.getScoreGlobal();
        if (scoreActuel == null) return;

        UUID patientId = reponse.getPatient().getId();
        List<ReponseQuestionnaire> historique = reponseRepo
                .findByPatientIdAndTemplateCodeOrderByCompletedAtDesc(patientId, "MSIS29");

        // Besoin d'au moins 2 réponses (actuelle + baseline)
        if (historique.size() < 2) return;

        // La baseline est la première réponse chronologiquement (dernière dans la liste DESC)
        ReponseQuestionnaire baseline = historique.getLast();
        if (baseline.getId().equals(reponse.getId())) return;

        Double scoreBaseline = baseline.getScoreGlobal();
        if (scoreBaseline == null) return;

        double delta = scoreActuel - scoreBaseline; // positif = dégradation (score MSIS29 plus élevé = pire)
        if (delta >= 8.0) {
            String message = String.format(
                    "MSIS29 : dégradation cliniquement significative de %.0f points par rapport à la baseline (%.0f → %.0f)",
                    delta, scoreBaseline, scoreActuel);
            AlerteQuestionnaire alerte = AlerteQuestionnaire.builder()
                    .reponse(reponse)
                    .patient(reponse.getPatient())
                    .niveau(AlerteNiveau.WARNING)
                    .itemCode("MSIS29_BASELINE_DELTA")
                    .valeurObservee(delta)
                    .seuilDeclenche(8.0)
                    .message(message)
                    .isAcknowledged(false)
                    .build();
            AlerteQuestionnaire saved = alerteRepo.save(alerte);
            alertes.add(saved);
            log.warn("Alerte MSIS29 baseline delta : patient={} delta={}", patientId, delta);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Logique de déclenchement sur items
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Construit une alerte si la valeur observée dépasse un seuil configuré sur l'item.
     * Retourne {@code null} si aucun seuil n'est dépassé.
     */
    private AlerteQuestionnaire buildAlerte(ReponseQuestionnaire reponse,
                                             QuestionnaireTemplate template,
                                             QuestionItem item,
                                             double valeur) {
        // Règle spéciale PHQ-9 item 9 : idéations suicidaires — CRITICAL si valeur >= 1
        boolean isPhq9Item9 = "PHQ9".equals(template.getCode()) && item.getOrdre() == 9;
        if (isPhq9Item9 && valeur >= 1.0) {
            return buildAlertEntity(reponse, item, valeur,
                    item.getSeuilAlerteMin() != null ? item.getSeuilAlerteMin() : 1.0,
                    AlerteNiveau.CRITICAL,
                    "PHQ-9 item 9 (idéations suicidaires) : valeur=" + valeur);
        }

        AlerteNiveau niveauConfigured = Objects.requireNonNullElse(item.getAlerteNiveau(),
                AlerteNiveau.WARNING);

        if (item.isInverse()) {
            // Item inversé (ex. bien-être ESAS-R) : alerte si valeur <= seuilAlerteMax
            if (item.getSeuilAlerteMax() != null && valeur <= item.getSeuilAlerteMax()) {
                String message = String.format(
                        "%s (inversé) : valeur=%.0f ≤ seuil=%.0f",
                        labelItem(item), valeur, item.getSeuilAlerteMax());
                return buildAlertEntity(reponse, item, valeur, item.getSeuilAlerteMax(),
                        niveauConfigured, message);
            }
        } else {
            // Item normal : alerte si valeur >= seuilAlerteMin
            if (item.getSeuilAlerteMin() != null && valeur >= item.getSeuilAlerteMin()) {
                AlerteNiveau niveau = resolveNiveau(item, valeur, niveauConfigured);
                String message = String.format(
                        "%s : valeur=%.0f ≥ seuil=%.0f",
                        labelItem(item), valeur, item.getSeuilAlerteMin());
                return buildAlertEntity(reponse, item, valeur, item.getSeuilAlerteMin(),
                        niveau, message);
            }
            // Alerte si valeur > seuilAlerteMax (dépassement supérieur strict)
            if (item.getSeuilAlerteMax() != null && valeur > item.getSeuilAlerteMax()) {
                String message = String.format(
                        "%s : valeur=%.0f > seuil_max=%.0f",
                        labelItem(item), valeur, item.getSeuilAlerteMax());
                return buildAlertEntity(reponse, item, valeur, item.getSeuilAlerteMax(),
                        niveauConfigured, message);
            }
        }

        return null;
    }

    /**
     * Remonte le niveau d'alerte à CRITICAL si la valeur dépasse 7 pour les items VAS ESAS-R.
     * Pour les autres items, retourne le niveau configuré.
     */
    private AlerteNiveau resolveNiveau(QuestionItem item, double valeur,
                                        AlerteNiveau configured) {
        // Escalade automatique : si valeur >= 7 sur une VAS 0-10, passer en CRITICAL
        if (item.getType() != null
                && item.getType().name().startsWith("VAS")
                && valeur >= 7.0) {
            return AlerteNiveau.CRITICAL;
        }
        return configured;
    }

    private AlerteQuestionnaire buildAlertEntity(ReponseQuestionnaire reponse,
                                                  QuestionItem item,
                                                  double valeur,
                                                  double seuil,
                                                  AlerteNiveau niveau,
                                                  String message) {
        return AlerteQuestionnaire.builder()
                .reponse(reponse)
                .patient(reponse.getPatient())
                .niveau(niveau)
                .itemCode(labelItem(item))
                .valeurObservee(valeur)
                .seuilDeclenche(seuil)
                .message(message)
                .isAcknowledged(false)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // API publique complémentaire
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Acquitte une alerte clinique et enregistre l'auteur de l'acquittement.
     *
     * @param alerteId  identifiant de l'alerte à acquitter
     * @param medecinId identifiant du médecin qui acquitte
     * @return l'alerte mise à jour
     * @throws ResponseStatusException 404 si l'alerte est introuvable
     */
    @Transactional
    public AlerteQuestionnaire acknowledgeAlerte(UUID alerteId, UUID medecinId) {
        AlerteQuestionnaire alerte = alerteRepo.findById(alerteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Alerte introuvable : " + alerteId));
        alerte.setAcknowledged(true);
        alerte.setAcknowledgedBy(medecinId);
        alerte.setAcknowledgedAt(LocalDateTime.now());
        return alerteRepo.save(alerte);
    }

    /**
     * Retourne les alertes non acquittées d'un patient, triées par date décroissante.
     *
     * @param patientId identifiant du patient
     * @return liste des alertes non acquittées
     */
    @Transactional(readOnly = true)
    public List<AlerteQuestionnaire> getAlertesNonAcquittees(UUID patientId) {
        return alerteRepo.findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(patientId);
    }

    /**
     * Retourne le nombre d'alertes (toutes, acquittées ou non) regroupées par niveau.
     *
     * @return map niveau → count
     */
    @Transactional(readOnly = true)
    public Map<AlerteNiveau, Long> getAlertesStatsByNiveau() {
        return alerteRepo.findAll().stream()
                .collect(Collectors.groupingBy(AlerteQuestionnaire::getNiveau, Collectors.counting()));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Utilitaires
    // ──────────────────────────────────────────────────────────────────────────

    private String labelItem(QuestionItem item) {
        if (item.getTexteCourt() != null && !item.getTexteCourt().isBlank()) {
            return item.getTexteCourt();
        }
        if (item.getTexte() != null && item.getTexte().length() <= 50) {
            return item.getTexte();
        }
        return "Item_" + item.getOrdre();
    }

    private Double extractValue(Map<String, Object> answers, QuestionItem item) {
        Object raw = null;
        if (item.getOrdre() != null) {
            raw = answers.get(String.valueOf(item.getOrdre()));
        }
        if (raw == null && item.getId() != null) {
            raw = answers.get(item.getId().toString());
        }
        if (raw == null && item.getTexteCourt() != null) {
            raw = answers.get(item.getTexteCourt());
        }
        return toDouble(raw);
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        try {
            if (val instanceof Number n) return n.doubleValue();
            return Double.parseDouble(val.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

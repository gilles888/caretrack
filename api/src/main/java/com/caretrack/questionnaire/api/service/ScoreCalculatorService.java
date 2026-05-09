package com.caretrack.questionnaire.api.service;

import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Calcule les scores par domaine et le score global d'un questionnaire complété,
 * selon la logique propre à chaque instrument clinique.
 */
@Slf4j
@Service
public class ScoreCalculatorService {

    // Domaines KCCQ-12
    private static final String KCCQ_SF  = "SF";
    private static final String KCCQ_SB  = "SB";
    private static final String KCCQ_PL  = "PL";
    private static final String KCCQ_QOL = "QOL";
    private static final String KCCQ_SL  = "SL";

    // Domaines EORTC considérés comme fonctionnels (score 0-100, direction positive)
    private static final java.util.Set<String> EORTC_FUNCTIONAL_DOMAINS = java.util.Set.of(
        "PF", "RF", "EF", "CF", "SF", "GLOBAL"
    );

    /**
     * Calcule les scores par domaine pour un questionnaire donné.
     *
     * @param template le template de questionnaire
     * @param answers  map {itemCode/ordre: valeur} soumise par le patient
     * @return map {domaineCode: score}
     */
    public Map<String, Double> calculateScores(QuestionnaireTemplate template,
                                               Map<String, Object> answers) {
        String code = template.getCode();
        List<QuestionItem> items = template.getItems();

        return switch (code) {
            case "ESAS_R"    -> calculateEsasR(items, answers);
            case "PHQ9"      -> calculateSumByDomain(items, answers, "PHQ9");
            case "GAD7"      -> calculateSumByDomain(items, answers, "GAD7");
            case "EORTC_C30" -> calculateEortcC30(items, answers);
            case "KCCQ12"    -> calculateKccq12(items, answers);
            case "PAID20"    -> calculatePaid20(items, answers);
            case "HBI"       -> calculateSimpleSum(items, answers, "HBI");
            case "SCCAI"     -> calculateSimpleSum(items, answers, "SCCAI");
            default          -> calculateDefault(items, answers);
        };
    }

    /**
     * Calcule le score global à partir des scores par domaine.
     *
     * @param template     le template de questionnaire
     * @param domainScores map {domaineCode: score}
     * @return score global (moyenne ou somme selon l'instrument)
     */
    public Double calculateGlobalScore(QuestionnaireTemplate template,
                                       Map<String, Double> domainScores) {
        if (domainScores == null || domainScores.isEmpty()) {
            return 0.0;
        }

        String code = template.getCode();

        return switch (code) {
            case "PHQ9", "GAD7" -> domainScores.values().stream()
                    .mapToDouble(Double::doubleValue).sum();

            case "ESAS_R" -> domainScores.values().stream()
                    .mapToDouble(Double::doubleValue).sum();

            case "PAID20" -> domainScores.getOrDefault("PAID20", 0.0);

            case "HBI"   -> domainScores.getOrDefault("HBI", 0.0);
            case "SCCAI" -> domainScores.getOrDefault("SCCAI", 0.0);

            case "EORTC_C30" -> domainScores.entrySet().stream()
                    .filter(e -> EORTC_FUNCTIONAL_DOMAINS.contains(e.getKey()))
                    .mapToDouble(Map.Entry::getValue)
                    .average()
                    .orElse(0.0);

            case "KCCQ12" -> domainScores.getOrDefault("OSS", 0.0);

            default -> domainScores.values().stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Implémentations privées par instrument
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * ESAS-R : score brut par item (0-10), scoreGlobal = somme.
     * Pour le Bien-être (isInverse=true) la valeur brute est conservée telle quelle.
     */
    private Map<String, Double> calculateEsasR(List<QuestionItem> items,
                                               Map<String, Object> answers) {
        Map<String, Double> scores = new HashMap<>();
        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val != null) {
                String domaine = Objects.requireNonNullElse(item.getDomaineCode(),
                        "ITEM_" + item.getOrdre());
                scores.merge(domaine, val, Double::sum);
            }
        }
        return scores;
    }

    /**
     * PHQ-9 / GAD-7 : somme de tous les items (0-3 chacun).
     * Le score global correspond à la somme totale.
     */
    private Map<String, Double> calculateSumByDomain(List<QuestionItem> items,
                                                      Map<String, Object> answers,
                                                      String globalDomainKey) {
        double sum = 0.0;
        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val != null) {
                sum += val;
            }
        }
        Map<String, Double> scores = new HashMap<>();
        scores.put(globalDomainKey, sum);
        return scores;
    }

    /**
     * HBI / SCCAI : somme brute des items, stockée sous la clé du code du template.
     */
    private Map<String, Double> calculateSimpleSum(List<QuestionItem> items,
                                                    Map<String, Object> answers,
                                                    String key) {
        double sum = 0.0;
        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val != null) {
                sum += val;
            }
        }
        Map<String, Double> scores = new HashMap<>();
        scores.put(key, sum);
        return scores;
    }

    /**
     * PAID-20 : somme de tous les items * 1,25 (total max = 100).
     */
    private Map<String, Double> calculatePaid20(List<QuestionItem> items,
                                                 Map<String, Object> answers) {
        double sum = 0.0;
        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val != null) {
                sum += val;
            }
        }
        Map<String, Double> scores = new HashMap<>();
        scores.put("PAID20", sum * 1.25);
        return scores;
    }

    /**
     * EORTC QLQ-C30 : transformation linéaire officielle EORTC.
     * <ul>
     *   <li>Domaines fonctionnels (EORTC_FUNCTIONAL_DOMAINS) :
     *       {@code score = (1 - (rawMean - 1) / range) * 100}</li>
     *   <li>Domaines symptômes :
     *       {@code score = ((rawMean - 1) / range) * 100}</li>
     * </ul>
     * Le range est déduit du type de question (LIKERT_4 → range=3, LIKERT_7 → range=6, etc.).
     * Les items sont regroupés par domaineCode.
     */
    private Map<String, Double> calculateEortcC30(List<QuestionItem> items,
                                                   Map<String, Object> answers) {
        // Regrouper les valeurs brutes par domaine
        Map<String, List<Double>> rawByDomain = new HashMap<>();
        Map<String, Integer> rangeByDomain = new HashMap<>();

        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val == null) continue;
            String domaine = Objects.requireNonNullElse(item.getDomaineCode(),
                    "ITEM_" + item.getOrdre());
            rawByDomain.computeIfAbsent(domaine, k -> new java.util.ArrayList<>()).add(val);
            // Déterminer le range selon le type
            int range = rangeFromType(item);
            rangeByDomain.put(domaine, range);
        }

        Map<String, Double> scores = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : rawByDomain.entrySet()) {
            String domaine = entry.getKey();
            List<Double> vals = entry.getValue();
            double rawMean = vals.stream().mapToDouble(Double::doubleValue).average().orElse(1.0);
            int range = rangeByDomain.getOrDefault(domaine, 3);

            double score;
            if (EORTC_FUNCTIONAL_DOMAINS.contains(domaine)) {
                score = (1.0 - (rawMean - 1.0) / range) * 100.0;
            } else {
                score = ((rawMean - 1.0) / range) * 100.0;
            }
            scores.put(domaine, Math.round(score * 100.0) / 100.0);
        }
        return scores;
    }

    /**
     * KCCQ-12 : calcul des scores composites.
     * <ul>
     *   <li>TSS = (SF + SB) / 2</li>
     *   <li>CSS = (TSS + PL) / 2</li>
     *   <li>OSS = (PL + TSS + QOL + SL) / 4</li>
     * </ul>
     * Les scores des domaines élémentaires sont normalisés sur 0-100
     * selon la formule KCCQ : {@code (rawMean - 1) / (max - 1) * 100}.
     */
    private Map<String, Double> calculateKccq12(List<QuestionItem> items,
                                                 Map<String, Object> answers) {
        // Regrouper les moyennes normalisées par domaine
        Map<String, List<Double>> rawByDomain = new HashMap<>();
        Map<String, Integer> maxByDomain = new HashMap<>();

        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val == null) continue;
            String domaine = Objects.requireNonNullElse(item.getDomaineCode(), "AUTRE");
            rawByDomain.computeIfAbsent(domaine, k -> new java.util.ArrayList<>()).add(val);
            int maxVal = maxFromType(item);
            maxByDomain.put(domaine, maxVal);
        }

        Map<String, Double> scores = new HashMap<>();

        // Normaliser chaque domaine élémentaire
        for (Map.Entry<String, List<Double>> entry : rawByDomain.entrySet()) {
            String domaine = entry.getKey();
            List<Double> vals = entry.getValue();
            double rawMean = vals.stream().mapToDouble(Double::doubleValue).average().orElse(1.0);
            int maxVal = maxByDomain.getOrDefault(domaine, 5);
            double normalized = (rawMean - 1.0) / (maxVal - 1.0) * 100.0;
            scores.put(domaine, Math.round(normalized * 100.0) / 100.0);
        }

        // Calculer les scores composites
        Double sf  = scores.getOrDefault(KCCQ_SF, null);
        Double sb  = scores.getOrDefault(KCCQ_SB, null);
        Double pl  = scores.getOrDefault(KCCQ_PL, null);
        Double qol = scores.getOrDefault(KCCQ_QOL, null);
        Double sl  = scores.getOrDefault(KCCQ_SL, null);

        if (sf != null && sb != null) {
            double tss = (sf + sb) / 2.0;
            scores.put("TSS", Math.round(tss * 100.0) / 100.0);

            if (pl != null) {
                double css = (tss + pl) / 2.0;
                scores.put("CSS", Math.round(css * 100.0) / 100.0);

                if (qol != null && sl != null) {
                    double oss = (pl + tss + qol + sl) / 4.0;
                    scores.put("OSS", Math.round(oss * 100.0) / 100.0);
                }
            }
        }

        return scores;
    }

    /**
     * Calcul par défaut : moyenne des valeurs numériques, regroupées par domaine.
     */
    private Map<String, Double> calculateDefault(List<QuestionItem> items,
                                                  Map<String, Object> answers) {
        Map<String, List<Double>> rawByDomain = new HashMap<>();

        for (QuestionItem item : items) {
            Double val = extractValue(answers, item);
            if (val == null) continue;
            String domaine = Objects.requireNonNullElse(item.getDomaineCode(),
                    "ITEM_" + item.getOrdre());
            rawByDomain.computeIfAbsent(domaine, k -> new java.util.ArrayList<>()).add(val);
        }

        return rawByDomain.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    e -> e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
                ));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Utilitaires
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Extrait et convertit la valeur d'une réponse pour un item donné.
     * Cherche d'abord par la clé de l'ordre de l'item (String), puis par son ID.
     *
     * @param answers  map de réponses brutes
     * @param item     item concerné
     * @return valeur Double, ou {@code null} si absente ou non numérique
     */
    private Double extractValue(Map<String, Object> answers, QuestionItem item) {
        // Essayer plusieurs clés : ordre (String), UUID, texteCourt
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

    /**
     * Convertit un objet en Double (supporte Integer, Long, Float, Double, String).
     */
    private Double toDouble(Object val) {
        if (val == null) return null;
        try {
            if (val instanceof Number n) return n.doubleValue();
            return Double.parseDouble(val.toString().trim());
        } catch (NumberFormatException e) {
            log.debug("Valeur non numérique ignorée dans le calcul de score : '{}'", val);
            return null;
        }
    }

    /**
     * Détermine le range (max - min) pour la transformation linéaire EORTC,
     * selon le type de question de l'item.
     */
    private int rangeFromType(QuestionItem item) {
        if (item.getType() == null) return 3;
        return switch (item.getType()) {
            case LIKERT_4 -> 3;   // valeurs 1-4 → range 3
            case LIKERT_5 -> 4;   // valeurs 1-5 → range 4
            case LIKERT_6 -> 5;   // valeurs 0-5 → range 5
            case LIKERT_7 -> 6;   // valeurs 1-7 → range 6
            case VAS_0_10 -> 10;  // valeurs 0-10 → range 10
            default       -> 3;
        };
    }

    /**
     * Détermine la valeur maximale possible pour un item KCCQ,
     * selon le type de question.
     */
    private int maxFromType(QuestionItem item) {
        if (item.getType() == null) return 5;
        return switch (item.getType()) {
            case LIKERT_4 -> 4;
            case LIKERT_5 -> 5;
            case LIKERT_6 -> 6;
            case LIKERT_7 -> 7;
            case VAS_0_10 -> 10;
            default       -> 5;
        };
    }
}

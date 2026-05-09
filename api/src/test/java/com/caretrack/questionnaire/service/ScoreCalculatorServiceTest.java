package com.caretrack.questionnaire.service;

import com.caretrack.questionnaire.api.service.ScoreCalculatorService;
import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.QuestionType;
import com.caretrack.questionnaire.enums.ScopeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

@DisplayName("ScoreCalculatorService")
class ScoreCalculatorServiceTest {

    private ScoreCalculatorService service;

    @BeforeEach
    void setUp() {
        service = new ScoreCalculatorService();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Construit un QuestionItem minimal via le builder Lombok.
     * Le champ template est laissé null (acceptable pour tests unitaires purs).
     */
    private QuestionItem item(int ordre, QuestionType type, String domaineCode) {
        return QuestionItem.builder()
                .texte("Item " + ordre)
                .type(type)
                .ordre(ordre)
                .domaineCode(domaineCode)
                .build();
    }

    /**
     * Construit un QuestionnaireTemplate minimal avec la liste d'items fournie.
     */
    private QuestionnaireTemplate template(String code, List<QuestionItem> items) {
        QuestionnaireTemplate t = QuestionnaireTemplate.builder()
                .code(code)
                .nom("Template " + code)
                .scope(ScopeType.CORE)
                .frequence(FrequenceType.HEBDO)
                .build();
        // On injecte les items directement dans la liste (la liste est mutable par @Builder.Default)
        t.getItems().addAll(items);
        return t;
    }

    /**
     * Construit une map de réponses à partir de paires (ordre → valeur).
     */
    private Map<String, Object> answers(Object... pairs) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            map.put(String.valueOf(pairs[i]), pairs[i + 1]);
        }
        return map;
    }

    // ── ESAS-r ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("ESAS-r")
    class EsasR {

        @Test
        @DisplayName("calcule le score par domaine à partir des réponses")
        void testEsasRScoreParDomaine() {
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.VAS_0_10, "DOULEUR"),
                    item(2, QuestionType.VAS_0_10, "FATIGUE"),
                    item(3, QuestionType.VAS_0_10, "DOULEUR") // 2e item même domaine
            );
            QuestionnaireTemplate t = template("ESAS_R", items);
            // item 1 → DOULEUR=3, item 2 → FATIGUE=5, item 3 → DOULEUR=7
            Map<String, Object> ans = answers(1, 3, 2, 5, 3, 7);

            Map<String, Double> scores = service.calculateScores(t, ans);

            // DOULEUR = 3 + 7 = 10 (merge par somme)
            assertThat(scores).containsEntry("DOULEUR", 10.0);
            assertThat(scores).containsEntry("FATIGUE", 5.0);
        }

        @Test
        @DisplayName("scoreGlobal ESAS-r est la somme de tous les scores domaines")
        void testEsasRGlobalScore() {
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.VAS_0_10, "DOULEUR"),
                    item(2, QuestionType.VAS_0_10, "FATIGUE"),
                    item(3, QuestionType.VAS_0_10, "NAUSEE")
            );
            QuestionnaireTemplate t = template("ESAS_R", items);
            Map<String, Object> ans = answers(1, 4, 2, 6, 3, 2);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(global).isEqualTo(12.0); // 4 + 6 + 2
        }

        @Test
        @DisplayName("items sans réponse ne sont pas inclus dans les scores")
        void testEsasRItemsSansReponse() {
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.VAS_0_10, "DOULEUR"),
                    item(2, QuestionType.VAS_0_10, "FATIGUE")
            );
            QuestionnaireTemplate t = template("ESAS_R", items);
            // Seulement item 1 répondu
            Map<String, Object> ans = answers(1, 5);

            Map<String, Double> scores = service.calculateScores(t, ans);

            assertThat(scores).containsOnlyKeys("DOULEUR");
            assertThat(scores).doesNotContainKey("FATIGUE");
        }
    }

    // ── PHQ-9 ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("PHQ-9")
    class Phq9 {

        /**
         * Construit un template PHQ9 avec 9 items LIKERT_4.
         * Tous les items sont dans le domaine "PHQ9" — mais calculateSumByDomain
         * ne se base pas sur domaineCode, elle somme tous les items.
         */
        private QuestionnaireTemplate phq9Template() {
            List<QuestionItem> items = new ArrayList<>();
            for (int i = 1; i <= 9; i++) {
                items.add(item(i, QuestionType.LIKERT_4, "PHQ9"));
            }
            return template("PHQ9", items);
        }

        @Test
        @DisplayName("score total PHQ-9 maximum = 27 (9 items à 3)")
        void testPhq9MaxScore() {
            QuestionnaireTemplate t = phq9Template();
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 9; i++) {
                ans.put(String.valueOf(i), 3);
            }

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(global).isEqualTo(27.0);
        }

        @Test
        @DisplayName("score total PHQ-9 minimum = 0 (9 items à 0)")
        void testPhq9MinScore() {
            QuestionnaireTemplate t = phq9Template();
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 9; i++) {
                ans.put(String.valueOf(i), 0);
            }

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(global).isEqualTo(0.0);
        }

        @Test
        @DisplayName("score PHQ-9 modéré : 9 items avec total = 12")
        void testPhq9ModerateScore() {
            QuestionnaireTemplate t = phq9Template();
            // 4 items à 2 + 5 items à 0 = total 8... ajustons : 4 items à 2 + 4 items à 1 = 12
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 4; i++) ans.put(String.valueOf(i), 2);
            for (int i = 5; i <= 8; i++) ans.put(String.valueOf(i), 1);
            ans.put("9", 0);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(global).isBetween(10.0, 14.0);
        }

        @Test
        @DisplayName("calculateScores retourne une map avec la clé PHQ9")
        void testPhq9ScoresMapKey() {
            QuestionnaireTemplate t = phq9Template();
            Map<String, Object> ans = answers(1, 2, 2, 3);

            Map<String, Double> scores = service.calculateScores(t, ans);

            assertThat(scores).containsKey("PHQ9");
            assertThat(scores.get("PHQ9")).isEqualTo(5.0);
        }
    }

    // ── GAD-7 ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GAD-7")
    class Gad7 {

        @Test
        @DisplayName("score GAD-7 : somme de 7 items, max = 21")
        void testGad7MaxScore() {
            List<QuestionItem> items = new ArrayList<>();
            for (int i = 1; i <= 7; i++) {
                items.add(item(i, QuestionType.LIKERT_4, "GAD7"));
            }
            QuestionnaireTemplate t = template("GAD7", items);
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 7; i++) ans.put(String.valueOf(i), 3);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(global).isEqualTo(21.0);
        }
    }

    // ── PAID-20 ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("PAID-20")
    class Paid20 {

        @Test
        @DisplayName("score PAID-20 applique le multiplicateur ×1.25")
        void testPaid20Multiplier() {
            List<QuestionItem> items = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                items.add(item(i, QuestionType.LIKERT_5, "PAID20"));
            }
            QuestionnaireTemplate t = template("PAID20", items);
            // 20 items à 0, sauf items 1 à 8 à 4 → somme brute = 32
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 20; i++) ans.put(String.valueOf(i), 0);
            for (int i = 1; i <= 8; i++) ans.put(String.valueOf(i), 4);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            // 32 * 1.25 = 40.0
            assertThat(global).isEqualTo(40.0);
        }

        @Test
        @DisplayName("score PAID-20 maximum = 100 (20 items à 4)")
        void testPaid20MaxScore() {
            List<QuestionItem> items = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                items.add(item(i, QuestionType.LIKERT_5, "PAID20"));
            }
            QuestionnaireTemplate t = template("PAID20", items);
            Map<String, Object> ans = new HashMap<>();
            for (int i = 1; i <= 20; i++) ans.put(String.valueOf(i), 4);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            // 80 * 1.25 = 100.0
            assertThat(global).isEqualTo(100.0);
        }
    }

    // ── EORTC QLQ-C30 ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("EORTC QLQ-C30")
    class EortcC30 {

        @Test
        @DisplayName("domaine fonctionnel PF : score 0-100 par transformation linéaire (inversée)")
        void testFunctionalDomainLinearTransformation() {
            // Item LIKERT_4, domaine fonctionnel PF
            // rawMean = 1 (meilleure valeur) → score = (1 - (1-1)/3) * 100 = 100
            QuestionItem pfItem = item(1, QuestionType.LIKERT_4, "PF");
            QuestionnaireTemplate t = template("EORTC_C30", List.of(pfItem));
            Map<String, Object> ans = answers(1, 1);

            Map<String, Double> scores = service.calculateScores(t, ans);

            assertThat(scores).containsKey("PF");
            assertThat(scores.get("PF")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("domaine fonctionnel EF : rawMean=4 → score=0 pour LIKERT_4")
        void testFunctionalDomainWorstScore() {
            QuestionItem efItem = item(1, QuestionType.LIKERT_4, "EF");
            QuestionnaireTemplate t = template("EORTC_C30", List.of(efItem));
            Map<String, Object> ans = answers(1, 4);

            Map<String, Double> scores = service.calculateScores(t, ans);

            // score = (1 - (4-1)/3) * 100 = 0
            assertThat(scores.get("EF")).isEqualTo(0.0);
        }

        @Test
        @DisplayName("domaine symptôme (non-fonctionnel) : rawMean=4 → score=100 pour LIKERT_4")
        void testSymptomDomainTransformation() {
            // Domaine NAUSEE n'est pas dans EORTC_FUNCTIONAL_DOMAINS
            QuestionItem symptomItem = item(1, QuestionType.LIKERT_4, "NAUSEE");
            QuestionnaireTemplate t = template("EORTC_C30", List.of(symptomItem));
            Map<String, Object> ans = answers(1, 4);

            Map<String, Double> scores = service.calculateScores(t, ans);

            // score = ((4-1)/3) * 100 = 100
            assertThat(scores.get("NAUSEE")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("calculateGlobalScore EORTC : moyenne des domaines fonctionnels uniquement")
        void testEortcGlobalScoreOnlyFunctional() {
            // Construit un template avec 2 items fonctionnels et 1 symptôme
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.LIKERT_4, "PF"),
                    item(2, QuestionType.LIKERT_4, "EF"),
                    item(3, QuestionType.LIKERT_4, "DOULEUR") // symptôme
            );
            QuestionnaireTemplate t = template("EORTC_C30", items);
            // PF: rawMean=1 → 100.0, EF: rawMean=3 → 33.33, DOULEUR: rawMean=4 → 100.0
            Map<String, Object> ans = answers(1, 1, 2, 3, 3, 4);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            // global = moyenne(PF, EF) = (100 + 33.33) / 2 ≈ 66.67
            assertThat(global).isBetween(66.0, 67.0);
        }
    }

    // ── KCCQ-12 ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("KCCQ-12")
    class Kccq12 {

        @Test
        @DisplayName("calcule OSS quand les 4 domaines élémentaires sont présents")
        void testKccq12OssCalculated() {
            // SF, SB, PL, QOL, SL avec LIKERT_5 (max=5)
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.LIKERT_5, "SF"),
                    item(2, QuestionType.LIKERT_5, "SB"),
                    item(3, QuestionType.LIKERT_5, "PL"),
                    item(4, QuestionType.LIKERT_5, "QOL"),
                    item(5, QuestionType.LIKERT_5, "SL")
            );
            QuestionnaireTemplate t = template("KCCQ12", items);
            // Tous à 5 → normalized = (5-1)/(5-1)*100 = 100 pour chaque domaine
            Map<String, Object> ans = answers(1, 5, 2, 5, 3, 5, 4, 5, 5, 5);

            Map<String, Double> scores = service.calculateScores(t, ans);

            assertThat(scores).containsKey("OSS");
            assertThat(scores.get("OSS")).isEqualTo(100.0);
        }

        @Test
        @DisplayName("pas de OSS si un domaine élémentaire manque")
        void testKccq12OssMissingWhenDomainAbsent() {
            // Seulement SF, SB, PL — pas de QOL ni SL
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.LIKERT_5, "SF"),
                    item(2, QuestionType.LIKERT_5, "SB"),
                    item(3, QuestionType.LIKERT_5, "PL")
            );
            QuestionnaireTemplate t = template("KCCQ12", items);
            Map<String, Object> ans = answers(1, 5, 2, 5, 3, 5);

            Map<String, Double> scores = service.calculateScores(t, ans);

            assertThat(scores).doesNotContainKey("OSS");
            // TSS et CSS présents
            assertThat(scores).containsKey("TSS");
            assertThat(scores).containsKey("CSS");
        }

        @Test
        @DisplayName("calculateGlobalScore KCCQ retourne la valeur OSS")
        void testKccq12GlobalScoreIsOss() {
            Map<String, Double> domainScores = new HashMap<>();
            domainScores.put("OSS", 75.0);
            domainScores.put("TSS", 80.0);
            QuestionnaireTemplate t = template("KCCQ12", List.of());

            Double global = service.calculateGlobalScore(t, domainScores);

            assertThat(global).isEqualTo(75.0);
        }
    }

    // ── HBI ───────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("HBI")
    class Hbi {

        @Test
        @DisplayName("score HBI : somme simple, clé HBI dans la map")
        void testHbiSimpleSum() {
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.LIKERT_4, "HBI"),
                    item(2, QuestionType.LIKERT_4, "HBI"),
                    item(3, QuestionType.LIKERT_4, "HBI")
            );
            QuestionnaireTemplate t = template("HBI", items);
            Map<String, Object> ans = answers(1, 2, 2, 3, 3, 1);

            Map<String, Double> scores = service.calculateScores(t, ans);
            Double global = service.calculateGlobalScore(t, scores);

            assertThat(scores).containsKey("HBI");
            assertThat(global).isEqualTo(6.0);
        }
    }

    // ── Cas limites ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Cas limites")
    class CasLimites {

        @Test
        @DisplayName("réponses vides → PHQ9 retourne {PHQ9=0.0}, globalScore = 0")
        void testEmptyAnswers() {
            List<QuestionItem> items = List.of(item(1, QuestionType.LIKERT_4, "PHQ9"));
            QuestionnaireTemplate t = template("PHQ9", items);

            Map<String, Double> scores = service.calculateScores(t, Map.of());
            Double global = service.calculateGlobalScore(t, scores);

            // calculateSumByDomain retourne toujours la clé du template avec sum=0.0
            // même en l'absence de réponses valides
            assertThat(scores).containsExactly(entry("PHQ9", 0.0));
            assertThat(global).isEqualTo(0.0);
        }

        @Test
        @DisplayName("valeur non numérique ignorée → PHQ9 retourne {PHQ9=0.0}")
        void testNonNumericAnswerIgnored() {
            List<QuestionItem> items = List.of(item(1, QuestionType.LIKERT_4, "PHQ9"));
            QuestionnaireTemplate t = template("PHQ9", items);
            Map<String, Object> ans = new HashMap<>();
            ans.put("1", "non-numerique");

            Map<String, Double> scores = service.calculateScores(t, ans);

            // La valeur non numérique est ignorée (toDouble retourne null),
            // mais calculateSumByDomain retourne quand même la clé avec sum=0.0
            assertThat(scores).containsExactly(entry("PHQ9", 0.0));
        }

        @Test
        @DisplayName("domainScores null retourne globalScore 0.0")
        void testNullDomainScores() {
            QuestionnaireTemplate t = template("PHQ9", List.of());

            Double global = service.calculateGlobalScore(t, null);

            assertThat(global).isEqualTo(0.0);
        }

        @Test
        @DisplayName("template inconnu : calculateScores utilise la stratégie par défaut (moyenne)")
        void testUnknownTemplateDefault() {
            List<QuestionItem> items = List.of(
                    item(1, QuestionType.LIKERT_4, "DOM_A"),
                    item(2, QuestionType.LIKERT_4, "DOM_A")
            );
            QuestionnaireTemplate t = template("UNKNOWN_CODE", items);
            Map<String, Object> ans = answers(1, 2, 2, 4);

            Map<String, Double> scores = service.calculateScores(t, ans);

            // Stratégie par défaut : moyenne par domaine
            assertThat(scores).containsKey("DOM_A");
            assertThat(scores.get("DOM_A")).isEqualTo(3.0); // (2+4)/2
        }
    }
}

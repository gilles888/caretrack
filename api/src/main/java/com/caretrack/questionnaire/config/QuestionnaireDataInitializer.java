package com.caretrack.questionnaire.config;

import com.caretrack.domain.Disease;
import com.caretrack.domain.DiseaseRepository;
import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.enums.*;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuestionnaireDataInitializer {

    private final QuestionnaireTemplateRepository templateRepo;
    private final DiseaseRepository diseaseRepo;

    @PostConstruct
    @Transactional
    public void init() {
        if (templateRepo.count() > 0) {
            log.info("Questionnaires déjà chargés — initialisation ignorée");
            return;
        }
        log.info("Chargement des questionnaires cliniques validés...");

        Map<String, Disease> d = initDiseases();

        // ── CORE ──────────────────────────────────────────────────────────
        saveEsasR();
        savePhq9();
        saveGad7();
        saveMars5();
        saveBmqSpecifique();
        saveDt();
        saveEq5d5l();

        // ── CANCER ────────────────────────────────────────────────────────
        saveEortcC30(d.get("CANCER"));
        saveProCtcaeChimio(d.get("CANCER"));
        saveProCtcaeImmuno(d.get("CANCER"));
        saveProCtcaeCible(d.get("CANCER"));
        saveProCtcaeHormono(d.get("CANCER"));
        saveHads(d.get("CANCER"));

        // ── SEP ───────────────────────────────────────────────────────────
        saveMsis29(d.get("SEP"));
        saveMsws12(d.get("SEP"));
        saveMfis(d.get("SEP"));

        // ── INSUFFISANCE CARDIAQUE ─────────────────────────────────────────
        saveKccq12(d.get("HEART_FAILURE"));
        saveMlhfq(d.get("HEART_FAILURE"));

        // ── DIABÈTE ───────────────────────────────────────────────────────
        savePaid5(d.get("DIABETES"));
        savePaid20(d.get("DIABETES"));
        saveDds17(d.get("DIABETES"));

        // ── IBD ───────────────────────────────────────────────────────────
        saveSibdq(d.get("CROHN"), d.get("UC"));
        saveHbi(d.get("CROHN"));
        saveSccai(d.get("UC"));
        saveRapid3(d.get("RA"));
        saveHaqdiDisab(d.get("RA"));

        log.info("✅ {} questionnaires chargés", templateRepo.count());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DISEASES
    // ═══════════════════════════════════════════════════════════════════════

    private Map<String, Disease> initDiseases() {
        List<Disease> defs = List.of(
            Disease.builder().code("CANCER").nom("Cancer").build(),
            Disease.builder().code("SEP").nom("Sclérose en plaques").build(),
            Disease.builder().code("HEART_FAILURE").nom("Insuffisance cardiaque").build(),
            Disease.builder().code("DIABETES").nom("Diabète").build(),
            Disease.builder().code("CROHN").nom("Maladie de Crohn").build(),
            Disease.builder().code("UC").nom("Colite ulcéreuse").build(),
            Disease.builder().code("RA").nom("Polyarthrite rhumatoïde").build()
        );
        return defs.stream()
            .map(dis -> diseaseRepo.findByCode(dis.getCode()).orElseGet(() -> diseaseRepo.save(dis)))
            .collect(Collectors.toMap(Disease::getCode, Function.identity()));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BUILDERS
    // ═══════════════════════════════════════════════════════════════════════

    private QuestionnaireTemplate core(String code, String nom, FrequenceType freq,
                                       String version, int duree, String licence) {
        return QuestionnaireTemplate.builder()
            .code(code).nom(nom).scope(ScopeType.CORE)
            .frequence(freq).version(version)
            .dureeEstimeeMinutes(duree).licenceInfo(licence)
            .build();
    }

    private QuestionnaireTemplate specific(String code, String nom, FrequenceType freq,
                                           String version, int duree, String licence,
                                           Disease... diseases) {
        QuestionnaireTemplate t = QuestionnaireTemplate.builder()
            .code(code).nom(nom).scope(ScopeType.DISEASE_SPECIFIC)
            .frequence(freq).version(version)
            .dureeEstimeeMinutes(duree).licenceInfo(licence)
            .build();
        for (Disease dis : diseases) t.getDiseases().add(dis);
        return t;
    }

    private QuestionItem item(QuestionnaireTemplate t, String texte, String court,
                              QuestionType type, int ordre, String domaine,
                              Double sMin, Double sMax, AlerteNiveau niveau,
                              boolean inverse, String lblMin, String lblMax,
                              ItemAttributeType... attrs) {
        QuestionItem qi = QuestionItem.builder()
            .template(t).texte(texte).texteCourt(court)
            .type(type).ordre(ordre).domaineCode(domaine)
            .seuilAlerteMin(sMin).seuilAlerteMax(sMax).alerteNiveau(niveau)
            .isInverse(inverse).labelMin(lblMin).labelMax(lblMax)
            .build();
        if (attrs != null) for (ItemAttributeType a : attrs) qi.getAttributes().add(a);
        return qi;
    }

    private QuestionItem vas(QuestionnaireTemplate t, String texte, String court,
                             int ordre, String domaine, Double sMin, AlerteNiveau niv) {
        return item(t, texte, court, QuestionType.VAS_0_10, ordre, domaine,
                    sMin, null, niv, false, "Aucun(e)", "Le pire possible", (ItemAttributeType[]) null);
    }

    private QuestionItem likert4(QuestionnaireTemplate t, String texte, String court,
                                 int ordre, String domaine, Double sMin, AlerteNiveau niv) {
        return item(t, texte, court, QuestionType.LIKERT_4, ordre, domaine,
                    sMin, null, niv, false, "Jamais", "Presque toujours", (ItemAttributeType[]) null);
    }

    private QuestionItem likert5(QuestionnaireTemplate t, String texte, String court,
                                 int ordre, String domaine, Double sMin, AlerteNiveau niv) {
        return item(t, texte, court, QuestionType.LIKERT_5, ordre, domaine,
                    sMin, null, niv, false, "Pas du tout", "Énormément", (ItemAttributeType[]) null);
    }

    private void save(QuestionnaireTemplate t, List<QuestionItem> items) {
        items.forEach(i -> t.getItems().add(i));
        templateRepo.save(t);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── CORE ────────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void saveEsasR() {
        QuestionnaireTemplate t = core("ESAS_R",
            "Edmonton Symptom Assessment System Revised",
            FrequenceType.QUOTIDIEN, "2010", 1, "Gratuit");
        List<QuestionItem> items = new ArrayList<>();
        record S(String txt, String court, String dom, boolean inv) {}
        List<S> defs = List.of(
            new S("Douleur", "Douleur", "DOULEUR", false),
            new S("Fatigue", "Fatigue", "FATIGUE", false),
            new S("Nausées", "Nausées", "NAUSEES", false),
            new S("Dépression", "Dépression", "EMOTIONNEL", false),
            new S("Anxiété", "Anxiété", "EMOTIONNEL", false),
            new S("Somnolence", "Somnolence", "PHYSIQUE", false),
            new S("Appétit (manque d'appétit)", "Appétit", "PHYSIQUE", false),
            new S("Bien-être (sentiment de bien-être)", "Bien-être", "GLOBAL", true),
            new S("Essoufflement", "Essoufflement", "PHYSIQUE", false)
        );
        for (int i = 0; i < defs.size(); i++) {
            S s = defs.get(i);
            if (s.inv()) {
                // Bien-être : alerte si score ≤4 (seuilAlerteMax=4)
                items.add(item(t, s.txt(), s.court(), QuestionType.VAS_0_10, i + 1, s.dom(),
                               null, 4.0, AlerteNiveau.WARNING, true,
                               "Le meilleur possible", "Le pire possible", (ItemAttributeType[]) null));
            } else {
                items.add(item(t, s.txt(), s.court(), QuestionType.VAS_0_10, i + 1, s.dom(),
                               4.0, null, AlerteNiveau.WARNING, false,
                               "Aucun(e)", "Le pire possible", (ItemAttributeType[]) null));
                // Double seuil : ≥7 → CRITICAL (on utilise seuilAlerteMin=7 via un 2e item virtuel
                // En pratique le service de scoring lira les deux seuils : ≥4 WARNING, ≥7 CRITICAL
                // Stocké : seuilAlerteMin=4 WARNING puis override CRITICAL à 7 dans le scoring
            }
        }
        // Double seuil ESAS-R : ≥4 WARNING (seuilAlerteMin), ≥7 CRITICAL (seuilAlerteMax)
        // Le service de scoring lit seuilAlerteMin=4→WARNING, seuilAlerteMax=7→CRITICAL
        items.stream().filter(i -> !i.isInverse())
             .forEach(i -> { i.setSeuilAlerteMax(7.0); i.setAlerteNiveau(AlerteNiveau.CRITICAL); });
        // Items <7 gardent WARNING via la logique de scoring : min≤val<max→WARNING, val≥max→CRITICAL
        save(t, items);
    }

    private void savePhq9() {
        QuestionnaireTemplate t = core("PHQ9",
            "Patient Health Questionnaire-9",
            FrequenceType.HEBDO, "2001", 3, "Gratuit — Pfizer Inc.");
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Peu d'intérêt ou de plaisir à faire les choses",
            "Se sentir triste, déprimé(e) ou désespéré(e)",
            "Difficultés à s'endormir, rester endormi(e) ou dormir trop",
            "Se sentir fatigué(e) ou manquer d'énergie",
            "Manque d'appétit ou manger trop",
            "Se sentir mal dans sa peau ou nul(le)",
            "Difficultés à se concentrer",
            "Bouger ou parler si lentement que les autres le remarquent ou au contraire agitation",
            "Pensées qu'il vaudrait mieux être mort(e) ou de se faire du mal"
        };
        for (int i = 0; i < textes.length; i++) {
            boolean isIdeal = (i == 8); // item 9 — idéations suicidaires
            items.add(item(t, textes[i], "PHQ9-" + (i + 1), QuestionType.LIKERT_4, i + 1,
                           isIdeal ? "SUICIDALITE" : "DEPRESSION",
                           isIdeal ? 1.0 : 2.0, null,
                           isIdeal ? AlerteNiveau.CRITICAL : AlerteNiveau.WARNING,
                           false, "Jamais", "Presque tous les jours", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveGad7() {
        QuestionnaireTemplate t = core("GAD7",
            "Generalized Anxiety Disorder 7-item",
            FrequenceType.HEBDO, "2006", 2, "Gratuit — Pfizer Inc.");
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Se sentir nerveux(se), anxieux(se) ou à bout",
            "Ne pas pouvoir arrêter de s'inquiéter ou ne pas pouvoir contrôler ses inquiétudes",
            "S'inquiéter trop à propos de différentes choses",
            "Avoir du mal à se détendre",
            "Être tellement agité(e) qu'il est difficile de rester tranquille",
            "Devenir facilement irritable ou irrité(e)",
            "Avoir peur que quelque chose de terrible puisse arriver"
        };
        for (int i = 0; i < textes.length; i++) {
            items.add(likert4(t, textes[i], "GAD7-" + (i + 1), i + 1, "ANXIETE", 2.0, AlerteNiveau.WARNING));
        }
        save(t, items);
    }

    private void saveMars5() {
        QuestionnaireTemplate t = core("MARS5",
            "Medication Adherence Report Scale — 5 items",
            FrequenceType.HEBDO, "2014", 1, "Gratuit");
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "J'oublie de prendre mes médicaments",
            "Je modifie ma dose",
            "J'arrête de prendre mes médicaments pendant un certain temps",
            "Je décide de sauter une dose",
            "Je prends moins de médicaments que prescrit"
        };
        for (int i = 0; i < textes.length; i++) {
            // Score ≥22 = bonne adhérence (items inversés) ; <15 = CRITICAL
            items.add(item(t, textes[i], "MARS5-" + (i + 1), QuestionType.LIKERT_5, i + 1,
                           "ADHERENCE", null, 3.0, AlerteNiveau.CRITICAL,
                           true, "Toujours", "Jamais", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveBmqSpecifique() {
        QuestionnaireTemplate t = core("BMQ_SPECIFIQUE",
            "Beliefs about Medicines Questionnaire — Spécifique",
            FrequenceType.MENSUEL, "1999", 3, "Gratuit — Prof. Rob Horne");
        List<QuestionItem> items = new ArrayList<>();
        // Sous-échelle Nécessité (items 1-5)
        String[] necessite = {
            "J'ai besoin de ces médicaments pour garder ma santé",
            "Ma vie serait impossible sans mes médicaments",
            "Sans mes médicaments, je serais très malade",
            "Ma santé, dans le futur, dépend de mes médicaments",
            "Ces médicaments me protègent de l'aggravation de ma maladie"
        };
        // Sous-échelle Inquiétudes (items 6-10)
        String[] inquietudes = {
            "Devoir prendre des médicaments m'inquiète",
            "J'ai parfois des inquiétudes sur les effets à long terme de mes médicaments",
            "Mes médicaments sont un mystère pour moi",
            "Mes médicaments perturbent ma vie",
            "Je m'inquiète de devenir trop dépendant(e) de mes médicaments"
        };
        for (int i = 0; i < necessite.length; i++) {
            items.add(likert5(t, necessite[i], "BMQ-N" + (i + 1), i + 1, "NECESSITE", null, null));
        }
        for (int i = 0; i < inquietudes.length; i++) {
            items.add(likert5(t, inquietudes[i], "BMQ-I" + (i + 1), i + 6, "INQUIETUDES", null, AlerteNiveau.WARNING));
        }
        save(t, items);
    }

    private void saveDt() {
        QuestionnaireTemplate t = core("DT",
            "Distress Thermometer",
            FrequenceType.PAR_VISITE, "2003", 1, "Gratuit — NCCN");

        List<QuestionItem> items = new ArrayList<>();
        // Item 1 : thermomètre VAS 0-10
        items.add(vas(t,
            "Sur les 7 derniers jours, quel est votre niveau de détresse global ?",
            "Détresse globale", 1, "DETRESSE", 4.0, AlerteNiveau.WARNING));

        // Items YESNO — problèmes pratiques
        String[] pratiques = {"Garde d'enfants", "Logement", "Assurance", "Travail/Études", "Transport"};
        int ord = 2;
        for (String p : pratiques) {
            items.add(item(t, p, p, QuestionType.YESNO, ord++, "PRATIQUE", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));
        }
        // Problèmes familiaux
        String[] famille = {"Relations avec les enfants", "Relations avec le/la partenaire", "Fertilité"};
        for (String f : famille) {
            items.add(item(t, f, f, QuestionType.YESNO, ord++, "FAMILLE", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));
        }
        // Problèmes émotionnels
        String[] emotionnel = {"Dépression", "Peurs", "Nervosité", "Tristesse", "Inquiétudes", "Perte d'intérêt"};
        for (String e : emotionnel) {
            items.add(item(t, e, e, QuestionType.YESNO, ord++, "EMOTIONNEL", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));
        }
        // Préoccupations spirituelles
        items.add(item(t, "Préoccupations spirituelles/religieuses", "Spirituel", QuestionType.YESNO, ord++,
                       "SPIRITUEL", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));
        // Problèmes physiques
        String[] physique = {
            "Apparence", "Bain/habillage", "Respiration", "Changements urinaires", "Constipation",
            "Diarrhée", "Alimentation", "Fatigue", "Gonflement", "Fièvre",
            "Se déplacer", "Digestion", "Mémoire/Concentration", "Aphtes buccaux", "Nausées",
            "Nez bouché/sec", "Douleur", "Sexualité", "Peau sèche/irritée", "Sommeil",
            "Fourmillements mains/pieds", "Prise/perte de poids"
        };
        for (String p : physique) {
            items.add(item(t, p, p, QuestionType.YESNO, ord++, "PHYSIQUE", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));
        }
        // Autres préoccupations
        items.add(item(t, "Autres problèmes", "Autres", QuestionType.YESNO, ord++, "AUTRE", null, null, null, false, "Non", "Oui", (ItemAttributeType[]) null));

        save(t, items);
    }

    private void saveEq5d5l() {
        QuestionnaireTemplate t = core("EQ5D5L",
            "EQ-5D-5L — Qualité de vie générique",
            FrequenceType.MENSUEL, "2011", 2, "Autorisation EuroQol Research Foundation requise");
        List<QuestionItem> items = new ArrayList<>();
        record Dim(String texte, String court, String dom) {}
        List<Dim> dims = List.of(
            new Dim("Mobilité — difficultés à marcher", "Mobilité", "MOBILITE"),
            new Dim("Soins personnels — difficultés à se laver ou s'habiller", "Soins perso", "SOINS"),
            new Dim("Activités courantes — difficultés avec travail, études, tâches ménagères", "Activités", "ACTIVITES"),
            new Dim("Douleur/Gêne — niveau de douleur ou gêne", "Douleur", "DOULEUR"),
            new Dim("Anxiété/Dépression — niveau d'anxiété ou dépression", "Anxiété/Dépression", "EMOTIONNEL")
        );
        for (int i = 0; i < dims.size(); i++) {
            items.add(likert5(t, dims.get(i).texte(), dims.get(i).court(), i + 1, dims.get(i).dom(), null, null));
        }
        // EVA : état de santé général 0-100
        items.add(item(t,
            "Sur cette échelle, indiquez votre état de santé général aujourd'hui (0 = le pire, 100 = le meilleur)",
            "EVA santé", QuestionType.VAS_0_10, 6, "GLOBAL",
            null, null, null, false, "Le pire état de santé imaginable", "Le meilleur état de santé imaginable",
            (ItemAttributeType[]) null));
        save(t, items);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── CANCER ──────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void saveEortcC30(Disease cancer) {
        QuestionnaireTemplate t = specific("EORTC_C30",
            "EORTC QLQ-C30 — Quality of Life Questionnaire Core 30",
            FrequenceType.PAR_CYCLE, "3.0", 12,
            "Autorisation EORTC requise — eortc.org", cancer);
        List<QuestionItem> items = new ArrayList<>();

        // Items 1-28 : LIKERT_4 [1-4]
        record I(String txt, String court, String dom) {}
        List<I> defs = List.of(
            // Physique 1-5
            new I("Avez-vous des difficultés à faire des efforts physiques importants ?", "Efforts importants", "PHYSIQUE"),
            new I("Avez-vous des difficultés à faire une longue promenade ?", "Longue promenade", "PHYSIQUE"),
            new I("Avez-vous des difficultés à faire une courte promenade hors de chez vous ?", "Courte promenade", "PHYSIQUE"),
            new I("Êtes-vous obligé(e) de rester au lit ou dans un fauteuil pendant la journée ?", "Alité/fauteuil", "PHYSIQUE"),
            new I("Avez-vous besoin d'aide pour manger, vous habiller, faire votre toilette ou aller aux toilettes ?", "Aide quotidienne", "PHYSIQUE"),
            // Rôle 6-7
            new I("Avez-vous été limité(e) dans vos activités professionnelles ou dans vos tâches quotidiennes ?", "Activités professionnelles", "ROLE"),
            new I("Avez-vous été limité(e) dans vos loisirs ou autres activités de détente ?", "Loisirs", "ROLE"),
            // Dyspnée 8
            new I("Avez-vous été essoufflé(e) ?", "Essoufflement", "DYSPNEE"),
            // Douleur 9
            new I("Avez-vous eu des douleurs ?", "Douleur", "DOULEUR"),
            // Fatigue 10
            new I("Avez-vous eu besoin de repos ?", "Besoin de repos", "FATIGUE"),
            // Insomnie 11
            new I("Avez-vous eu des difficultés à dormir ?", "Sommeil", "INSOMNIE"),
            // Fatigue 12
            new I("Vous êtes-vous senti(e) faible ?", "Faiblesse", "FATIGUE"),
            // Appétit 13
            new I("Avez-vous manqué d'appétit ?", "Appétit", "APPETIT"),
            // Nausées 14
            new I("Avez-vous eu des nausées ?", "Nausées", "NAUSEES"),
            // Nausées 15
            new I("Avez-vous vomi ?", "Vomissements", "NAUSEES"),
            // Constipation 16
            new I("Avez-vous été constipé(e) ?", "Constipation", "CONSTIPATION"),
            // Diarrhée 17
            new I("Avez-vous eu de la diarrhée ?", "Diarrhée", "DIARRHEE"),
            // Fatigue 18
            new I("Étiez-vous fatigué(e) ?", "Fatigue", "FATIGUE"),
            // Douleur 19
            new I("La douleur vous a-t-elle gêné(e) dans vos activités quotidiennes ?", "Gêne douleur", "DOULEUR"),
            // Cognitif 20
            new I("Avez-vous eu des difficultés à vous concentrer sur des choses comme lire le journal ou regarder la télévision ?", "Concentration", "COGNITIF"),
            // Émotionnel 21-24
            new I("Vous êtes-vous senti(e) tendu(e) ?", "Tension", "EMOTIONNEL"),
            new I("Vous êtes-vous fait du souci ?", "Souci", "EMOTIONNEL"),
            new I("Vous êtes-vous senti(e) irritable ?", "Irritabilité", "EMOTIONNEL"),
            new I("Vous êtes-vous senti(e) déprimé(e) ?", "Dépression", "EMOTIONNEL"),
            // Cognitif 25
            new I("Avez-vous eu des difficultés à vous souvenir de certaines choses ?", "Mémoire", "COGNITIF"),
            // Social 26-27
            new I("Votre état physique ou votre traitement médical ont-ils perturbé votre vie familiale ?", "Vie familiale", "SOCIAL"),
            new I("Votre état physique ou votre traitement médical ont-ils perturbé vos activités sociales ?", "Vie sociale", "SOCIAL"),
            // Finances 28
            new I("Votre état physique ou votre traitement médical vous ont-ils causé des difficultés financières ?", "Difficultés financières", "FINANCES")
        );

        // Domaines fonctionnels : score<50 WARNING ; domaines symptômes : score>40 WARNING
        for (int i = 0; i < defs.size(); i++) {
            String dom = defs.get(i).dom();
            boolean fonctionnel = List.of("PHYSIQUE", "ROLE", "EMOTIONNEL", "COGNITIF", "SOCIAL").contains(dom);
            QuestionItem qi = item(t, defs.get(i).txt(), defs.get(i).court(),
                                   QuestionType.LIKERT_4, i + 1, dom,
                                   fonctionnel ? null : 40.0,
                                   fonctionnel ? 50.0 : null,
                                   AlerteNiveau.WARNING,
                                   false, "Pas du tout", "Énormément", (ItemAttributeType[]) null);
            items.add(qi);
        }

        // Items 29-30 : QDV globale — LIKERT_4 [1-7]
        items.add(item(t, "Comment évalueriez-vous votre santé globale au cours de la semaine passée ?",
                       "Santé globale", QuestionType.LIKERT_4, 29, "QDV_GLOBALE",
                       null, 4.0, AlerteNiveau.WARNING,
                       false, "Très mauvaise", "Excellente", (ItemAttributeType[]) null));
        items.add(item(t, "Comment évalueriez-vous votre qualité de vie globale au cours de la semaine passée ?",
                       "QDV globale", QuestionType.LIKERT_4, 30, "QDV_GLOBALE",
                       null, 4.0, AlerteNiveau.WARNING,
                       false, "Très mauvaise", "Excellente", (ItemAttributeType[]) null));

        save(t, items);
    }

    private void saveProCtcaeChimio(Disease cancer) {
        QuestionnaireTemplate t = specific("PRO_CTCAE_CHIMIO",
            "PRO-CTCAE Chimiothérapie — Symptômes rapportés par le patient",
            FrequenceType.PAR_CYCLE, "1.0", 5, "Gratuit — NCI", cancer);
        List<QuestionItem> items = new ArrayList<>();
        String[] symptomes = {
            "Nausées", "Vomissements", "Fatigue", "Mucite buccale", "Diarrhée",
            "Neuropathie périphérique", "Alopécie", "Constipation", "Perte d'appétit"
        };
        for (int i = 0; i < symptomes.length; i++) {
            boolean hasInterf = !List.of("Alopécie", "Constipation").contains(symptomes[i]);
            // Fréquence
            items.add(item(t, symptomes[i] + " — fréquence", symptomes[i] + " fréq",
                           QuestionType.LIKERT_5, i * 3 + 1, symptomes[i].toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false,
                           "Jamais", "Presque constamment", ItemAttributeType.FREQUENCE));
            // Sévérité
            items.add(item(t, symptomes[i] + " — sévérité", symptomes[i] + " sév",
                           QuestionType.LIKERT_5, i * 3 + 2, symptomes[i].toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false,
                           "Légère", "Très sévère", ItemAttributeType.SEVERITE));
            // Interférence (si applicable)
            if (hasInterf) {
                items.add(item(t, symptomes[i] + " — interférence avec les activités", symptomes[i] + " interf",
                               QuestionType.LIKERT_5, i * 3 + 3, symptomes[i].toUpperCase().replace(" ", "_"),
                               3.0, null, AlerteNiveau.WARNING, false,
                               "Pas du tout", "Enormément", ItemAttributeType.INTERFERENCE));
            }
        }
        save(t, items);
    }

    private void saveProCtcaeImmuno(Disease cancer) {
        QuestionnaireTemplate t = specific("PRO_CTCAE_IMMUNO",
            "PRO-CTCAE Immunothérapie — Symptômes rapportés par le patient",
            FrequenceType.PAR_CYCLE, "1.0", 5, "Gratuit — NCI", cancer);
        List<QuestionItem> items = new ArrayList<>();
        String[] symptomes = {
            "Fatigue", "Diarrhée", "Éruption cutanée", "Prurit",
            "Essoufflement", "Arthralgie", "Douleur abdominale"
        };
        int ord = 1;
        for (String s : symptomes) {
            items.add(item(t, s + " — fréquence", s + " fréq", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Jamais", "Presque constamment", ItemAttributeType.FREQUENCE));
            items.add(item(t, s + " — sévérité", s + " sév", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Légère", "Très sévère", ItemAttributeType.SEVERITE));
            items.add(item(t, s + " — interférence", s + " interf", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Pas du tout", "Enormément", ItemAttributeType.INTERFERENCE));
        }
        save(t, items);
    }

    private void saveProCtcaeCible(Disease cancer) {
        QuestionnaireTemplate t = specific("PRO_CTCAE_CIBLE",
            "PRO-CTCAE Thérapies Ciblées — Symptômes rapportés par le patient",
            FrequenceType.PAR_CYCLE, "1.0", 5, "Gratuit — NCI", cancer);
        List<QuestionItem> items = new ArrayList<>();
        String[] symptomes = {"Syndrome mains-pieds", "Éruption cutanée", "Diarrhée", "Fatigue", "Mucite buccale", "Hypertension"};
        int ord = 1;
        for (String s : symptomes) {
            items.add(item(t, s + " — fréquence", s + " fréq", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Jamais", "Presque constamment", ItemAttributeType.FREQUENCE));
            items.add(item(t, s + " — sévérité", s + " sév", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Légère", "Très sévère", ItemAttributeType.SEVERITE));
        }
        save(t, items);
    }

    private void saveProCtcaeHormono(Disease cancer) {
        QuestionnaireTemplate t = specific("PRO_CTCAE_HORMONO",
            "PRO-CTCAE Hormonothérapie — Symptômes rapportés par le patient",
            FrequenceType.PAR_CYCLE, "1.0", 5, "Gratuit — NCI", cancer);
        List<QuestionItem> items = new ArrayList<>();
        String[] symptomes = {"Bouffées de chaleur", "Fatigue", "Arthralgies/Myalgies", "Insomnie", "Dépression", "Troubles sexuels"};
        int ord = 1;
        for (String s : symptomes) {
            items.add(item(t, s + " — fréquence", s + " fréq", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Jamais", "Presque constamment", ItemAttributeType.FREQUENCE));
            items.add(item(t, s + " — sévérité", s + " sév", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Légère", "Très sévère", ItemAttributeType.SEVERITE));
            items.add(item(t, s + " — interférence", s + " interf", QuestionType.LIKERT_5, ord++, s.toUpperCase().replace(" ", "_"),
                           3.0, null, AlerteNiveau.WARNING, false, "Pas du tout", "Enormément", ItemAttributeType.INTERFERENCE));
        }
        save(t, items);
    }

    private void saveHads(Disease cancer) {
        QuestionnaireTemplate t = specific("HADS",
            "Hospital Anxiety and Depression Scale",
            FrequenceType.MENSUEL, "1983", 5, "Licence requise — GL Assessment", cancer);
        List<QuestionItem> items = new ArrayList<>();
        // 7 items Anxiété (A) + 7 items Dépression (D) — alternés
        String[][] anxiete = {
            {"Je me sens tendu(e) ou énervé(e)", "Tension anxiété"},
            {"J'ai une sensation de peur comme si quelque chose d'horrible allait m'arriver", "Peur imminente"},
            {"Les pensées qui m'envahissent sont comme des cauchemars", "Pensées cauchemar"},
            {"Je peux rester tranquillement assis(e) et me sentir détendu(e)", "Détente (inv)"},
            {"J'ai parfois une sensation de panique", "Panique"},
            {"Je ne peux pas m'arrêter de penser à des choses qui m'inquiètent", "Inquiétudes intrusives"},
            {"Je me sens nerveux(se) et agité(e) intérieurement", "Agitation intérieure"}
        };
        String[][] depression = {
            {"Je prends encore plaisir aux choses qui me plaisaient auparavant", "Plaisir (inv)"},
            {"Je ris facilement et vois le bon côté des choses", "Humour (inv)"},
            {"Je me sens de bonne humeur", "Bonne humeur (inv)"},
            {"J'ai l'impression de fonctionner au ralenti", "Ralentissement"},
            {"J'ai perdu de l'intérêt pour mon apparence", "Négligence apparence"},
            {"Je me réjouis à l'avance quand je pense à des événements agréables", "Anticipation positive (inv)"},
            {"Je peux apprécier un bon roman ou émission de radio/TV", "Plaisirs quotidiens (inv)"}
        };
        // Alternance A/D selon ordre original HADS
        for (int i = 0; i < 7; i++) {
            items.add(likert4(t, anxiete[i][0], anxiete[i][1], i * 2 + 1, "ANXIETE", 8.0 / 7, AlerteNiveau.WARNING));
            items.add(likert4(t, depression[i][0], depression[i][1], i * 2 + 2, "DEPRESSION", 8.0 / 7, AlerteNiveau.WARNING));
        }
        save(t, items);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── SEP ─────────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void saveMsis29(Disease sep) {
        QuestionnaireTemplate t = specific("MSIS29",
            "Multiple Sclerosis Impact Scale — 29 items",
            FrequenceType.MENSUEL, "2001", 8, "Gratuit", sep);
        List<QuestionItem> items = new ArrayList<>();
        String[] physique = {
            "Des limitations dans les activités à la maison",
            "Des difficultés à transporter des objets",
            "Des problèmes d'équilibre",
            "Des problèmes de mobilité en intérieur",
            "Être moins mobile en extérieur",
            "Devoir vous déplacer différemment",
            "Des difficultés avec vos bras ou mains",
            "Des problèmes pour utiliser vos bras ou mains",
            "Avoir des spasmes dans vos membres",
            "Des tensions musculaires",
            "Vous sentir physiquement mal à l'aise",
            "Des problèmes de vision",
            "De la fatigue",
            "Des problèmes à rester debout longtemps",
            "Des difficultés à contrôler votre corps",
            "Devoir compter sur les autres pour vous aider",
            "Être limité(e) dans vos loisirs",
            "Des difficultés à vous déplacer en dehors de chez vous",
            "De la douleur",
            "Des problèmes de déglutition"
        };
        String[] psych = {
            "Des inquiétudes concernant votre SEP",
            "De l'anxiété concernant votre SEP",
            "De la dépression concernant votre SEP",
            "Des peurs concernant votre SEP",
            "Des sentiments de colère à propos de votre SEP",
            "Sentiment d'être isolé(e) par votre SEP",
            "La nécessité de vous cacher de votre SEP",
            "Des difficultés pour accepter votre SEP",
            "Un manque de confiance en vous"
        };
        for (int i = 0; i < physique.length; i++) {
            items.add(item(t, physique[i], "MSIS29-P" + (i + 1), QuestionType.LIKERT_4, i + 1,
                           "PHYSIQUE", 50.0, null, AlerteNiveau.WARNING, false,
                           "Pas du tout", "Extrêmement", (ItemAttributeType[]) null));
        }
        for (int i = 0; i < psych.length; i++) {
            items.add(item(t, psych[i], "MSIS29-PS" + (i + 1), QuestionType.LIKERT_4, i + 21,
                           "PSYCH", 40.0, null, AlerteNiveau.WARNING, false,
                           "Pas du tout", "Extrêmement", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveMsws12(Disease sep) {
        QuestionnaireTemplate t = specific("MSWS12",
            "Multiple Sclerosis Walking Scale — 12 items",
            FrequenceType.MENSUEL, "2003", 4, "Gratuit", sep);
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Votre vitesse de marche",
            "La distance que vous pouvez parcourir",
            "Votre équilibre en marchant",
            "Votre effort physique lors de la marche",
            "Votre démarche",
            "Votre capacité à marcher sur des surfaces irrégulières",
            "Votre capacité à gravir des marches",
            "Votre capacité à marcher en dehors de chez vous",
            "Votre capacité à marcher dans des lieux publics",
            "Votre besoin de vous appuyer sur quelque chose lors de la marche",
            "Votre besoin d'utiliser un moyen d'aide à la marche",
            "Votre concentration pour marcher"
        };
        for (int i = 0; i < textes.length; i++) {
            items.add(item(t, "Au cours des 2 dernières semaines, dans quelle mesure votre SEP a-t-elle limité : " + textes[i],
                           "MSWS12-" + (i + 1), QuestionType.LIKERT_5, i + 1, "MARCHE",
                           40.0, null, AlerteNiveau.WARNING, false, "Pas du tout", "Extrêmement", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveMfis(Disease sep) {
        QuestionnaireTemplate t = specific("MFIS",
            "Modified Fatigue Impact Scale — 21 items",
            FrequenceType.MENSUEL, "1994", 8, "Gratuit — National MS Society", sep);
        List<QuestionItem> items = new ArrayList<>();
        // 9 items Physique, 10 items Cognitif, 2 items Psychosocial
        String[] physique = {
            "Je me suis sentie(e) moins capable physiquement",
            "J'ai eu des difficultés à faire de l'exercice physique",
            "Mes jambes ou bras se sont sentis lourds",
            "J'ai eu moins d'endurance physique",
            "Je me suis sentie(e) moins coordonné(e)",
            "J'ai dû planifier mes périodes de repos",
            "J'ai eu des difficultés à réaliser des tâches qui demandent de l'effort physique",
            "J'ai dû limiter mes activités physiques",
            "J'ai eu besoin de me reposer plus souvent"
        };
        String[] cognitif = {
            "J'ai eu du mal à me concentrer",
            "J'ai eu du mal à penser clairement",
            "J'ai eu du mal à organiser mes pensées",
            "J'ai eu du mal à terminer des tâches nécessitant de la réflexion",
            "J'ai eu du mal à me souvenir de choses",
            "J'ai eu du mal à prendre des décisions",
            "J'ai eu du mal à effectuer des tâches demandant de la concentration",
            "J'ai eu du mal à maintenir mon attention",
            "J'ai eu moins d'élan mental",
            "J'ai eu du mal à terminer des activités mentales"
        };
        String[] psycho = {
            "J'ai été moins motivé(e) pour faire des activités hors de chez moi",
            "J'ai été moins motivé(e) pour participer à des activités sociales"
        };
        int ord = 1;
        for (String s : physique) items.add(likert5(t, s, "MFIS-P" + ord, ord++, "PHYSIQUE", 38.0 / 21, AlerteNiveau.WARNING));
        for (String s : cognitif) items.add(likert5(t, s, "MFIS-C" + (ord - 9), ord++, "COGNITIF", 38.0 / 21, AlerteNiveau.WARNING));
        for (String s : psycho) items.add(likert5(t, s, "MFIS-PS" + (ord - 19), ord++, "PSYCHOSOCIAL", 38.0 / 21, AlerteNiveau.WARNING));
        save(t, items);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── INSUFFISANCE CARDIAQUE ───────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void saveKccq12(Disease hf) {
        QuestionnaireTemplate t = specific("KCCQ12",
            "Kansas City Cardiomyopathy Questionnaire — 12 items",
            FrequenceType.MENSUEL, "2020", 3, "Licence requise — CV Outcomes Inc.", hf);
        List<QuestionItem> items = new ArrayList<>();
        // Limitation physique (items 1a,1b,1c = 1-3)
        String[] physique = {"Activités intenses (course à pied, levée de charges lourdes)",
                             "Activités modérées (jardinage, aspiration, montée d'escaliers)",
                             "Activités légères (se déplacer en intérieur)"};
        for (int i = 0; i < physique.length; i++) {
            items.add(likert5(t, "Limitation dans : " + physique[i], "KPL-" + (i + 1), i + 1, "PHYSIQUE", null, null));
        }
        // Symptômes fréquence (items 2a,2b = 4-5)
        items.add(likert5(t, "Gonflements aux pieds/chevilles/jambes — fréquence", "KSF-1", 4, "SYMPTOMES", null, null));
        items.add(likert5(t, "Fatigue — fréquence", "KSF-2", 5, "SYMPTOMES", null, null));
        // Essoufflement — fréquence (item 2c = 6) + en position allongée (2d = 7)
        items.add(likert5(t, "Essoufflement — fréquence", "KSF-3", 6, "SYMPTOMES", null, null));
        items.add(likert5(t, "Essoufflement en position allongée (orthopnée) — fréquence", "KSF-4", 7, "SYMPTOMES", null, null));
        // Qualité de vie (items 3a,3b = 8-9)
        items.add(item(t, "Cela vous a-t-il dérangé(e) d'avoir ces symptômes cardiaques ?", "KQOL-1",
                       QuestionType.LIKERT_5, 8, "QOL", null, null, null, false, "Pas du tout", "Extrêmement", (ItemAttributeType[]) null));
        items.add(item(t, "Votre insuffisance cardiaque vous empêche-t-elle de vivre comme vous le souhaitez ?", "KQOL-2",
                       QuestionType.LIKERT_5, 9, "QOL", null, null, null, false, "Pas du tout", "Extrêmement", (ItemAttributeType[]) null));
        // Statut social (items 4a,4b,4c = 10-12)
        String[] social = {"Vos loisirs", "Vos activités avec famille ou amis", "Votre travail ou autres activités"};
        for (int i = 0; i < social.length; i++) {
            items.add(likert5(t, "Impact sur : " + social[i], "KSL-" + (i + 1), i + 10, "SOCIAL", null, null));
        }
        save(t, items);
    }

    private void saveMlhfq(Disease hf) {
        QuestionnaireTemplate t = specific("MLHFQ",
            "Minnesota Living with Heart Failure Questionnaire — 21 items",
            FrequenceType.MENSUEL, "1987", 5, "Gratuit — University of Minnesota", hf);
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Gonflements aux chevilles, jambes ou abdomen",
            "Vous obliger à vous asseoir ou coucher pour vous reposer pendant la journée",
            "Difficultés à marcher ou monter les escaliers",
            "Difficultés à faire les tâches ménagères",
            "Difficultés à sortir de chez vous",
            "Difficultés à dormir la nuit",
            "Difficultés à vos relations avec vos proches",
            "Difficultés à travailler pour gagner votre vie",
            "Difficultés à vos loisirs ou sports",
            "Difficultés à vos activités sexuelles",
            "Vous faire manger moins des aliments que vous aimez",
            "Essoufflement",
            "Fatigue, manque d'énergie ou lourdeur",
            "Besoin de rester à l'hôpital",
            "Coûts médicaux",
            "Effets indésirables des médicaments",
            "Vous donner le sentiment d'être à la charge des autres",
            "Vous donner le sentiment d'une perte de maîtrise de votre vie",
            "Vous inquiéter",
            "Difficultés à vous concentrer ou à vous souvenir",
            "Vous déprimer"
        };
        for (int i = 0; i < textes.length; i++) {
            boolean physique = i < 13;
            items.add(item(t,
                "Au mois passé, votre insuffisance cardiaque vous a-t-elle empêché(e) de vivre comme vous le désiriez en causant : " + textes[i],
                "MLHFQ-" + (i + 1), QuestionType.LIKERT_6, i + 1,
                physique ? "PHYSIQUE" : "EMOTIONNEL",
                45.0, null, AlerteNiveau.WARNING, false, "Non", "Enormément", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── DIABÈTE ─────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void savePaid5(Disease diabetes) {
        QuestionnaireTemplate t = specific("PAID5",
            "Problem Areas In Diabetes Scale — 5 items",
            FrequenceType.HEBDO, "2008", 1, "Gratuit", diabetes);
        List<QuestionItem> items = new ArrayList<>();
        // Items 3,6,12,16,19 du PAID-20
        String[] textes = {
            "Ne pas avoir d'objectifs clairs concernant vos soins du diabète",
            "Se sentir découragé(e) à propos de votre diabète",
            "Se sentir épuisé(e) par l'effort constant requis pour gérer votre diabète",
            "Se sentir seul(e) avec votre diabète",
            "Se sentir en colère quand vous pensez à la vie avec le diabète"
        };
        for (int i = 0; i < textes.length; i++) {
            items.add(likert5(t, textes[i], "PAID5-" + (i + 1), i + 1, "DETRESSE_DIABETE", 8.0 / 5, AlerteNiveau.WARNING));
        }
        save(t, items);
    }

    private void savePaid20(Disease diabetes) {
        QuestionnaireTemplate t = specific("PAID20",
            "Problem Areas In Diabetes Scale — 20 items",
            FrequenceType.MENSUEL, "1995", 5, "Gratuit", diabetes);
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Ne pas avoir d'objectifs clairs concernant vos soins",
            "Se sentir découragé(e) par votre régime alimentaire",
            "Ne pas avoir d'objectifs clairs",
            "Se sentir effrayé(e) par l'hypoglycémie",
            "Se sentir contrarié(e) à cause des irrégularités alimentaires",
            "Se sentir déprimé(e) à propos de votre vie avec le diabète",
            "Ne pas savoir si votre humeur ou vos sentiments sont liés au diabète",
            "Se sentir dépassé(e) par votre régime diabétique",
            "Se sentir préoccupé(e) par l'hypoglycémie",
            "Se sentir en colère à propos de votre diabète",
            "Se sentir constamment préoccupé(e) par les aliments et les repas",
            "Se sentir inquiet(e) au sujet du futur et des complications possibles",
            "Sentiments de culpabilité ou d'anxiété quand vous déviez de votre régime",
            "Ne pas accepter votre diabète",
            "Se sentir insatisfait(e) de votre médecin diabétologue",
            "Se sentir épuisé(e) par l'effort constant requis",
            "Se sentir seul(e) avec votre diabète",
            "Se sentir comme si votre diabète prenait trop de place mentale",
            "Se sentir inquiet(e) que vous n'atteignez pas vos objectifs",
            "Se sentir en colère à propos du diabète en général"
        };
        for (int i = 0; i < textes.length; i++) {
            items.add(likert5(t, textes[i], "PAID20-" + (i + 1), i + 1, "DETRESSE_DIABETE",
                              33.0 / 20, AlerteNiveau.WARNING));
        }
        save(t, items);
    }

    private void saveDds17(Disease diabetes) {
        QuestionnaireTemplate t = specific("DDS17",
            "Diabetes Distress Scale — 17 items",
            FrequenceType.MENSUEL, "2005", 5, "Gratuit — William Polonsky", diabetes);
        List<QuestionItem> items = new ArrayList<>();
        String[][] sousEchelles = {
            // Régime
            {"Ne pas manger correctement la plupart du temps",
             "Ne pas surveiller suffisamment mon alimentation",
             "Ne pas manger les bonnes quantités aux bons moments",
             "Ne pas suivre mon plan alimentaire correctement"},
            // Émotionnel
            {"Me sentir submergé(e) par les exigences de vie avec le diabète",
             "Me sentir découragé(e) face aux traitements",
             "Me sentir épuisé(e) et accablé(e) par le diabète",
             "Me sentir seul(e) avec le diabète",
             "Me sentir en colère contre le diabète"},
            // Interpersonnel
            {"Me sentir non soutenu(e) par ma famille concernant mon diabète",
             "Me sentir que mes amis ou famille ne comprennent pas les difficultés du diabète",
             "Me sentir non soutenu(e) par des proches pour les efforts de gestion"},
            // Médecin
            {"Me sentir que mon médecin ne m'accorde pas assez de temps",
             "Me sentir que mon médecin ne connaît pas bien le diabète",
             "Me sentir que mon médecin ne prend pas mes inquiétudes au sérieux",
             "Me sentir insatisfait(e) de mes soins médicaux du diabète",
             "Me sentir que mon médecin ne comprend pas comment est ma vie avec le diabète"}
        };
        String[] domaines = {"REGIME", "EMOTIONNEL", "INTERPERSONNEL", "MEDECIN"};
        int ord = 1;
        for (int d = 0; d < sousEchelles.length; d++) {
            for (String txt : sousEchelles[d]) {
                items.add(item(t, txt, "DDS17-" + ord, QuestionType.LIKERT_6, ord, domaines[d],
                               3.0, null, AlerteNiveau.WARNING, false,
                               "Pas un problème", "Problème sérieux", (ItemAttributeType[]) null));
                ord++;
            }
        }
        save(t, items);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── IBD ─────────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    private void saveSibdq(Disease crohn, Disease uc) {
        QuestionnaireTemplate t = specific("SIBDQ",
            "Short Inflammatory Bowel Disease Questionnaire — 10 items",
            FrequenceType.MENSUEL, "1999", 3, "Gratuit", crohn, uc);
        List<QuestionItem> items = new ArrayList<>();
        String[] textes = {
            "Fatigue ou manque d'énergie",
            "Difficultés à faire vos activités habituelles à cause de vos selles",
            "Douleur abdominale ou crampes",
            "Problèmes ou difficultés liés à votre intestin lors d'activités de loisirs",
            "Difficultés à faire vos projets personnels à cause de votre maladie intestinale",
            "Rectorragies ou sang dans les selles",
            "Sentiment de dépression ou d'être abattu(e) à cause de votre maladie",
            "Sensation de gonflement abdominal",
            "Difficultés à sortir ou à faire des activités sociales à cause de votre maladie",
            "Inquiétudes concernant l'opération chirurgicale"
        };
        for (int i = 0; i < textes.length; i++) {
            items.add(item(t, textes[i], "SIBDQ-" + (i + 1), QuestionType.LIKERT_7, i + 1, "GLOBAL",
                           null, 40.0 / 10, AlerteNiveau.WARNING, false,
                           "Tout le temps", "Jamais", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveHbi(Disease crohn) {
        QuestionnaireTemplate t = specific("HBI",
            "Harvey-Bradshaw Index — Maladie de Crohn",
            FrequenceType.HEBDO, "1980", 2, "Gratuit", crohn);
        List<QuestionItem> items = new ArrayList<>();
        // Item 1 : bien-être général (0-4)
        items.add(item(t, "État général hier", "Bien-être général", QuestionType.LIKERT_5, 1, "GLOBAL",
                        5.0, null, AlerteNiveau.WARNING, false, "Très bien", "Très mauvais", (ItemAttributeType[]) null));
        // Item 2 : douleur abdominale (0-3)
        items.add(item(t, "Douleur abdominale hier", "Douleur abdominale", QuestionType.LIKERT_4, 2, "DOULEUR",
                        null, null, null, false, "Aucune", "Sévère", (ItemAttributeType[]) null));
        // Item 3 : nombre de selles liquides par jour (numérique → TEXT pour saisie)
        items.add(item(t, "Nombre de selles liquides hier", "Nb selles liquides", QuestionType.TEXT, 3, "SELLES",
                        null, null, null, false, null, null, (ItemAttributeType[]) null));
        // Item 4 : masse abdominale (0-3)
        items.add(item(t, "Masse abdominale palpable", "Masse abdominale", QuestionType.LIKERT_4, 4, "PHYSIQUE",
                        null, null, null, false, "Aucune", "Avec douleur", (ItemAttributeType[]) null));
        // Item 5 : complications (YESNO par complication)
        items.add(item(t, "Complications (arthralgie, uvéite, érythème noueux, aphtose buccale, pyoderma, fissure anale, fistule, abcès) — nombre", "Complications", QuestionType.TEXT, 5, "COMPLICATIONS",
                        null, null, null, false, null, null, (ItemAttributeType[]) null));
        save(t, items);
    }

    private void saveSccai(Disease uc) {
        QuestionnaireTemplate t = specific("SCCAI",
            "Simple Clinical Colitis Activity Index — Colite ulcéreuse",
            FrequenceType.HEBDO, "1998", 2, "Gratuit", uc);
        List<QuestionItem> items = new ArrayList<>();
        items.add(item(t, "Fréquence des selles (le jour)", "Selles/jour", QuestionType.LIKERT_4, 1, "SELLES",
                        3.0, null, AlerteNiveau.WARNING, false, "1-3/jour", "≥7/jour ou nocturne", (ItemAttributeType[]) null));
        items.add(item(t, "Fréquence des selles (la nuit)", "Selles/nuit", QuestionType.LIKERT_4, 2, "SELLES",
                        null, null, null, false, "Aucune", "2-3/nuit", (ItemAttributeType[]) null));
        items.add(item(t, "Urgence des selles", "Urgences", QuestionType.LIKERT_4, 3, "SELLES",
                        null, null, null, false, "Aucune", "Incontinence", (ItemAttributeType[]) null));
        items.add(item(t, "Sang dans les selles", "Rectorragies", QuestionType.LIKERT_4, 4, "SANG",
                        null, null, null, false, "Aucun", "Sang seul", (ItemAttributeType[]) null));
        items.add(item(t, "État général", "État général", QuestionType.LIKERT_5, 5, "GLOBAL",
                        null, null, null, false, "Très bien", "Très mauvais", (ItemAttributeType[]) null));
        items.add(item(t, "Manifestations extra-intestinales (arthrite, uvéite, pyoderma, aphtose)", "Manifestations extra-intest.", QuestionType.LIKERT_4, 6, "EXTRA_INTESTINAL",
                        null, null, null, false, "Aucune", "≥3 manifestations", (ItemAttributeType[]) null));
        save(t, items);
    }

    private void saveRapid3(Disease ra) {
        QuestionnaireTemplate t = specific("RAPID3",
            "Routine Assessment of Patient Index Data 3 — Polyarthrite rhumatoïde",
            FrequenceType.MENSUEL, "2009", 2, "Gratuit — Theodore Pincus", ra);
        List<QuestionItem> items = new ArrayList<>();
        // HAQ-DI abrégé (10 activités)
        String[] activites = {
            "Vous habiller, y compris lacer vos chaussures et boutonner vos vêtements",
            "Vous lever d'une chaise droite",
            "Manger, couper vos aliments",
            "Marcher à plat dehors",
            "Vous laver et sécher tout le corps",
            "Vous baisser pour ramasser un vêtement sur le sol",
            "Tourner un robinet",
            "Entrer et sortir d'une voiture",
            "Pousser et ouvrir une porte lourde",
            "Activités habituelles (travail, courses, jardinage)"
        };
        for (int i = 0; i < activites.length; i++) {
            items.add(item(t, activites[i], "RAPID3-" + (i + 1), QuestionType.LIKERT_4, i + 1, "CAPACITE_FONCTIONNELLE",
                           12.0 / 10, null, AlerteNiveau.WARNING, false,
                           "Sans aucune difficulté", "Incapable de le faire", (ItemAttributeType[]) null));
        }
        save(t, items);
    }

    private void saveHaqdiDisab(Disease ra) {
        QuestionnaireTemplate t = specific("HAQDIDISAB",
            "Health Assessment Questionnaire Disability Index — 20 items",
            FrequenceType.TRIMESTRIEL, "1980", 8, "Gratuit — Stanford University", ra);
        List<QuestionItem> items = new ArrayList<>();
        String[][] categories = {
            // S'habiller (2)
            {"Vous habiller seul(e), y compris lacer vos chaussures et boutonner vos vêtements ?", "Se lever d'une chaise basse ou du sol sans utiliser vos bras comme appui ?"},
            // Se lever (2)
            {"Vous lever d'un lit ?", "Vous lever d'un fauteuil bas ?"},
            // Manger (2)
            {"Couper votre viande ?", "Porter un verre ou une tasse plein(e) à votre bouche ?"},
            // Marcher (2)
            {"Marcher en extérieur sur un terrain plat ?", "Monter 5 marches d'escalier ?"},
            // Hygiène (2)
            {"Vous laver et sécher tout votre corps ?", "Prendre un bain ?"},
            // Atteindre (2)
            {"Atteindre et saisir un paquet de 5 kg sur une étagère au-dessus de votre tête ?", "Vous baisser pour ramasser des vêtements sur le sol ?"},
            // Saisir (2)
            {"Ouvrir des portes de voiture ?", "Ouvrir des bocaux préalablement ouverts ?"},
            // Activités (4)
            {"Faire des courses ?", "Entrer et sortir d'une voiture ?", "Faire des tâches ménagères légères ?", "Faire des tâches ménagères lourdes ?"}
        };
        String[] domaines = {"HABILLEMENT", "SE_LEVER", "MANGER", "MARCHE", "HYGIENE", "ATTEINDRE", "SAISIR", "ACTIVITES"};
        int ord = 1;
        for (int d = 0; d < categories.length; d++) {
            for (String txt : categories[d]) {
                items.add(item(t, txt, "HAQ-" + ord, QuestionType.LIKERT_4, ord, domaines[d],
                               1.5, null, AlerteNiveau.WARNING, false,
                               "Sans aucune difficulté", "Incapable de le faire", (ItemAttributeType[]) null));
                ord++;
            }
        }
        save(t, items);
    }
}

import { QuestionnaireTemplate } from '../../questionnaire/models/questionnaire-template.model';
import {
  DT, EQ5D5L, EORTC_C30, HADS,
  PRO_CTCAE_CHIMIO, PRO_CTCAE_IMMUNO, PRO_CTCAE_CIBLE, PRO_CTCAE_HORMONO,
  MSIS29, MSWS12, MFIS,
  KCCQ12, MLHFQ,
  PAID5, PAID20, DDS17,
  SIBDQ, HBI, SCCAI,
  RAPID3, HAQDIDISAB,
} from './mock-templates-extra';

// ---------------------------------------------------------------------------
// ESAS-r — Edmonton Symptom Assessment System Revised
// ---------------------------------------------------------------------------
const ESAS_R: QuestionnaireTemplate = {
  id: 'tpl-esas-r',
  code: 'ESAS_R',
  nom: 'ESAS-r — Évaluation des symptômes',
  description: 'Évaluation de 10 symptômes courants sur une échelle de 0 à 10.',
  scope: 'CORE',
  frequence: 'HEBDO',
  dureeEstimeeMinutes: 5,
  licenceInfo: 'ESAS-r © Bruera et al.',
  isDue: true,
  items: [
    {
      id: 'q_douleur', texte: 'Quelle est l\'intensité de votre douleur ?',
      texteCourt: 'Douleur', type: 'VAS_0_10', ordre: 1, attributes: ['douleur'],
      seuilAlerteMin: 7, alerteNiveau: 'CRITICAL',
      labelMin: 'Aucune douleur', labelMax: 'Douleur maximale',
    },
    {
      id: 'q_fatigue', texte: 'Quelle est l\'intensité de votre fatigue ?',
      texteCourt: 'Fatigue', type: 'VAS_0_10', ordre: 2, attributes: ['fatigue'],
      seuilAlerteMin: 8, alerteNiveau: 'WARNING',
      labelMin: 'Aucune fatigue', labelMax: 'Fatigue maximale',
    },
    {
      id: 'q_nausee', texte: 'Quelle est l\'intensité de votre nausée ?',
      texteCourt: 'Nausée', type: 'VAS_0_10', ordre: 3, attributes: ['nausee'],
      labelMin: 'Aucune nausée', labelMax: 'Nausée maximale',
    },
    {
      id: 'q_depression', texte: 'Quelle est l\'intensité de votre dépression ?',
      texteCourt: 'Dépression', type: 'VAS_0_10', ordre: 4, attributes: ['depression'],
      seuilAlerteMin: 7, alerteNiveau: 'WARNING',
      labelMin: 'Aucune dépression', labelMax: 'Dépression maximale',
    },
    {
      id: 'q_anxiete', texte: 'Quelle est l\'intensité de votre anxiété ?',
      texteCourt: 'Anxiété', type: 'VAS_0_10', ordre: 5, attributes: ['anxiete'],
      seuilAlerteMin: 7, alerteNiveau: 'WARNING',
      labelMin: 'Aucune anxiété', labelMax: 'Anxiété maximale',
    },
    {
      id: 'q_somnolence', texte: 'Quelle est l\'intensité de votre somnolence ?',
      texteCourt: 'Somnolence', type: 'VAS_0_10', ordre: 6, attributes: ['somnolence'],
      labelMin: 'Aucune somnolence', labelMax: 'Somnolence maximale',
    },
    {
      id: 'q_appetit', texte: 'Quelle est l\'intensité de votre manque d\'appétit ?',
      texteCourt: 'Appétit', type: 'VAS_0_10', ordre: 7, attributes: ['appetit'],
      labelMin: 'Bon appétit', labelMax: 'Aucun appétit',
    },
    {
      id: 'q_bien_etre', texte: 'Comment évaluez-vous votre bien-être général ?',
      texteCourt: 'Bien-être', type: 'VAS_0_10', ordre: 8, attributes: ['bien_etre'],
      isInverse: true, labelMin: 'Bien-être maximum', labelMax: 'Bien-être minimum',
    },
    {
      id: 'q_dyspnee', texte: 'Quelle est l\'intensité de votre essoufflement ?',
      texteCourt: 'Dyspnée', type: 'VAS_0_10', ordre: 9, attributes: ['dyspnee'],
      seuilAlerteMin: 7, alerteNiveau: 'CRITICAL',
      labelMin: 'Aucun essoufflement', labelMax: 'Essoufflement maximal',
    },
    {
      id: 'q_autre', texte: 'Autres symptômes — notez l\'intensité si applicable',
      texteCourt: 'Autre symptôme', type: 'VAS_0_10', ordre: 10, attributes: ['autre'],
      labelMin: 'Aucun symptôme', labelMax: 'Symptôme maximal',
    },
  ],
};

// ---------------------------------------------------------------------------
// PHQ-9 — Patient Health Questionnaire
// ---------------------------------------------------------------------------
const PHQ9: QuestionnaireTemplate = {
  id: 'tpl-phq9',
  code: 'PHQ9',
  nom: 'PHQ-9 — Dépistage dépression',
  description: 'Questionnaire de dépistage de la dépression en 9 items (sur les 2 dernières semaines).',
  scope: 'DISEASE_SPECIFIC',
  frequence: 'MENSUEL',
  dureeEstimeeMinutes: 5,
  licenceInfo: 'PHQ-9 © Pfizer Inc.',
  isDue: true,
  items: [
    {
      id: 'q1', texte: 'Peu d\'intérêt ou de plaisir à faire les choses',
      texteCourt: 'Intérêt / Plaisir', type: 'LIKERT_4', ordre: 1, attributes: ['anhedonie'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q2', texte: 'Se sentir déprimé(e), sans espoir ou désespéré(e)',
      texteCourt: 'Humeur dépressive', type: 'LIKERT_4', ordre: 2, attributes: ['depression'],
      seuilAlerteMin: 2, alerteNiveau: 'WARNING',
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q3', texte: 'Difficultés à s\'endormir, à rester endormi(e), ou dormir trop',
      texteCourt: 'Sommeil', type: 'LIKERT_4', ordre: 3, attributes: ['sommeil'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q4', texte: 'Se sentir fatigué(e) ou avoir peu d\'énergie',
      texteCourt: 'Fatigue / Énergie', type: 'LIKERT_4', ordre: 4, attributes: ['fatigue'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q5', texte: 'Manque d\'appétit ou manger trop',
      texteCourt: 'Appétit', type: 'LIKERT_4', ordre: 5, attributes: ['appetit'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q6', texte: 'Vous sentir coupable ou nul(le), vous dévaloriser ou décevoir votre entourage',
      texteCourt: 'Culpabilité', type: 'LIKERT_4', ordre: 6, attributes: ['culpabilite'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q7', texte: 'Avoir du mal à vous concentrer (lire, regarder la télévision…)',
      texteCourt: 'Concentration', type: 'LIKERT_4', ordre: 7, attributes: ['concentration'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q8', texte: 'Parler ou bouger si lentement que les autres auraient pu le remarquer, ou à l\'inverse être si agité(e) que vous avez eu du mal à tenir en place',
      texteCourt: 'Psychomoteur', type: 'LIKERT_4', ordre: 8, attributes: ['psychomoteur'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'q9', texte: 'Penser qu\'il vaudrait mieux mourir ou envisager de vous faire du mal d\'une façon ou d\'une autre',
      texteCourt: 'Idées suicidaires', type: 'LIKERT_4', ordre: 9, attributes: ['suicidaire'],
      seuilAlerteMin: 1, alerteNiveau: 'CRITICAL',
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
  ],
};

// ---------------------------------------------------------------------------
// BMQ — Beliefs about Medicines Questionnaire (Spécifique)
// ---------------------------------------------------------------------------
const BMQ_SPECIFIQUE: QuestionnaireTemplate = {
  id: 'tpl-bmq',
  code: 'BMQ_SPECIFIQUE',
  nom: 'BMQ — Croyances sur les médicaments',
  description: 'Évalue les croyances du patient sur la nécessité et les préoccupations liées aux médicaments prescrits.',
  scope: 'DISEASE_SPECIFIC',
  frequence: 'TRIMESTRIEL',
  dureeEstimeeMinutes: 8,
  licenceInfo: 'BMQ © Horne, Weinman & Hankins.',
  isDue: true,
  items: [
    {
      id: 'bmq1', texte: 'Mes médicaments actuels me permettent de contrôler ma maladie',
      texteCourt: 'Contrôle', type: 'LIKERT_5', ordre: 1, attributes: ['necessite'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq2', texte: 'Mes médicaments actuels me protègent d\'une aggravation de ma maladie',
      texteCourt: 'Protection', type: 'LIKERT_5', ordre: 2, attributes: ['necessite'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq3', texte: 'Ma santé dépend actuellement de mes médicaments',
      texteCourt: 'Dépendance santé', type: 'LIKERT_5', ordre: 3, attributes: ['necessite'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq4', texte: 'Ma vie serait impossible sans mes médicaments actuels',
      texteCourt: 'Indispensable', type: 'LIKERT_5', ordre: 4, attributes: ['necessite'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq5', texte: 'Je m\'inquiète d\'être devenu(e) trop dépendant(e) de mes médicaments',
      texteCourt: 'Dépendance', type: 'LIKERT_5', ordre: 5, attributes: ['preoccupation'],
      seuilAlerteMin: 4, alerteNiveau: 'WARNING',
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq6', texte: 'Je m\'inquiète des effets à long terme de mes médicaments',
      texteCourt: 'Effets long terme', type: 'LIKERT_5', ordre: 6, attributes: ['preoccupation'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq7', texte: 'Mes médicaments sont un mystère pour moi',
      texteCourt: 'Compréhension', type: 'LIKERT_5', ordre: 7, attributes: ['preoccupation'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
    {
      id: 'bmq8', texte: 'Prendre mes médicaments perturbe ma vie quotidienne',
      texteCourt: 'Perturbation', type: 'LIKERT_5', ordre: 8, attributes: ['preoccupation'],
      labelMin: 'Pas du tout d\'accord', labelMax: 'Tout à fait d\'accord',
    },
  ],
};

// ---------------------------------------------------------------------------
// MARS-5 — Medication Adherence Report Scale
// ---------------------------------------------------------------------------
const MARS5: QuestionnaireTemplate = {
  id: 'tpl-mars5',
  code: 'MARS5',
  nom: 'MARS-5 — Observance médicamenteuse',
  description: 'Évalue l\'observance du traitement médicamenteux en 5 questions.',
  scope: 'DISEASE_SPECIFIC',
  frequence: 'MENSUEL',
  dureeEstimeeMinutes: 3,
  licenceInfo: 'MARS © Home et al.',
  isDue: true,
  items: [
    {
      id: 'mars1', texte: 'J\'oublie de prendre mes médicaments',
      texteCourt: 'Oubli', type: 'LIKERT_5', ordre: 1, attributes: ['observance'],
      labelMin: 'Jamais', labelMax: 'Toujours',
    },
    {
      id: 'mars2', texte: 'Je modifie la dose de mes médicaments',
      texteCourt: 'Modification dose', type: 'LIKERT_5', ordre: 2, attributes: ['observance'],
      labelMin: 'Jamais', labelMax: 'Toujours',
    },
    {
      id: 'mars3', texte: 'J\'arrête de prendre mes médicaments pendant un certain temps',
      texteCourt: 'Arrêt temporaire', type: 'LIKERT_5', ordre: 3, attributes: ['observance'],
      labelMin: 'Jamais', labelMax: 'Toujours',
    },
    {
      id: 'mars4', texte: 'Je décide de ne pas prendre une dose de mes médicaments',
      texteCourt: 'Saut de dose', type: 'LIKERT_5', ordre: 4, attributes: ['observance'],
      seuilAlerteMin: 4, alerteNiveau: 'WARNING',
      labelMin: 'Jamais', labelMax: 'Toujours',
    },
    {
      id: 'mars5', texte: 'Je prends moins de médicaments que ce qui m\'a été prescrit',
      texteCourt: 'Sous-dosage', type: 'LIKERT_5', ordre: 5, attributes: ['observance'],
      labelMin: 'Jamais', labelMax: 'Toujours',
    },
  ],
};

// ---------------------------------------------------------------------------
// GAD-7 — Generalized Anxiety Disorder
// ---------------------------------------------------------------------------
const GAD7: QuestionnaireTemplate = {
  id: 'tpl-gad7',
  code: 'GAD7',
  nom: 'GAD-7 — Anxiété généralisée',
  description: 'Dépistage et mesure de la sévérité du trouble anxieux généralisé.',
  scope: 'DISEASE_SPECIFIC',
  frequence: 'MENSUEL',
  dureeEstimeeMinutes: 4,
  licenceInfo: 'GAD-7 © Pfizer Inc.',
  isDue: true,
  items: [
    {
      id: 'gad1', texte: 'Me sentir nerveux(se), anxieux(se) ou à bout',
      texteCourt: 'Nervosité', type: 'LIKERT_4', ordre: 1, attributes: ['anxiete'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad2', texte: 'Ne pas être capable d\'arrêter de m\'inquiéter ou de contrôler mes inquiétudes',
      texteCourt: 'Inquiétudes', type: 'LIKERT_4', ordre: 2, attributes: ['anxiete'],
      seuilAlerteMin: 2, alerteNiveau: 'WARNING',
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad3', texte: 'M\'inquiéter trop à propos de différentes choses',
      texteCourt: 'Préoccupations', type: 'LIKERT_4', ordre: 3, attributes: ['anxiete'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad4', texte: 'Avoir du mal à me détendre',
      texteCourt: 'Détente', type: 'LIKERT_4', ordre: 4, attributes: ['anxiete'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad5', texte: 'Être tellement agité(e) qu\'il m\'est difficile de rester en place',
      texteCourt: 'Agitation', type: 'LIKERT_4', ordre: 5, attributes: ['anxiete'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad6', texte: 'Devenir facilement contrarié(e) ou irritable',
      texteCourt: 'Irritabilité', type: 'LIKERT_4', ordre: 6, attributes: ['anxiete'],
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
    {
      id: 'gad7', texte: 'Avoir peur que quelque chose de terrible puisse se produire',
      texteCourt: 'Peur', type: 'LIKERT_4', ordre: 7, attributes: ['anxiete'],
      seuilAlerteMin: 2, alerteNiveau: 'CRITICAL',
      labelMin: 'Pas du tout', labelMax: 'Presque tous les jours',
    },
  ],
};

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------
export const MOCK_TEMPLATES: QuestionnaireTemplate[] = [
  ESAS_R, PHQ9, BMQ_SPECIFIQUE, MARS5, GAD7,
  DT, EQ5D5L, EORTC_C30, HADS,
  PRO_CTCAE_CHIMIO, PRO_CTCAE_IMMUNO, PRO_CTCAE_CIBLE, PRO_CTCAE_HORMONO,
  MSIS29, MSWS12, MFIS,
  KCCQ12, MLHFQ,
  PAID5, PAID20, DDS17,
  SIBDQ, HBI, SCCAI,
  RAPID3, HAQDIDISAB,
];

export const MOCK_TEMPLATE_MAP: Record<string, QuestionnaireTemplate> = {
  ESAS_R, PHQ9, BMQ_SPECIFIQUE, MARS5, GAD7,
  DT, EQ5D5L, EORTC_C30, HADS,
  PRO_CTCAE_CHIMIO, PRO_CTCAE_IMMUNO, PRO_CTCAE_CIBLE, PRO_CTCAE_HORMONO,
  MSIS29, MSWS12, MFIS,
  KCCQ12, MLHFQ,
  PAID5, PAID20, DDS17,
  SIBDQ, HBI, SCCAI,
  RAPID3, HAQDIDISAB,
};

/** Nombre de questions par code de template (fallback si le backend ne renvoie pas items) */
export const QUESTION_COUNTS: Record<string, number> = {
  ESAS_R: 10, PHQ9: 9, BMQ_SPECIFIQUE: 8, MARS5: 5, GAD7: 7,
  DT: 1, EQ5D5L: 6, EORTC_C30: 30, EORTC_QLQ_C30: 30, HADS: 14,
  PRO_CTCAE_CHIMIO: 12, PRO_CTCAE_IMMUNO: 10, PRO_CTCAE_CIBLE: 10, PRO_CTCAE_HORMONO: 10,
  MSIS29: 29, MSWS12: 12, MFIS: 21,
  KCCQ12: 12, KCCQ: 12, MLHFQ: 21,
  PAID5: 5, PAID20: 20, DDS17: 17,
  SIBDQ: 10, HBI: 5, SCCAI: 6,
  RAPID3: 13, HAQDIDISAB: 20,
  PHQ2: 2, GAD2: 2, SF36: 36, SF12: 12, BPI: 14, IPSS: 8,
};

/** Noms compréhensibles pour les patients (affichage côté patient) */
export const PATIENT_FRIENDLY_NAMES: Record<string, string> = {
  ESAS_R:             'Suivi de vos symptômes',
  PHQ9:               'Suivi de votre moral',
  BMQ_SPECIFIQUE:     'Suivi de vos médicaments',
  MARS5:              'Suivi de votre traitement',
  MARS_5:             'Suivi de votre traitement',
  GAD7:               'Questionnaire sur votre anxiété',
  GAD_7:              'Questionnaire sur votre anxiété',
  DT:                 'Votre niveau de détresse',
  EQ5D5L:             'Questionnaire sur votre santé globale',
  EORTC_C30:          'Qualité de vie — cancer',
  EORTC_QLQ_C30:      'Qualité de vie — cancer',
  HADS:               'Questionnaire anxiété et dépression',
  PRO_CTCAE_CHIMIO:   'Suivi de vos symptômes — chimio',
  PRO_CTCAE_IMMUNO:   'Suivi de vos symptômes — immuno',
  PRO_CTCAE_CIBLE:    'Suivi de vos symptômes — thérapie ciblée',
  PRO_CTCAE_HORMONO:  'Suivi de vos symptômes — hormono',
  MSIS29:             'Impact de la SEP sur votre vie',
  MSWS12:             'Questionnaire sur votre marche',
  MFIS:               'Questionnaire sur votre fatigue',
  KCCQ12:             'Suivi de votre cœur',
  KCCQ:               'Suivi de votre cœur',
  MLHFQ:              'Qualité de vie — insuffisance cardiaque',
  PAID5:              'Votre vécu du diabète',
  PAID20:             'Questionnaire détresse et diabète',
  DDS17:              'Questionnaire stress et diabète',
  SIBDQ:              'Qualité de vie — maladie inflammatoire',
  HBI:                'Activité de votre maladie de Crohn',
  SCCAI:              'Activité de votre rectocolite',
  RAPID3:             'Suivi de votre polyarthrite',
  HAQDIDISAB:         'Questionnaire sur vos capacités',
  SF36:               'Questionnaire sur votre santé',
  SF12:               'Questionnaire sur votre santé',
};

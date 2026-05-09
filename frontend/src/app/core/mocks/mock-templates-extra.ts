import { QuestionnaireTemplate } from '../../questionnaire/models/questionnaire-template.model';

// ---------------------------------------------------------------------------
// DT — Distress Thermometer
// ---------------------------------------------------------------------------
export const DT: QuestionnaireTemplate = {
  id: 'tpl-dt', code: 'DT', nom: 'DT — Thermomètre de détresse',
  scope: 'CORE', frequence: 'HEBDO', dureeEstimeeMinutes: 2,
  licenceInfo: 'DT © NCCN', isDue: true,
  items: [
    { id: 'dt1', texte: 'Sur une échelle de 0 à 10, quel est votre niveau de détresse cette semaine ?', texteCourt: 'Détresse', type: 'VAS_0_10', ordre: 1, attributes: ['detresse'], seuilAlerteMin: 7, alerteNiveau: 'CRITICAL', labelMin: 'Aucune détresse', labelMax: 'Détresse extrême' },
  ],
};

// ---------------------------------------------------------------------------
// EQ5D5L — EQ-5D-5L
// ---------------------------------------------------------------------------
export const EQ5D5L: QuestionnaireTemplate = {
  id: 'tpl-eq5d5l', code: 'EQ5D5L', nom: 'EQ-5D-5L — Qualité de vie',
  scope: 'CORE', frequence: 'MENSUEL', dureeEstimeeMinutes: 5,
  licenceInfo: 'EQ-5D © EuroQol Group', isDue: true,
  items: [
    { id: 'eq1', texte: 'Mobilité — Avez-vous des difficultés à marcher ?', texteCourt: 'Mobilité', type: 'LIKERT_5', ordre: 1, attributes: ['mobilite'], labelMin: 'Aucune difficulté', labelMax: 'Incapable de marcher' },
    { id: 'eq2', texte: 'Autonomie — Avez-vous des difficultés à prendre soin de vous ?', texteCourt: 'Autonomie', type: 'LIKERT_5', ordre: 2, attributes: ['autonomie'], labelMin: 'Aucune difficulté', labelMax: 'Incapable' },
    { id: 'eq3', texte: 'Activités courantes — Avez-vous des difficultés à faire vos activités habituelles ?', texteCourt: 'Activités', type: 'LIKERT_5', ordre: 3, attributes: ['activites'], labelMin: 'Aucune difficulté', labelMax: 'Incapable' },
    { id: 'eq4', texte: 'Douleur / Gêne — Avez-vous des douleurs ou une gêne ?', texteCourt: 'Douleur', type: 'LIKERT_5', ordre: 4, attributes: ['douleur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune douleur', labelMax: 'Douleur extrême' },
    { id: 'eq5', texte: 'Anxiété / Dépression — Êtes-vous anxieux(se) ou déprimé(e) ?', texteCourt: 'Anxiété/Dépression', type: 'LIKERT_5', ordre: 5, attributes: ['anxiete', 'depression'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'eq_vas', texte: 'Comment évaluez-vous votre état de santé aujourd\'hui ?', texteCourt: 'Santé globale', type: 'VAS_0_10', ordre: 6, attributes: ['sante_globale'], isInverse: true, labelMin: 'Meilleure santé imaginable', labelMax: 'Pire santé imaginable' },
  ],
};

// ---------------------------------------------------------------------------
// EORTC_C30 — EORTC QLQ-C30 (30 items)
// ---------------------------------------------------------------------------
export const EORTC_C30: QuestionnaireTemplate = {
  id: 'tpl-eortc-c30', code: 'EORTC_C30', nom: 'EORTC QLQ-C30 — Qualité de vie oncologie',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 15,
  licenceInfo: 'EORTC QLQ-C30 © EORTC', isDue: true,
  items: [
    { id: 'c30_1', texte: 'Avez-vous des difficultés à faire des efforts physiques importants comme porter un sac lourd ?', texteCourt: 'Effort physique', type: 'LIKERT_4', ordre: 1, attributes: ['fonctionnement_physique'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_2', texte: 'Avez-vous des difficultés à faire une longue promenade ?', texteCourt: 'Longue marche', type: 'LIKERT_4', ordre: 2, attributes: ['fonctionnement_physique'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_3', texte: 'Avez-vous des difficultés à faire une courte promenade hors de chez vous ?', texteCourt: 'Courte marche', type: 'LIKERT_4', ordre: 3, attributes: ['fonctionnement_physique'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_4', texte: 'Devez-vous rester au lit ou dans un fauteuil une grande partie de la journée ?', texteCourt: 'Alitement', type: 'LIKERT_4', ordre: 4, attributes: ['fonctionnement_physique'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_5', texte: 'Avez-vous besoin d\'aide pour manger, vous habiller, vous laver ou aller aux toilettes ?', texteCourt: 'Aide quotidienne', type: 'LIKERT_4', ordre: 5, attributes: ['fonctionnement_physique'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_6', texte: 'Avez-vous été gêné(e) dans votre travail ou vos activités quotidiennes ?', texteCourt: 'Travail/activités', type: 'LIKERT_4', ordre: 6, attributes: ['fonctionnement_role'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_7', texte: 'Avez-vous été gêné(e) dans vos activités de loisirs ?', texteCourt: 'Loisirs', type: 'LIKERT_4', ordre: 7, attributes: ['fonctionnement_role'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_8', texte: 'Avez-vous eu le souffle court ?', texteCourt: 'Souffle', type: 'LIKERT_4', ordre: 8, attributes: ['dyspnee'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_9', texte: 'Avez-vous eu des douleurs ?', texteCourt: 'Douleur', type: 'LIKERT_4', ordre: 9, attributes: ['douleur'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_10', texte: 'Avez-vous eu besoin de vous reposer ?', texteCourt: 'Repos', type: 'LIKERT_4', ordre: 10, attributes: ['fatigue'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_11', texte: 'Avez-vous eu des difficultés à dormir ?', texteCourt: 'Sommeil', type: 'LIKERT_4', ordre: 11, attributes: ['insomnie'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_12', texte: 'Vous êtes-vous senti(e) faible ?', texteCourt: 'Faiblesse', type: 'LIKERT_4', ordre: 12, attributes: ['fatigue'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_13', texte: 'Avez-vous eu des nausées ?', texteCourt: 'Nausées', type: 'LIKERT_4', ordre: 13, attributes: ['nausee'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_14', texte: 'Avez-vous vomi ?', texteCourt: 'Vomissements', type: 'LIKERT_4', ordre: 14, attributes: ['vomissements'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_15', texte: 'Avez-vous eu des problèmes de constipation ?', texteCourt: 'Constipation', type: 'LIKERT_4', ordre: 15, attributes: ['constipation'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_16', texte: 'Avez-vous eu de la diarrhée ?', texteCourt: 'Diarrhée', type: 'LIKERT_4', ordre: 16, attributes: ['diarrhee'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_17', texte: 'Étiez-vous fatigué(e) ?', texteCourt: 'Fatigue', type: 'LIKERT_4', ordre: 17, attributes: ['fatigue'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_18', texte: 'Des douleurs ont-elles perturbé vos activités quotidiennes ?', texteCourt: 'Douleur/activités', type: 'LIKERT_4', ordre: 18, attributes: ['douleur'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_19', texte: 'Avez-vous eu des difficultés à vous concentrer ?', texteCourt: 'Concentration', type: 'LIKERT_4', ordre: 19, attributes: ['cognition'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_20', texte: 'Vous êtes-vous senti(e) tendu(e) ?', texteCourt: 'Tension', type: 'LIKERT_4', ordre: 20, attributes: ['anxiete'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_21', texte: 'Vous êtes-vous fait du souci ?', texteCourt: 'Soucis', type: 'LIKERT_4', ordre: 21, attributes: ['anxiete'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_22', texte: 'Vous êtes-vous senti(e) irritable ?', texteCourt: 'Irritabilité', type: 'LIKERT_4', ordre: 22, attributes: ['humeur'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_23', texte: 'Vous êtes-vous senti(e) déprimé(e) ?', texteCourt: 'Dépression', type: 'LIKERT_4', ordre: 23, attributes: ['depression'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_24', texte: 'Avez-vous eu des difficultés à vous souvenir des choses ?', texteCourt: 'Mémoire', type: 'LIKERT_4', ordre: 24, attributes: ['cognition'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_25', texte: 'Votre état physique ou votre traitement ont-ils perturbé votre vie familiale ?', texteCourt: 'Vie familiale', type: 'LIKERT_4', ordre: 25, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_26', texte: 'Votre état physique ou votre traitement ont-ils perturbé vos activités sociales ?', texteCourt: 'Vie sociale', type: 'LIKERT_4', ordre: 26, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_27', texte: 'Votre état physique ou votre traitement vous ont-ils causé des difficultés financières ?', texteCourt: 'Finances', type: 'LIKERT_4', ordre: 27, attributes: ['finances'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'c30_28', texte: 'Comment évalueriez-vous votre état de santé général au cours de la semaine passée ?', texteCourt: 'Santé générale', type: 'VAS_0_10', ordre: 28, attributes: ['sante_globale'], isInverse: true, labelMin: 'Très mauvaise', labelMax: 'Excellente' },
    { id: 'c30_29', texte: 'Comment évalueriez-vous votre qualité de vie au cours de la semaine passée ?', texteCourt: 'Qualité de vie', type: 'VAS_0_10', ordre: 29, attributes: ['qualite_vie'], isInverse: true, labelMin: 'Très mauvaise', labelMax: 'Excellente' },
    { id: 'c30_30', texte: 'Avez-vous eu des difficultés à avaler des aliments solides ou liquides ?', texteCourt: 'Déglutition', type: 'LIKERT_4', ordre: 30, attributes: ['deglutition'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
  ],
};

// ---------------------------------------------------------------------------
// HADS — Hospital Anxiety and Depression Scale (14 items)
// ---------------------------------------------------------------------------
export const HADS: QuestionnaireTemplate = {
  id: 'tpl-hads', code: 'HADS', nom: 'HADS — Anxiété et Dépression',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 7,
  licenceInfo: 'HADS © Zigmond & Snaith', isDue: true,
  items: [
    { id: 'hads_a1', texte: 'Je me sens tendu(e) ou énervé(e)', texteCourt: 'Tension', type: 'LIKERT_4', ordre: 1, attributes: ['anxiete'], labelMin: 'Jamais', labelMax: 'La plupart du temps' },
    { id: 'hads_d1', texte: 'Je prends plaisir aux mêmes choses qu\'autrefois', texteCourt: 'Plaisir', type: 'LIKERT_4', ordre: 2, attributes: ['depression'], isInverse: true, labelMin: 'Autant qu\'avant', labelMax: 'Presque jamais' },
    { id: 'hads_a2', texte: 'J\'ai une sensation de peur comme si quelque chose d\'horrible allait m\'arriver', texteCourt: 'Peur', type: 'LIKERT_4', ordre: 3, attributes: ['anxiete'], seuilAlerteMin: 2, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très nettement' },
    { id: 'hads_d2', texte: 'Je ris facilement et vois le bon côté des choses', texteCourt: 'Humour', type: 'LIKERT_4', ordre: 4, attributes: ['depression'], isInverse: true, labelMin: 'Autant que d\'habitude', labelMax: 'Plus du tout' },
    { id: 'hads_a3', texte: 'Je me fais du souci', texteCourt: 'Soucis', type: 'LIKERT_4', ordre: 5, attributes: ['anxiete'], labelMin: 'Très occasionnellement', labelMax: 'Très souvent' },
    { id: 'hads_d3', texte: 'Je me sens de bonne humeur', texteCourt: 'Bonne humeur', type: 'LIKERT_4', ordre: 6, attributes: ['depression'], isInverse: true, labelMin: 'La plupart du temps', labelMax: 'Jamais' },
    { id: 'hads_a4', texte: 'Je peux rester tranquillement assis(e) à ne rien faire', texteCourt: 'Calme', type: 'LIKERT_4', ordre: 7, attributes: ['anxiete'], isInverse: true, labelMin: 'Oui, quoi qu\'il arrive', labelMax: 'Non, pas du tout' },
    { id: 'hads_d4', texte: 'J\'ai l\'impression de fonctionner au ralenti', texteCourt: 'Ralenti', type: 'LIKERT_4', ordre: 8, attributes: ['depression'], seuilAlerteMin: 2, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'hads_a5', texte: 'J\'éprouve des sensations de peur et j\'ai l\'estomac noué', texteCourt: 'Estomac noué', type: 'LIKERT_4', ordre: 9, attributes: ['anxiete'], labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'hads_d5', texte: 'Je ne m\'intéresse plus à mon apparence', texteCourt: 'Apparence', type: 'LIKERT_4', ordre: 10, attributes: ['depression'], labelMin: 'J\'y prête attention', labelMax: 'Je n\'y prête plus attention' },
    { id: 'hads_a6', texte: 'Je me sens agité(e) et j\'ai du mal à tenir en place', texteCourt: 'Agitation', type: 'LIKERT_4', ordre: 11, attributes: ['anxiete'], labelMin: 'Pas du tout', labelMax: 'Beaucoup' },
    { id: 'hads_d6', texte: 'Je me réjouis d\'avance à l\'idée de faire certaines choses', texteCourt: 'Anticipation', type: 'LIKERT_4', ordre: 12, attributes: ['depression'], isInverse: true, labelMin: 'Autant qu\'avant', labelMax: 'Beaucoup moins' },
    { id: 'hads_a7', texte: 'J\'éprouve des sensations soudaines de panique', texteCourt: 'Panique', type: 'LIKERT_4', ordre: 13, attributes: ['anxiete'], seuilAlerteMin: 2, alerteNiveau: 'CRITICAL', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'hads_d7', texte: 'Je peux prendre plaisir à un bon livre ou une bonne émission', texteCourt: 'Plaisir lecture/TV', type: 'LIKERT_4', ordre: 14, attributes: ['depression'], isInverse: true, labelMin: 'Souvent', labelMax: 'Très rarement' },
  ],
};

// ---------------------------------------------------------------------------
// PRO_CTCAE_CHIMIO — Symptômes chimiothérapie (12 items)
// ---------------------------------------------------------------------------
export const PRO_CTCAE_CHIMIO: QuestionnaireTemplate = {
  id: 'tpl-pro-chimio', code: 'PRO_CTCAE_CHIMIO', nom: 'PRO-CTCAE Chimio — Symptômes',
  scope: 'DISEASE_SPECIFIC', frequence: 'HEBDO', dureeEstimeeMinutes: 8,
  licenceInfo: 'PRO-CTCAE © NCI', isDue: true,
  items: [
    { id: 'pct_c1', texte: 'Au cours des 7 derniers jours, quelle a été l\'intensité de vos nausées ?', texteCourt: 'Nausées', type: 'LIKERT_5', ordre: 1, attributes: ['nausee'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c2', texte: 'Au cours des 7 derniers jours, combien de fois avez-vous vomi ?', texteCourt: 'Vomissements', type: 'LIKERT_5', ordre: 2, attributes: ['vomissements'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'pct_c3', texte: 'Au cours des 7 derniers jours, quelle a été l\'intensité de votre fatigue ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 3, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c4', texte: 'Au cours des 7 derniers jours, avez-vous eu de la diarrhée ?', texteCourt: 'Diarrhée', type: 'LIKERT_5', ordre: 4, attributes: ['diarrhee'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'pct_c5', texte: 'Au cours des 7 derniers jours, avez-vous eu des mucosites (plaies dans la bouche) ?', texteCourt: 'Mucosites', type: 'LIKERT_5', ordre: 5, attributes: ['mucosite'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c6', texte: 'Au cours des 7 derniers jours, avez-vous eu des fourmillements ou engourdissements dans les mains/pieds ?', texteCourt: 'Neuropathie', type: 'LIKERT_5', ordre: 6, attributes: ['neuropathie'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_c7', texte: 'Au cours des 7 derniers jours, avez-vous eu des douleurs musculaires ou articulaires ?', texteCourt: 'Douleurs musculo', type: 'LIKERT_5', ordre: 7, attributes: ['douleur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c8', texte: 'Au cours des 7 derniers jours, avez-vous eu de la fièvre ?', texteCourt: 'Fièvre', type: 'YESNO', ordre: 8, attributes: ['fievre'] },
    { id: 'pct_c9', texte: 'Au cours des 7 derniers jours, avez-vous eu des saignements inhabituels ?', texteCourt: 'Saignements', type: 'YESNO', ordre: 9, attributes: ['saignement'] },
    { id: 'pct_c10', texte: 'Au cours des 7 derniers jours, quelle a été l\'intensité de votre perte d\'appétit ?', texteCourt: 'Appétit', type: 'LIKERT_5', ordre: 10, attributes: ['appetit'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c11', texte: 'Au cours des 7 derniers jours, avez-vous eu des difficultés à avaler ?', texteCourt: 'Déglutition', type: 'LIKERT_5', ordre: 11, attributes: ['deglutition'], labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_c12', texte: 'Au cours des 7 derniers jours, comment évaluez-vous votre qualité de vie globale ?', texteCourt: 'Qualité de vie', type: 'VAS_0_10', ordre: 12, attributes: ['qualite_vie'], isInverse: true, labelMin: 'Excellente', labelMax: 'Très mauvaise' },
  ],
};

// ---------------------------------------------------------------------------
// PRO_CTCAE_IMMUNO — Symptômes immunothérapie (10 items)
// ---------------------------------------------------------------------------
export const PRO_CTCAE_IMMUNO: QuestionnaireTemplate = {
  id: 'tpl-pro-immuno', code: 'PRO_CTCAE_IMMUNO', nom: 'PRO-CTCAE Immuno — Symptômes',
  scope: 'DISEASE_SPECIFIC', frequence: 'HEBDO', dureeEstimeeMinutes: 6,
  licenceInfo: 'PRO-CTCAE © NCI', isDue: true,
  items: [
    { id: 'pct_i1', texte: 'Au cours des 7 derniers jours, avez-vous eu des démangeaisons cutanées ?', texteCourt: 'Démangeaisons', type: 'LIKERT_5', ordre: 1, attributes: ['peau'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i2', texte: 'Au cours des 7 derniers jours, avez-vous eu une éruption cutanée ?', texteCourt: 'Éruption', type: 'LIKERT_5', ordre: 2, attributes: ['peau'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i3', texte: 'Au cours des 7 derniers jours, avez-vous eu de la diarrhée ?', texteCourt: 'Diarrhée', type: 'LIKERT_5', ordre: 3, attributes: ['diarrhee'], seuilAlerteMin: 3, alerteNiveau: 'CRITICAL', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i4', texte: 'Au cours des 7 derniers jours, avez-vous eu des douleurs abdominales ?', texteCourt: 'Douleur abdominale', type: 'LIKERT_5', ordre: 4, attributes: ['douleur'], seuilAlerteMin: 4, alerteNiveau: 'CRITICAL', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i5', texte: 'Au cours des 7 derniers jours, avez-vous eu de l\'essoufflement ?', texteCourt: 'Essoufflement', type: 'LIKERT_5', ordre: 5, attributes: ['dyspnee'], seuilAlerteMin: 3, alerteNiveau: 'CRITICAL', labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_i6', texte: 'Au cours des 7 derniers jours, avez-vous eu de la fatigue ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 6, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i7', texte: 'Au cours des 7 derniers jours, avez-vous eu des douleurs articulaires ?', texteCourt: 'Douleurs articulaires', type: 'LIKERT_5', ordre: 7, attributes: ['arthralgie'], labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_i8', texte: 'Au cours des 7 derniers jours, avez-vous eu des maux de tête ?', texteCourt: 'Céphalées', type: 'LIKERT_5', ordre: 8, attributes: ['cephalee'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_i9', texte: 'Au cours des 7 derniers jours, avez-vous eu de la fièvre ou des frissons ?', texteCourt: 'Fièvre/Frissons', type: 'YESNO', ordre: 9, attributes: ['fievre'] },
    { id: 'pct_i10', texte: 'Comment évaluez-vous votre état général cette semaine ?', texteCourt: 'État général', type: 'VAS_0_10', ordre: 10, attributes: ['etat_general'], isInverse: true, labelMin: 'Excellent', labelMax: 'Très mauvais' },
  ],
};

// ---------------------------------------------------------------------------
// PRO_CTCAE_CIBLE — Thérapies ciblées (10 items)
// ---------------------------------------------------------------------------
export const PRO_CTCAE_CIBLE: QuestionnaireTemplate = {
  id: 'tpl-pro-cible', code: 'PRO_CTCAE_CIBLE', nom: 'PRO-CTCAE Ciblé — Symptômes',
  scope: 'DISEASE_SPECIFIC', frequence: 'HEBDO', dureeEstimeeMinutes: 6,
  licenceInfo: 'PRO-CTCAE © NCI', isDue: true,
  items: [
    { id: 'pct_cb1', texte: 'Au cours des 7 derniers jours, avez-vous eu une éruption ou acné sur le visage/corps ?', texteCourt: 'Éruption/Acné', type: 'LIKERT_5', ordre: 1, attributes: ['peau'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb2', texte: 'Au cours des 7 derniers jours, avez-vous eu des problèmes de sécheresse cutanée ?', texteCourt: 'Sécheresse cutanée', type: 'LIKERT_5', ordre: 2, attributes: ['peau'], labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_cb3', texte: 'Au cours des 7 derniers jours, avez-vous eu des réactions mains-pieds (rougeurs, douleurs) ?', texteCourt: 'Réaction mains-pieds', type: 'LIKERT_5', ordre: 3, attributes: ['peau'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb4', texte: 'Au cours des 7 derniers jours, avez-vous eu de la diarrhée ?', texteCourt: 'Diarrhée', type: 'LIKERT_5', ordre: 4, attributes: ['diarrhee'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb5', texte: 'Au cours des 7 derniers jours, avez-vous eu de la fatigue ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 5, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb6', texte: 'Au cours des 7 derniers jours, avez-vous eu des nausées ?', texteCourt: 'Nausées', type: 'LIKERT_5', ordre: 6, attributes: ['nausee'], labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb7', texte: 'Au cours des 7 derniers jours, avez-vous eu des douleurs musculaires ?', texteCourt: 'Douleurs musculaires', type: 'LIKERT_5', ordre: 7, attributes: ['douleur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_cb8', texte: 'Au cours des 7 derniers jours, avez-vous eu des saignements (nez, gencives, etc.) ?', texteCourt: 'Saignements', type: 'YESNO', ordre: 8, attributes: ['saignement'] },
    { id: 'pct_cb9', texte: 'Au cours des 7 derniers jours, avez-vous eu une pression artérielle élevée signalée ?', texteCourt: 'HTA', type: 'YESNO', ordre: 9, attributes: ['hta'] },
    { id: 'pct_cb10', texte: 'Comment évaluez-vous votre état général cette semaine ?', texteCourt: 'État général', type: 'VAS_0_10', ordre: 10, attributes: ['etat_general'], isInverse: true, labelMin: 'Excellent', labelMax: 'Très mauvais' },
  ],
};

// ---------------------------------------------------------------------------
// PRO_CTCAE_HORMONO — Hormonothérapie (10 items)
// ---------------------------------------------------------------------------
export const PRO_CTCAE_HORMONO: QuestionnaireTemplate = {
  id: 'tpl-pro-hormono', code: 'PRO_CTCAE_HORMONO', nom: 'PRO-CTCAE Hormono — Symptômes',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 6,
  licenceInfo: 'PRO-CTCAE © NCI', isDue: true,
  items: [
    { id: 'pct_h1', texte: 'Au cours du dernier mois, avez-vous eu des bouffées de chaleur ?', texteCourt: 'Bouffées chaleur', type: 'LIKERT_5', ordre: 1, attributes: ['bouffee_chaleur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h2', texte: 'Au cours du dernier mois, avez-vous eu des douleurs articulaires ?', texteCourt: 'Arthralgie', type: 'LIKERT_5', ordre: 2, attributes: ['arthralgie'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h3', texte: 'Au cours du dernier mois, avez-vous eu des difficultés à dormir ?', texteCourt: 'Sommeil', type: 'LIKERT_5', ordre: 3, attributes: ['sommeil'], labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h4', texte: 'Au cours du dernier mois, avez-vous eu de la fatigue ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 4, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h5', texte: 'Au cours du dernier mois, avez-vous eu des problèmes de libido ?', texteCourt: 'Libido', type: 'LIKERT_5', ordre: 5, attributes: ['sexualite'], labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_h6', texte: 'Au cours du dernier mois, avez-vous eu de la tristesse ou un moral bas ?', texteCourt: 'Moral', type: 'LIKERT_5', ordre: 6, attributes: ['depression'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Aucun', labelMax: 'Très sévère' },
    { id: 'pct_h7', texte: 'Au cours du dernier mois, avez-vous eu des douleurs osseuses ?', texteCourt: 'Douleurs osseuses', type: 'LIKERT_5', ordre: 7, attributes: ['douleur_os'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h8', texte: 'Au cours du dernier mois, avez-vous eu des sueurs nocturnes ?', texteCourt: 'Sueurs nocturnes', type: 'LIKERT_5', ordre: 8, attributes: ['sueur'], labelMin: 'Aucune', labelMax: 'Très sévère' },
    { id: 'pct_h9', texte: 'Au cours du dernier mois, avez-vous eu des prises de poids notables ?', texteCourt: 'Poids', type: 'YESNO', ordre: 9, attributes: ['poids'] },
    { id: 'pct_h10', texte: 'Comment évaluez-vous votre qualité de vie ce mois-ci ?', texteCourt: 'Qualité de vie', type: 'VAS_0_10', ordre: 10, attributes: ['qualite_vie'], isInverse: true, labelMin: 'Excellente', labelMax: 'Très mauvaise' },
  ],
};

// ---------------------------------------------------------------------------
// MSIS29 — Multiple Sclerosis Impact Scale (29 items)
// ---------------------------------------------------------------------------
export const MSIS29: QuestionnaireTemplate = {
  id: 'tpl-msis29', code: 'MSIS29', nom: 'MSIS-29 — Impact de la SEP',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 12,
  licenceInfo: 'MSIS-29 © Hobart et al.', isDue: true,
  items: [
    { id: 'ms1', texte: 'Limité dans vos activités physiques', texteCourt: 'Limites physiques', type: 'LIKERT_5', ordre: 1, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms2', texte: 'Maladroit dans vos mouvements', texteCourt: 'Maladresse', type: 'LIKERT_5', ordre: 2, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms3', texte: 'Tremblements dans une partie de votre corps', texteCourt: 'Tremblements', type: 'LIKERT_5', ordre: 3, attributes: ['physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms4', texte: 'Difficultés d\'équilibre', texteCourt: 'Équilibre', type: 'LIKERT_5', ordre: 4, attributes: ['physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms5', texte: 'Difficultés à vous déplacer en intérieur', texteCourt: 'Déplacement intérieur', type: 'LIKERT_5', ordre: 5, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms6', texte: 'Difficultés à vous déplacer en extérieur', texteCourt: 'Déplacement extérieur', type: 'LIKERT_5', ordre: 6, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms7', texte: 'Lourdeur dans vos membres', texteCourt: 'Lourdeur membres', type: 'LIKERT_5', ordre: 7, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms8', texte: 'Spasmes douloureux', texteCourt: 'Spasmes', type: 'LIKERT_5', ordre: 8, attributes: ['physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms9', texte: 'Douleurs', texteCourt: 'Douleurs', type: 'LIKERT_5', ordre: 9, attributes: ['douleur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms10', texte: 'Fatigue', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 10, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms11', texte: 'Problèmes de vision', texteCourt: 'Vision', type: 'LIKERT_5', ordre: 11, attributes: ['vision'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms12', texte: 'Difficultés à accomplir des tâches', texteCourt: 'Tâches', type: 'LIKERT_5', ordre: 12, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms13', texte: 'Besoin d\'aide pour vous déplacer', texteCourt: 'Aide déplacement', type: 'LIKERT_5', ordre: 13, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms14', texte: 'Contrôle de la vessie (urgences, fuites)', texteCourt: 'Vessie', type: 'LIKERT_5', ordre: 14, attributes: ['sphincter'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms15', texte: 'Contrôle des intestins', texteCourt: 'Intestins', type: 'LIKERT_5', ordre: 15, attributes: ['sphincter'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms16', texte: 'Sensations désagréables dans votre corps', texteCourt: 'Sensations', type: 'LIKERT_5', ordre: 16, attributes: ['physique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms17', texte: 'Difficultés à avaler ou à mâcher', texteCourt: 'Déglutition', type: 'LIKERT_5', ordre: 17, attributes: ['deglutition'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms18', texte: 'Difficultés à parler', texteCourt: 'Élocution', type: 'LIKERT_5', ordre: 18, attributes: ['elocution'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms19', texte: 'Difficultés à vous concentrer', texteCourt: 'Concentration', type: 'LIKERT_5', ordre: 19, attributes: ['cognition'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms20', texte: 'Manque de confiance en public', texteCourt: 'Confiance', type: 'LIKERT_5', ordre: 20, attributes: ['psychologique'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms21', texte: 'Anxiété ou tension', texteCourt: 'Anxiété', type: 'LIKERT_5', ordre: 21, attributes: ['anxiete'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms22', texte: 'Sentiment de dépression', texteCourt: 'Dépression', type: 'LIKERT_5', ordre: 22, attributes: ['depression'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms23', texte: 'Être moins capable de participer aux activités sociales', texteCourt: 'Vie sociale', type: 'LIKERT_5', ordre: 23, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms24', texte: 'Être confiné(e) à la maison', texteCourt: 'Confinement', type: 'LIKERT_5', ordre: 24, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms25', texte: 'Dépendance envers les autres', texteCourt: 'Dépendance', type: 'LIKERT_5', ordre: 25, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms26', texte: 'Difficultés dans vos relations proches', texteCourt: 'Relations', type: 'LIKERT_5', ordre: 26, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms27', texte: 'Problèmes sexuels', texteCourt: 'Sexualité', type: 'LIKERT_5', ordre: 27, attributes: ['sexualite'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms28', texte: 'Irritabilité', texteCourt: 'Irritabilité', type: 'LIKERT_5', ordre: 28, attributes: ['humeur'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'ms29', texte: 'Sentiment d\'être un fardeau pour les autres', texteCourt: 'Fardeau', type: 'LIKERT_5', ordre: 29, attributes: ['psychologique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
  ],
};

// ---------------------------------------------------------------------------
// MSWS12 — MS Walking Scale (12 items)
// ---------------------------------------------------------------------------
export const MSWS12: QuestionnaireTemplate = {
  id: 'tpl-msws12', code: 'MSWS12', nom: 'MSWS-12 — Marche et SEP',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 6,
  licenceInfo: 'MSWS-12 © Hobart et al.', isDue: true,
  items: [
    { id: 'msws1', texte: 'Votre aptitude à marcher a limité votre activité physique générale', texteCourt: 'Activité physique', type: 'LIKERT_5', ordre: 1, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws2', texte: 'Vous avez dû faire des efforts pour marcher', texteCourt: 'Effort marche', type: 'LIKERT_5', ordre: 2, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws3', texte: 'Vous avez eu du mal à maintenir votre équilibre en marchant', texteCourt: 'Équilibre marche', type: 'LIKERT_5', ordre: 3, attributes: ['marche'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws4', texte: 'Vous avez dû vous concentrer pour marcher', texteCourt: 'Concentration marche', type: 'LIKERT_5', ordre: 4, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws5', texte: 'Votre aptitude à marcher était lente', texteCourt: 'Lenteur', type: 'LIKERT_5', ordre: 5, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws6', texte: 'Votre posture lors de la marche était affectée', texteCourt: 'Posture', type: 'LIKERT_5', ordre: 6, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws7', texte: 'Vous avez eu du mal à commencer à marcher', texteCourt: 'Initiation', type: 'LIKERT_5', ordre: 7, attributes: ['marche'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws8', texte: 'Votre marche était saccadée ou irrégulière', texteCourt: 'Régularité', type: 'LIKERT_5', ordre: 8, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws9', texte: 'Vous avez eu besoin d\'aide pour marcher (aide technique ou personne)', texteCourt: 'Aide marche', type: 'LIKERT_5', ordre: 9, attributes: ['marche'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws10', texte: 'Vous avez été limité(e) dans la distance que vous pouviez marcher', texteCourt: 'Distance', type: 'LIKERT_5', ordre: 10, attributes: ['marche'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws11', texte: 'Vos jambes se sont senties lourdes en marchant', texteCourt: 'Lourdeur jambes', type: 'LIKERT_5', ordre: 11, attributes: ['marche'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'msws12', texte: 'Votre marche était affectée par votre anxiété', texteCourt: 'Anxiété marche', type: 'LIKERT_5', ordre: 12, attributes: ['marche', 'anxiete'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
  ],
};

// ---------------------------------------------------------------------------
// MFIS — Modified Fatigue Impact Scale (21 items)
// ---------------------------------------------------------------------------
export const MFIS: QuestionnaireTemplate = {
  id: 'tpl-mfis', code: 'MFIS', nom: 'MFIS — Fatigue et SEP',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 10,
  licenceInfo: 'MFIS © NMSS', isDue: true,
  items: [
    { id: 'mfis1', texte: 'Je suis moins alerte', texteCourt: 'Vigilance', type: 'LIKERT_4', ordre: 1, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis2', texte: 'J\'ai du mal à maintenir mon attention', texteCourt: 'Attention', type: 'LIKERT_4', ordre: 2, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis3', texte: 'Je suis moins motivé(e) à faire quoi que ce soit nécessitant une réflexion', texteCourt: 'Motivation cognitive', type: 'LIKERT_4', ordre: 3, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis4', texte: 'J\'ai du mal à réaliser des tâches nécessitant un effort physique', texteCourt: 'Effort physique', type: 'LIKERT_4', ordre: 4, attributes: ['fatigue_physique'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis5', texte: 'Je suis fatigué(e)', texteCourt: 'Fatigue générale', type: 'LIKERT_4', ordre: 5, attributes: ['fatigue_physique'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis6', texte: 'J\'ai du mal à réaliser des activités prolongées', texteCourt: 'Endurance', type: 'LIKERT_4', ordre: 6, attributes: ['fatigue_physique'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis7', texte: 'J\'ai du mal à réaliser certaines de mes responsabilités familiales', texteCourt: 'Famille', type: 'LIKERT_4', ordre: 7, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis8', texte: 'J\'ai besoin de limiter mes activités sociales', texteCourt: 'Social', type: 'LIKERT_4', ordre: 8, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis9', texte: 'J\'ai du mal à penser clairement', texteCourt: 'Clarté pensée', type: 'LIKERT_4', ordre: 9, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis10', texte: 'J\'ai du mal à concentrer ma pensée sur plus d\'une chose à la fois', texteCourt: 'Concentration', type: 'LIKERT_4', ordre: 10, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis11', texte: 'Je suis moins motivé(e) à accomplir les tâches qui nécessitent de l\'attention', texteCourt: 'Motivation attentionnelle', type: 'LIKERT_4', ordre: 11, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis12', texte: 'Mes muscles se sentent faibles', texteCourt: 'Faiblesse musculaire', type: 'LIKERT_4', ordre: 12, attributes: ['fatigue_physique'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis13', texte: 'Je suis moins motivé(e) à faire quoi que ce soit nécessitant un effort physique', texteCourt: 'Motivation physique', type: 'LIKERT_4', ordre: 13, attributes: ['fatigue_physique'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis14', texte: 'J\'ai du mal à remplir mes obligations professionnelles', texteCourt: 'Travail', type: 'LIKERT_4', ordre: 14, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis15', texte: 'J\'ai du mal à finir les tâches qui demandent un effort de réflexion', texteCourt: 'Achèvement cognitif', type: 'LIKERT_4', ordre: 15, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis16', texte: 'J\'ai du mal à organiser mes pensées lorsque je fais des choses chez moi ou au travail', texteCourt: 'Organisation', type: 'LIKERT_4', ordre: 16, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis17', texte: 'Je suis moins motivé(e) à maintenir mes activités physiques', texteCourt: 'Motivation activité', type: 'LIKERT_4', ordre: 17, attributes: ['fatigue_physique'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis18', texte: 'Je suis moins capable d\'accomplir des tâches en dehors de chez moi', texteCourt: 'Extérieur', type: 'LIKERT_4', ordre: 18, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis19', texte: 'J\'ai du mal à me rappeler des choses', texteCourt: 'Mémoire', type: 'LIKERT_4', ordre: 19, attributes: ['fatigue_cognitive'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis20', texte: 'Ma participation aux activités familiales est réduite', texteCourt: 'Famille (participation)', type: 'LIKERT_4', ordre: 20, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
    { id: 'mfis21', texte: 'J\'ai du mal à m\'engager dans des activités en dehors de chez moi', texteCourt: 'Engagement extérieur', type: 'LIKERT_4', ordre: 21, attributes: ['fatigue_sociale'], labelMin: 'Jamais', labelMax: 'Presque toujours' },
  ],
};

// ---------------------------------------------------------------------------
// KCCQ12 — Kansas City Cardiomyopathy Questionnaire 12 items
// ---------------------------------------------------------------------------
export const KCCQ12: QuestionnaireTemplate = {
  id: 'tpl-kccq12', code: 'KCCQ12', nom: 'KCCQ-12 — Insuffisance cardiaque',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 6,
  licenceInfo: 'KCCQ © Saint Luke\'s Hospital Foundation', isDue: true,
  items: [
    { id: 'kccq1', texte: 'Se laver/s\'habiller seul(e) a été limité par votre cœur', texteCourt: 'Hygiène', type: 'LIKERT_5', ordre: 1, attributes: ['fonctionnement_physique'], labelMin: 'Pas limité du tout', labelMax: 'Très limité ou incapable' },
    { id: 'kccq2', texte: 'Faire une promenade à l\'extérieur sur terrain plat a été limité par votre cœur', texteCourt: 'Marche', type: 'LIKERT_5', ordre: 2, attributes: ['fonctionnement_physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas limité du tout', labelMax: 'Très limité ou incapable' },
    { id: 'kccq3', texte: 'Monter ou descendre des escaliers a été limité par votre cœur', texteCourt: 'Escaliers', type: 'LIKERT_5', ordre: 3, attributes: ['fonctionnement_physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas limité du tout', labelMax: 'Très limité ou incapable' },
    { id: 'kccq4', texte: 'Jardiner, passer l\'aspirateur ou porter les courses a été limité par votre cœur', texteCourt: 'Tâches ménagères', type: 'LIKERT_5', ordre: 4, attributes: ['fonctionnement_physique'], labelMin: 'Pas limité du tout', labelMax: 'Très limité ou incapable' },
    { id: 'kccq5', texte: 'Au cours des 2 dernières semaines, vos pieds/jambes étaient-ils gonflés ?', texteCourt: 'Œdèmes', type: 'LIKERT_5', ordre: 5, attributes: ['symptome_ic'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Constamment' },
    { id: 'kccq6', texte: 'Au cours des 2 dernières semaines, avez-vous été fatigué(e) ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 6, attributes: ['symptome_ic'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Constamment' },
    { id: 'kccq7', texte: 'Au cours des 2 dernières semaines, avez-vous eu du mal à respirer en position allongée ?', texteCourt: 'Dyspnée allongé', type: 'LIKERT_5', ordre: 7, attributes: ['symptome_ic'], seuilAlerteMin: 3, alerteNiveau: 'CRITICAL', labelMin: 'Jamais', labelMax: 'Constamment' },
    { id: 'kccq8', texte: 'Votre maladie cardiaque a-t-elle limité vos loisirs ?', texteCourt: 'Loisirs', type: 'LIKERT_5', ordre: 8, attributes: ['qualite_vie'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'kccq9', texte: 'Votre maladie cardiaque a-t-elle limité votre vie professionnelle ?', texteCourt: 'Travail', type: 'LIKERT_5', ordre: 9, attributes: ['qualite_vie'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'kccq10', texte: 'Votre maladie cardiaque a-t-elle limité vos relations sociales ?', texteCourt: 'Social', type: 'LIKERT_5', ordre: 10, attributes: ['qualite_vie'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'kccq11', texte: 'Dans quelle mesure êtes-vous satisfait(e) de votre traitement cardiaque actuel ?', texteCourt: 'Satisfaction traitement', type: 'LIKERT_5', ordre: 11, attributes: ['satisfaction'], isInverse: true, labelMin: 'Très insatisfait(e)', labelMax: 'Très satisfait(e)' },
    { id: 'kccq12', texte: 'Comment évaluez-vous votre qualité de vie liée à votre maladie cardiaque ?', texteCourt: 'Qualité de vie', type: 'LIKERT_5', ordre: 12, attributes: ['qualite_vie'], isInverse: true, labelMin: 'Très mauvaise', labelMax: 'Excellente' },
  ],
};

// ---------------------------------------------------------------------------
// MLHFQ — Minnesota Living with Heart Failure Questionnaire (21 items)
// ---------------------------------------------------------------------------
export const MLHFQ: QuestionnaireTemplate = {
  id: 'tpl-mlhfq', code: 'MLHFQ', nom: 'MLHFQ — Qualité de vie IC',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 10,
  licenceInfo: 'MLHFQ © Rector & Cohn', isDue: true,
  items: [
    { id: 'mlhf1', texte: 'Les gonflements des chevilles, jambes ou abdomen', texteCourt: 'Œdèmes', type: 'LIKERT_5', ordre: 1, attributes: ['physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf2', texte: 'S\'asseoir ou se lever', texteCourt: 'Lever', type: 'LIKERT_5', ordre: 2, attributes: ['physique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf3', texte: 'Marcher ou monter des escaliers', texteCourt: 'Marche/escaliers', type: 'LIKERT_5', ordre: 3, attributes: ['physique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf4', texte: 'Les travaux ménagers', texteCourt: 'Ménage', type: 'LIKERT_5', ordre: 4, attributes: ['physique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf5', texte: 'Se déplacer en dehors du domicile', texteCourt: 'Déplacement', type: 'LIKERT_5', ordre: 5, attributes: ['physique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf6', texte: 'Le sommeil', texteCourt: 'Sommeil', type: 'LIKERT_5', ordre: 6, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf7', texte: 'Les relations avec les amis ou la famille', texteCourt: 'Relations', type: 'LIKERT_5', ordre: 7, attributes: ['social'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf8', texte: 'Travailler pour gagner sa vie', texteCourt: 'Travail', type: 'LIKERT_5', ordre: 8, attributes: ['social'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf9', texte: 'Les activités de loisir ou sportives', texteCourt: 'Loisirs', type: 'LIKERT_5', ordre: 9, attributes: ['social'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf10', texte: 'Les activités sexuelles', texteCourt: 'Sexualité', type: 'LIKERT_5', ordre: 10, attributes: ['social'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf11', texte: 'Manger moins des aliments que vous aimez', texteCourt: 'Alimentation', type: 'LIKERT_5', ordre: 11, attributes: ['physique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf12', texte: 'L\'essoufflement', texteCourt: 'Dyspnée', type: 'LIKERT_5', ordre: 12, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'CRITICAL', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf13', texte: 'La fatigue', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 13, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf14', texte: 'Rester à l\'hôpital', texteCourt: 'Hospitalisation', type: 'LIKERT_5', ordre: 14, attributes: ['social'], seuilAlerteMin: 2, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf15', texte: 'Les frais médicaux', texteCourt: 'Finances médicales', type: 'LIKERT_5', ordre: 15, attributes: ['social'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf16', texte: 'Les effets secondaires des médicaments', texteCourt: 'Effets médicaments', type: 'LIKERT_5', ordre: 16, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf17', texte: 'Être un fardeau pour la famille ou les amis', texteCourt: 'Fardeau', type: 'LIKERT_5', ordre: 17, attributes: ['psychologique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf18', texte: 'Avoir l\'impression de perdre le contrôle de votre vie', texteCourt: 'Contrôle', type: 'LIKERT_5', ordre: 18, attributes: ['psychologique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf19', texte: 'Les inquiétudes', texteCourt: 'Inquiétudes', type: 'LIKERT_5', ordre: 19, attributes: ['psychologique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf20', texte: 'La concentration ou les oublis', texteCourt: 'Concentration', type: 'LIKERT_5', ordre: 20, attributes: ['psychologique'], labelMin: 'Non', labelMax: 'Énormément' },
    { id: 'mlhf21', texte: 'Vous sentir déprimé(e)', texteCourt: 'Dépression', type: 'LIKERT_5', ordre: 21, attributes: ['psychologique'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Non', labelMax: 'Énormément' },
  ],
};

// ---------------------------------------------------------------------------
// PAID5 — Problem Areas in Diabetes Scale — 5 items
// ---------------------------------------------------------------------------
export const PAID5: QuestionnaireTemplate = {
  id: 'tpl-paid5', code: 'PAID5', nom: 'PAID-5 — Vécu du diabète',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 3,
  licenceInfo: 'PAID © Welch et al.', isDue: true,
  items: [
    { id: 'paid5_1', texte: 'Ne pas atteindre les objectifs de votre traitement diabétique', texteCourt: 'Objectifs', type: 'LIKERT_5', ordre: 1, attributes: ['detresse_diabete'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid5_2', texte: 'Se sentir coupable ou inquiet(e) lorsque votre alimentation n\'est pas adaptée au diabète', texteCourt: 'Culpabilité alimentaire', type: 'LIKERT_5', ordre: 2, attributes: ['detresse_diabete'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid5_3', texte: 'Ne pas savoir si vos sautes d\'humeur ou vos sentiments sont liés à votre diabète', texteCourt: 'Humeur/diabète', type: 'LIKERT_5', ordre: 3, attributes: ['detresse_diabete'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid5_4', texte: 'Se sentir dépassé(e) par votre régime diabétique', texteCourt: 'Régime', type: 'LIKERT_5', ordre: 4, attributes: ['detresse_diabete'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid5_5', texte: 'Avoir peur des complications à long terme du diabète', texteCourt: 'Peur complications', type: 'LIKERT_5', ordre: 5, attributes: ['detresse_diabete'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
  ],
};

// ---------------------------------------------------------------------------
// PAID20 — Problem Areas in Diabetes Scale — 20 items
// ---------------------------------------------------------------------------
export const PAID20: QuestionnaireTemplate = {
  id: 'tpl-paid20', code: 'PAID20', nom: 'PAID-20 — Détresse liée au diabète',
  scope: 'DISEASE_SPECIFIC', frequence: 'TRIMESTRIEL', dureeEstimeeMinutes: 10,
  licenceInfo: 'PAID © Welch et al.', isDue: true,
  items: [
    { id: 'paid20_1', texte: 'Ne pas avoir d\'objectifs clairs dans la gestion de votre diabète', texteCourt: 'Objectifs', type: 'LIKERT_5', ordre: 1, attributes: ['detresse'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_2', texte: 'Se sentir découragé(e) par votre traitement', texteCourt: 'Découragement', type: 'LIKERT_5', ordre: 2, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_3', texte: 'Avoir peur d\'une hypoglycémie', texteCourt: 'Hypoglycémie', type: 'LIKERT_5', ordre: 3, attributes: ['peur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_4', texte: 'Se sentir déprimé(e) à cause du diabète', texteCourt: 'Dépression', type: 'LIKERT_5', ordre: 4, attributes: ['humeur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_5', texte: 'Difficultés à accepter le diabète', texteCourt: 'Acceptation', type: 'LIKERT_5', ordre: 5, attributes: ['acceptation'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_6', texte: 'Se sentir dépassé(e) par la gestion du diabète', texteCourt: 'Dépassement', type: 'LIKERT_5', ordre: 6, attributes: ['detresse'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_7', texte: 'Sentir que le diabète contrôle votre vie', texteCourt: 'Contrôle', type: 'LIKERT_5', ordre: 7, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_8', texte: 'Ne pas savoir comment gérer les variations de glycémie', texteCourt: 'Glycémie', type: 'LIKERT_5', ordre: 8, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_9', texte: 'Se sentir coupable lorsque l\'alimentation n\'est pas adaptée', texteCourt: 'Culpabilité', type: 'LIKERT_5', ordre: 9, attributes: ['culpabilite'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_10', texte: 'Avoir peur des complications à long terme', texteCourt: 'Complications', type: 'LIKERT_5', ordre: 10, attributes: ['peur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_11', texte: 'Se sentir honteux(se) ou embarrassé(e) à cause du diabète', texteCourt: 'Honte', type: 'LIKERT_5', ordre: 11, attributes: ['humeur'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_12', texte: 'Difficultés à s\'adapter aux changements de traitement', texteCourt: 'Adaptation traitement', type: 'LIKERT_5', ordre: 12, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_13', texte: 'Se sentir seul(e) avec le diabète', texteCourt: 'Solitude', type: 'LIKERT_5', ordre: 13, attributes: ['social'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_14', texte: 'Impact sur vos relations avec les proches', texteCourt: 'Relations', type: 'LIKERT_5', ordre: 14, attributes: ['social'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_15', texte: 'Impact sur votre vie professionnelle', texteCourt: 'Travail', type: 'LIKERT_5', ordre: 15, attributes: ['social'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_16', texte: 'Difficultés à pratiquer une activité physique régulière', texteCourt: 'Activité physique', type: 'LIKERT_5', ordre: 16, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_17', texte: 'Difficultés à suivre le régime alimentaire recommandé', texteCourt: 'Régime', type: 'LIKERT_5', ordre: 17, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_18', texte: 'Difficultés à prendre les médicaments correctement', texteCourt: 'Médicaments', type: 'LIKERT_5', ordre: 18, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_19', texte: 'Difficultés à surveiller régulièrement la glycémie', texteCourt: 'Surveillance', type: 'LIKERT_5', ordre: 19, attributes: ['gestion'], labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
    { id: 'paid20_20', texte: 'Impact du diabète sur votre qualité de vie globale', texteCourt: 'Qualité de vie', type: 'LIKERT_5', ordre: 20, attributes: ['qualite_vie'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Problème majeur' },
  ],
};

// ---------------------------------------------------------------------------
// DDS17 — Diabetes Distress Scale (17 items)
// ---------------------------------------------------------------------------
export const DDS17: QuestionnaireTemplate = {
  id: 'tpl-dds17', code: 'DDS17', nom: 'DDS-17 — Stress lié au diabète',
  scope: 'DISEASE_SPECIFIC', frequence: 'TRIMESTRIEL', dureeEstimeeMinutes: 8,
  licenceInfo: 'DDS © Polonsky et al.', isDue: true,
  items: [
    { id: 'dds1', texte: 'Sentiment que le diabète prend trop de place mentale et physique', texteCourt: 'Charge mentale', type: 'LIKERT_5', ordre: 1, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds2', texte: 'Sentiment de ne pas s\'en sortir avec la gestion du diabète', texteCourt: 'Gestion difficile', type: 'LIKERT_5', ordre: 2, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds3', texte: 'Sentiment que les médecins ne comprennent pas votre situation', texteCourt: 'Relation médecin', type: 'LIKERT_5', ordre: 3, attributes: ['medical'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds4', texte: 'Sentiment de ne pas être assez discipliné(e) concernant l\'alimentation', texteCourt: 'Discipline', type: 'LIKERT_5', ordre: 4, attributes: ['regime'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds5', texte: 'Sentiment que les proches ne soutiennent pas suffisamment', texteCourt: 'Soutien entourage', type: 'LIKERT_5', ordre: 5, attributes: ['soutien'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds6', texte: 'Sentiment de dépression à cause du diabète', texteCourt: 'Dépression', type: 'LIKERT_5', ordre: 6, attributes: ['humeur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds7', texte: 'Ne pas savoir si les symptômes ressentis sont liés au diabète', texteCourt: 'Symptômes ambigus', type: 'LIKERT_5', ordre: 7, attributes: ['medical'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds8', texte: 'Se sentir dépassé(e) par l\'autogestion du diabète', texteCourt: 'Autogestion', type: 'LIKERT_5', ordre: 8, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds9', texte: 'Sentiment que les médecins ne s\'impliquent pas suffisamment', texteCourt: 'Implication médicale', type: 'LIKERT_5', ordre: 9, attributes: ['medical'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds10', texte: 'Difficultés à surveiller régulièrement la glycémie', texteCourt: 'Surveillance', type: 'LIKERT_5', ordre: 10, attributes: ['autogestion'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds11', texte: 'Inquiétudes au sujet des complications futures', texteCourt: 'Complications', type: 'LIKERT_5', ordre: 11, attributes: ['peur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds12', texte: 'Sentiment que les proches traitent votre diabète de manière inappropriée', texteCourt: 'Attitude entourage', type: 'LIKERT_5', ordre: 12, attributes: ['soutien'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds13', texte: 'Difficultés à suivre le régime recommandé', texteCourt: 'Régime', type: 'LIKERT_5', ordre: 13, attributes: ['regime'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds14', texte: 'Sentiment de ne pas avoir de soutien médical suffisant', texteCourt: 'Soutien médical', type: 'LIKERT_5', ordre: 14, attributes: ['medical'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds15', texte: 'Sentiment que votre famille ne comprend pas la difficulté de vivre avec le diabète', texteCourt: 'Compréhension famille', type: 'LIKERT_5', ordre: 15, attributes: ['soutien'], labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds16', texte: 'Difficultés à prendre les médicaments tels que prescrits', texteCourt: 'Observance', type: 'LIKERT_5', ordre: 16, attributes: ['autogestion'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
    { id: 'dds17', texte: 'Sentiment que le diabète affecte négativement les aspects importants de votre vie', texteCourt: 'Impact vie', type: 'LIKERT_5', ordre: 17, attributes: ['detresse'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Très sérieux' },
  ],
};

// ---------------------------------------------------------------------------
// SIBDQ — Short Inflammatory Bowel Disease Questionnaire (10 items)
// ---------------------------------------------------------------------------
export const SIBDQ: QuestionnaireTemplate = {
  id: 'tpl-sibdq', code: 'SIBDQ', nom: 'SIBDQ — Qualité de vie MICI',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 5,
  licenceInfo: 'SIBDQ © McMaster University', isDue: true,
  items: [
    { id: 'sibdq1', texte: 'À quelle fréquence avez-vous dû aller aux toilettes d\'urgence ?', texteCourt: 'Urgences intestinales', type: 'LIKERT_5', ordre: 1, attributes: ['symptome_ibd'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'sibdq2', texte: 'Combien de fois avez-vous été gêné(e) par des douleurs abdominales ?', texteCourt: 'Douleurs abdominales', type: 'LIKERT_5', ordre: 2, attributes: ['symptome_ibd'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'sibdq3', texte: 'Dans quelle mesure votre MICI a-t-elle limité vos activités sociales ?', texteCourt: 'Vie sociale', type: 'LIKERT_5', ordre: 3, attributes: ['vie_sociale'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'sibdq4', texte: 'Combien de fois avez-vous eu des selles liquides ou très molles ?', texteCourt: 'Selles liquides', type: 'LIKERT_5', ordre: 4, attributes: ['symptome_ibd'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'sibdq5', texte: 'Dans quelle mesure vous êtes-vous senti(e) fatigué(e) ?', texteCourt: 'Fatigue', type: 'LIKERT_5', ordre: 5, attributes: ['fatigue'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'sibdq6', texte: 'Dans quelle mesure avez-vous eu peur de ne pas trouver des toilettes à temps ?', texteCourt: 'Peur des toilettes', type: 'LIKERT_5', ordre: 6, attributes: ['anxiete'], labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'sibdq7', texte: 'Dans quelle mesure avez-vous évité des sorties par peur de symptômes ?', texteCourt: 'Évitement sorties', type: 'LIKERT_5', ordre: 7, attributes: ['vie_sociale'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'sibdq8', texte: 'Combien de nuits votre sommeil a-t-il été perturbé par les symptômes ?', texteCourt: 'Sommeil perturbé', type: 'LIKERT_5', ordre: 8, attributes: ['sommeil'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Jamais', labelMax: 'Très souvent' },
    { id: 'sibdq9', texte: 'Dans quelle mesure vous êtes-vous senti(e) déprimé(e) ou découragé(e) ?', texteCourt: 'Moral', type: 'LIKERT_5', ordre: 9, attributes: ['humeur'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Pas du tout', labelMax: 'Extrêmement' },
    { id: 'sibdq10', texte: 'Comment évaluez-vous votre qualité de vie globale liée à votre maladie ?', texteCourt: 'Qualité de vie', type: 'LIKERT_5', ordre: 10, attributes: ['qualite_vie'], isInverse: true, labelMin: 'Excellente', labelMax: 'Très mauvaise' },
  ],
};

// ---------------------------------------------------------------------------
// HBI — Harvey-Bradshaw Index — Maladie de Crohn (5 items)
// ---------------------------------------------------------------------------
export const HBI: QuestionnaireTemplate = {
  id: 'tpl-hbi', code: 'HBI', nom: 'HBI — Activité Crohn',
  scope: 'DISEASE_SPECIFIC', frequence: 'HEBDO', dureeEstimeeMinutes: 3,
  licenceInfo: 'HBI © Harvey & Bradshaw', isDue: true,
  items: [
    { id: 'hbi1', texte: 'Quel est votre état général aujourd\'hui ?', texteCourt: 'État général', type: 'LIKERT_5', ordre: 1, attributes: ['etat_general'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Très bon', labelMax: 'Terrible' },
    { id: 'hbi2', texte: 'Combien de fois avez-vous eu des douleurs abdominales aujourd\'hui ?', texteCourt: 'Douleurs', type: 'LIKERT_4', ordre: 2, attributes: ['douleur'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Sévère' },
    { id: 'hbi3', texte: 'Combien de selles liquides avez-vous eu aujourd\'hui ?', texteCourt: 'Selles liquides', type: 'LIKERT_5', ordre: 3, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: '0', labelMax: '5 ou plus' },
    { id: 'hbi4', texte: 'Avez-vous une masse abdominale palpable ?', texteCourt: 'Masse abdominale', type: 'YESNO', ordre: 4, attributes: ['symptome'] },
    { id: 'hbi5', texte: 'Avez-vous des complications (arthrite, uvéite, fissures, fistules) ?', texteCourt: 'Complications', type: 'YESNO', ordre: 5, attributes: ['complications'] },
  ],
};

// ---------------------------------------------------------------------------
// SCCAI — Simple Clinical Colitis Activity Index (6 items)
// ---------------------------------------------------------------------------
export const SCCAI: QuestionnaireTemplate = {
  id: 'tpl-sccai', code: 'SCCAI', nom: 'SCCAI — Activité rectocolite',
  scope: 'DISEASE_SPECIFIC', frequence: 'HEBDO', dureeEstimeeMinutes: 3,
  licenceInfo: 'SCCAI © Walmsley et al.', isDue: true,
  items: [
    { id: 'sccai1', texte: 'Fréquence des selles de jour (nombre moyen par jour)', texteCourt: 'Selles/jour', type: 'LIKERT_5', ordre: 1, attributes: ['symptome'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: '1–3', labelMax: '≥9' },
    { id: 'sccai2', texte: 'Fréquence des selles de nuit', texteCourt: 'Selles/nuit', type: 'LIKERT_4', ordre: 2, attributes: ['symptome'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: '3 ou plus' },
    { id: 'sccai3', texte: 'Urgences pour aller aux toilettes', texteCourt: 'Urgences', type: 'LIKERT_4', ordre: 3, attributes: ['symptome'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Aucune', labelMax: 'Incontinence' },
    { id: 'sccai4', texte: 'Présence de sang dans les selles', texteCourt: 'Sang', type: 'LIKERT_4', ordre: 4, attributes: ['symptome'], seuilAlerteMin: 2, alerteNiveau: 'CRITICAL', labelMin: 'Aucun', labelMax: 'Sang pur' },
    { id: 'sccai5', texte: 'État général', texteCourt: 'État général', type: 'LIKERT_5', ordre: 5, attributes: ['etat_general'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Très bon', labelMax: 'Terrible' },
    { id: 'sccai6', texte: 'Manifestations extra-intestinales (arthrite, uvéite, érythème noueux)', texteCourt: 'Extra-intestinal', type: 'YESNO', ordre: 6, attributes: ['complications'] },
  ],
};

// ---------------------------------------------------------------------------
// RAPID3 — Routine Assessment Patient Index Data 3 (10 + 2 + 1 = 13 items)
// ---------------------------------------------------------------------------
export const RAPID3: QuestionnaireTemplate = {
  id: 'tpl-rapid3', code: 'RAPID3', nom: 'RAPID3 — Activité polyarthrite',
  scope: 'DISEASE_SPECIFIC', frequence: 'MENSUEL', dureeEstimeeMinutes: 5,
  licenceInfo: 'RAPID3 © Pincus et al.', isDue: true,
  items: [
    { id: 'rap1', texte: 'S\'habiller seul(e) incluant nouer les lacets et boutonner les vêtements', texteCourt: 'S\'habiller', type: 'LIKERT_4', ordre: 1, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap2', texte: 'Se lever d\'une chaise droite', texteCourt: 'Se lever', type: 'LIKERT_4', ordre: 2, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap3', texte: 'Manger et couper les aliments', texteCourt: 'Manger', type: 'LIKERT_4', ordre: 3, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap4', texte: 'Marcher en terrain plat', texteCourt: 'Marche', type: 'LIKERT_4', ordre: 4, attributes: ['capacite_physique'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap5', texte: 'Se laver et sécher entièrement le corps', texteCourt: 'Hygiène', type: 'LIKERT_4', ordre: 5, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap6', texte: 'S\'accroupir', texteCourt: 'S\'accroupir', type: 'LIKERT_4', ordre: 6, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap7', texte: 'Lever les bras au-dessus de la tête', texteCourt: 'Bras levés', type: 'LIKERT_4', ordre: 7, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap8', texte: 'Monter 5 marches d\'escalier', texteCourt: 'Escaliers', type: 'LIKERT_4', ordre: 8, attributes: ['capacite_physique'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap9', texte: 'Conduire ou utiliser les transports en commun', texteCourt: 'Transport', type: 'LIKERT_4', ordre: 9, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap10', texte: 'Faire les courses', texteCourt: 'Courses', type: 'LIKERT_4', ordre: 10, attributes: ['capacite_physique'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'rap_pain', texte: 'Comment évaluez-vous votre douleur aujourd\'hui ?', texteCourt: 'Douleur', type: 'VAS_0_10', ordre: 11, attributes: ['douleur'], seuilAlerteMin: 7, alerteNiveau: 'CRITICAL', labelMin: 'Aucune douleur', labelMax: 'Douleur maximale' },
    { id: 'rap_fatigue', texte: 'Comment évaluez-vous votre fatigue aujourd\'hui ?', texteCourt: 'Fatigue', type: 'VAS_0_10', ordre: 12, attributes: ['fatigue'], seuilAlerteMin: 8, alerteNiveau: 'WARNING', labelMin: 'Aucune fatigue', labelMax: 'Fatigue maximale' },
    { id: 'rap_global', texte: 'Quel est votre état général lié à votre arthrite aujourd\'hui ?', texteCourt: 'État global', type: 'LIKERT_5', ordre: 13, attributes: ['etat_general'], seuilAlerteMin: 4, alerteNiveau: 'WARNING', labelMin: 'Excellent', labelMax: 'Très mauvais' },
  ],
};

// ---------------------------------------------------------------------------
// HAQDIDISAB — Health Assessment Questionnaire Disability Index (20 items)
// ---------------------------------------------------------------------------
export const HAQDIDISAB: QuestionnaireTemplate = {
  id: 'tpl-haqdi', code: 'HAQDIDISAB', nom: 'HAQ-DI — Capacités fonctionnelles',
  scope: 'DISEASE_SPECIFIC', frequence: 'TRIMESTRIEL', dureeEstimeeMinutes: 10,
  licenceInfo: 'HAQ © Fries et al.', isDue: true,
  items: [
    { id: 'haq1', texte: 'S\'habiller : nouer les lacets, boutonner', texteCourt: 'S\'habiller', type: 'LIKERT_4', ordre: 1, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq2', texte: 'Se laver les cheveux', texteCourt: 'Cheveux', type: 'LIKERT_4', ordre: 2, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq3', texte: 'Se lever d\'une chaise non rembourrée', texteCourt: 'Se lever chaise', type: 'LIKERT_4', ordre: 3, attributes: ['fonctions'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq4', texte: 'Se mettre au lit et se lever du lit', texteCourt: 'Lit', type: 'LIKERT_4', ordre: 4, attributes: ['fonctions'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq5', texte: 'Couper la viande', texteCourt: 'Couper', type: 'LIKERT_4', ordre: 5, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq6', texte: 'Soulever un verre plein à la bouche', texteCourt: 'Verre', type: 'LIKERT_4', ordre: 6, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq7', texte: 'Ouvrir un carton de lait', texteCourt: 'Ouvrir carton', type: 'LIKERT_4', ordre: 7, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq8', texte: 'Marcher à l\'extérieur sur terrain plat', texteCourt: 'Marche extérieur', type: 'LIKERT_4', ordre: 8, attributes: ['fonctions'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq9', texte: 'Monter 5 marches', texteCourt: 'Escaliers', type: 'LIKERT_4', ordre: 9, attributes: ['fonctions'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq10', texte: 'Se laver et sécher entièrement le corps', texteCourt: 'Hygiène corps', type: 'LIKERT_4', ordre: 10, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq11', texte: 'Prendre un bain', texteCourt: 'Bain', type: 'LIKERT_4', ordre: 11, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq12', texte: 'S\'asseoir et se lever des toilettes', texteCourt: 'Toilettes', type: 'LIKERT_4', ordre: 12, attributes: ['fonctions'], seuilAlerteMin: 3, alerteNiveau: 'WARNING', labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq13', texte: 'Atteindre et saisir un objet de 2 kg au-dessus de la tête', texteCourt: 'Atteindre objet', type: 'LIKERT_4', ordre: 13, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq14', texte: 'Se pencher pour ramasser des vêtements par terre', texteCourt: 'Se pencher', type: 'LIKERT_4', ordre: 14, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq15', texte: 'Ouvrir des pots déjà ouverts', texteCourt: 'Ouvrir pot', type: 'LIKERT_4', ordre: 15, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq16', texte: 'Tourner les robinets', texteCourt: 'Robinets', type: 'LIKERT_4', ordre: 16, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq17', texte: 'Faire ses courses', texteCourt: 'Courses', type: 'LIKERT_4', ordre: 17, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq18', texte: 'Entrer et sortir d\'une voiture', texteCourt: 'Voiture', type: 'LIKERT_4', ordre: 18, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq19', texte: 'Faire des tâches ménagères (aspirateur, ménage)', texteCourt: 'Ménage', type: 'LIKERT_4', ordre: 19, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
    { id: 'haq20', texte: 'Jardiner', texteCourt: 'Jardinage', type: 'LIKERT_4', ordre: 20, attributes: ['fonctions'], labelMin: 'Sans difficulté', labelMax: 'Incapable' },
  ],
};

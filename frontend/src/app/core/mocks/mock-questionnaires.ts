import { MockQuestionnaire } from '../models/user.model';

// Date de reference du projet : 2026-03-11
const TODAY = new Date('2026-03-11');

function daysAgo(n: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d;
}

// ---------------------------------------------------------------------------
// Jean DUPONT (u-jd-101) — medecin u-sm-001 — templateCode 'PHQ9'
// ---------------------------------------------------------------------------
const questionnairesJeanDupont: MockQuestionnaire[] = [
  {
    id: 'q-001',
    patientId: 'u-jd-101',
    medecinId: 'u-sm-001',
    templateCode: 'PHQ9',
    dateEnvoi: daysAgo(30),
    dateReponse: daysAgo(28),
    statut: 'COMPLETE',
    score: 72,
    niveauAlerte: 'NORMAL',
    reponses: [
      { questionId: 'q1', valeur: 2 },
      { questionId: 'q2', valeur: 1 },
      { questionId: 'q3', valeur: 2 },
      { questionId: 'q4', valeur: 1 },
      { questionId: 'q5', valeur: 2 },
      { questionId: 'q6', valeur: 1 },
      { questionId: 'q7', valeur: 2 },
      { questionId: 'q8', valeur: 1 },
      { questionId: 'q9', valeur: 0 },
    ],
  },
  {
    id: 'q-002',
    patientId: 'u-jd-101',
    medecinId: 'u-sm-001',
    templateCode: 'PHQ9',
    dateEnvoi: daysAgo(14),
    dateReponse: daysAgo(13),
    statut: 'COMPLETE',
    score: 68,
    niveauAlerte: 'NORMAL',
    reponses: [
      { questionId: 'q1', valeur: 2 },
      { questionId: 'q2', valeur: 1 },
      { questionId: 'q3', valeur: 1 },
      { questionId: 'q4', valeur: 2 },
      { questionId: 'q5', valeur: 1 },
      { questionId: 'q6', valeur: 1 },
      { questionId: 'q7', valeur: 2 },
      { questionId: 'q8', valeur: 1 },
      { questionId: 'q9', valeur: 0 },
    ],
  },
  {
    id: 'q-003',
    patientId: 'u-jd-101',
    medecinId: 'u-sm-001',
    templateCode: 'PHQ9',
    dateEnvoi: daysAgo(2),
    dateReponse: daysAgo(1),
    statut: 'COMPLETE',
    score: 75,
    niveauAlerte: 'NORMAL',
    reponses: [
      { questionId: 'q1', valeur: 2 },
      { questionId: 'q2', valeur: 2 },
      { questionId: 'q3', valeur: 2 },
      { questionId: 'q4', valeur: 1 },
      { questionId: 'q5', valeur: 2 },
      { questionId: 'q6', valeur: 1 },
      { questionId: 'q7', valeur: 2 },
      { questionId: 'q8', valeur: 2 },
      { questionId: 'q9', valeur: 0 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Marie LEBLANC (u-ml-102) — medecin u-sm-001 — templateCode 'ESAS_R'
// ---------------------------------------------------------------------------
const questionnairesMarieLebanc: MockQuestionnaire[] = [
  {
    id: 'q-004',
    patientId: 'u-ml-102',
    medecinId: 'u-sm-001',
    templateCode: 'ESAS_R',
    dateEnvoi: daysAgo(14),
    dateReponse: daysAgo(13),
    statut: 'COMPLETE',
    score: 65,
    niveauAlerte: 'ATTENTION',
    reponses: [
      { questionId: 'q_douleur', valeur: 6 },
      { questionId: 'q_fatigue', valeur: 7 },
      { questionId: 'q_nausee', valeur: 5 },
      { questionId: 'q_depression', valeur: 4 },
      { questionId: 'q_anxiete', valeur: 6 },
      { questionId: 'q_somnolence', valeur: 5 },
      { questionId: 'q_appetit', valeur: 6 },
      { questionId: 'q_bien_etre', valeur: 5 },
      { questionId: 'q_dyspnee', valeur: 4 },
      { questionId: 'q_autre', valeur: 5 },
    ],
  },
  {
    id: 'q-005',
    patientId: 'u-ml-102',
    medecinId: 'u-sm-001',
    templateCode: 'ESAS_R',
    dateEnvoi: daysAgo(1),
    dateReponse: daysAgo(1),
    statut: 'COMPLETE',
    score: 28,
    niveauAlerte: 'CRITIQUE',
    reponses: [
      { questionId: 'q_douleur', valeur: 9 },
      { questionId: 'q_fatigue', valeur: 8 },
      { questionId: 'q_nausee', valeur: 3 },
      { questionId: 'q_depression', valeur: 2 },
      { questionId: 'q_anxiete', valeur: 4 },
      { questionId: 'q_somnolence', valeur: 3 },
      { questionId: 'q_appetit', valeur: 2 },
      { questionId: 'q_bien_etre', valeur: 2 },
      { questionId: 'q_dyspnee', valeur: 2 },
      { questionId: 'q_autre', valeur: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pierre MOREAU (u-pm-103) — medecin u-kb-002 — templateCode 'PHQ9'
// ---------------------------------------------------------------------------
const questionnairesPierreMoreau: MockQuestionnaire[] = [
  {
    id: 'q-006',
    patientId: 'u-pm-103',
    medecinId: 'u-kb-002',
    templateCode: 'PHQ9',
    dateEnvoi: daysAgo(8),
    dateReponse: null,
    statut: 'EN_RETARD',
    score: null,
    niveauAlerte: null,
    reponses: [],
  },
];

// ---------------------------------------------------------------------------
// Fatima OUALI (u-fo-104) : aucun questionnaire
// ---------------------------------------------------------------------------
const questionnairesFatimaOuali: MockQuestionnaire[] = [];

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------
export const ALL_QUESTIONNAIRES: MockQuestionnaire[] = [
  ...questionnairesJeanDupont,
  ...questionnairesMarieLebanc,
  ...questionnairesPierreMoreau,
  ...questionnairesFatimaOuali,
];

export const QUESTIONNAIRES_JEAN_DUPONT = questionnairesJeanDupont;
export const QUESTIONNAIRES_MARIE_LEBLANC = questionnairesMarieLebanc;
export const QUESTIONNAIRES_PIERRE_MOREAU = questionnairesPierreMoreau;
export const QUESTIONNAIRES_FATIMA_OUALI = questionnairesFatimaOuali;

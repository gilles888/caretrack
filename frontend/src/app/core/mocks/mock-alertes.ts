import { MockAlerte } from '../models/user.model';

// Date de reference du projet : 2026-03-11
const TODAY = new Date('2026-03-11');

function daysAgo(n: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d;
}

const alertes: MockAlerte[] = [
  {
    id: 'a-001',
    patientId: 'u-ml-102',
    medecinId: 'u-sm-001',
    type: 'SCORE_CRITIQUE',
    niveau: 'CRITIQUE',
    message:
      'Douleur thoracique signalée (score 9/10) — Score ESAS-r critique : 28/100',
    dateCreation: daysAgo(1),
    dateResolution: null,
    statut: 'ACTIVE',
    lu: false,
  },
  {
    id: 'a-002',
    patientId: 'u-pm-103',
    medecinId: 'u-kb-002',
    type: 'NON_COMPLIANCE',
    niveau: 'ATTENTION',
    message:
      'Questionnaire PHQ-9 non complété depuis 8 jours — rappel envoyé',
    dateCreation: daysAgo(3),
    dateResolution: null,
    statut: 'ACTIVE',
    lu: true,
  },
  {
    id: 'a-003',
    patientId: 'u-jd-101',
    medecinId: 'u-sm-001',
    type: 'SCORE_CRITIQUE',
    niveau: 'ATTENTION',
    message: 'Score légèrement élevé (score 68) — surveillé',
    dateCreation: daysAgo(15),
    dateResolution: daysAgo(10),
    statut: 'RESOLUE',
    lu: true,
  },
];

export const ALL_ALERTES: MockAlerte[] = alertes;

export const ALERTES_ACTIVES: MockAlerte[] = alertes.filter(
  (a) => a.statut === 'ACTIVE',
);

export const ALERTES_CRITIQUES: MockAlerte[] = alertes.filter(
  (a) => a.niveau === 'CRITIQUE',
);

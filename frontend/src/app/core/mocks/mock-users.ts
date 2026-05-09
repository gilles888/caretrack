import { MockUser } from '../models/user.model';

// ---------------------------------------------------------------------------
// MEDECINS
// ---------------------------------------------------------------------------
const medecins: MockUser[] = [
  {
    id: 'u-sm-001',
    email: 'sophie.martin@caretrack.fr',
    password: 'Medecin1234!',
    role: 'MEDECIN',
    nom: 'MARTIN',
    prenom: 'Sophie',
    token: 'mock-token-medecin-u-sm-001',
    specialite: 'Cardiologie',
    nbPatients: 12,
    premiereConnexion: false,
  },
  {
    id: 'u-kb-002',
    email: 'karim.benali@caretrack.fr',
    password: 'Medecin1234!',
    role: 'MEDECIN',
    nom: 'BENALI',
    prenom: 'Karim',
    token: 'mock-token-medecin-u-kb-002',
    specialite: 'Medecine generale',
    nbPatients: 8,
    premiereConnexion: false,
  },
  {
    id: 'u-ar-003',
    email: 'anne.rousseau@caretrack.fr',
    password: 'Medecin1234!',
    role: 'MEDECIN',
    nom: 'ROUSSEAU',
    prenom: 'Anne',
    token: 'mock-token-medecin-u-ar-003',
    specialite: 'Oncologie',
    nbPatients: 5,
    premiereConnexion: true,
  },
];

// ---------------------------------------------------------------------------
// PATIENTS
// ---------------------------------------------------------------------------
const patients: MockUser[] = [
  {
    id: 'u-jd-101',
    email: 'jean.dupont@gmail.com',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'DUPONT',
    prenom: 'Jean',
    token: 'mock-token-patient-u-jd-101',
    age: 67,
    sexe: 'M',
    medecinId: 'u-sm-001',
    medecinNom: 'Dr. Sophie MARTIN',
    pathologie: 'Insuffisance cardiaque chronique',
    statut: 'ACTIF',
  },
  {
    id: 'u-ml-102',
    email: 'marie.leblanc@gmail.com',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'LEBLANC',
    prenom: 'Marie',
    token: 'mock-token-patient-u-ml-102',
    age: 54,
    sexe: 'F',
    medecinId: 'u-sm-001',
    medecinNom: 'Dr. Sophie MARTIN',
    pathologie: 'Hypertension + diabete type 2',
    statut: 'ACTIF',
  },
  {
    id: 'u-pm-103',
    email: 'pierre.moreau@hotmail.com',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'MOREAU',
    prenom: 'Pierre',
    token: 'mock-token-patient-u-pm-103',
    age: 45,
    sexe: 'M',
    medecinId: 'u-kb-002',
    medecinNom: 'Dr. Karim BENALI',
    pathologie: 'Depression post-AVC',
    statut: 'ACTIF',
  },
  {
    id: 'u-fo-104',
    email: 'fatima.ouali@gmail.com',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'OUALI',
    prenom: 'Fatima',
    token: 'mock-token-patient-u-fo-104',
    age: 38,
    sexe: 'F',
    medecinId: 'u-ar-003',
    medecinNom: 'Dr. Anne ROUSSEAU',
    pathologie: 'Suivi post-chimiotherapie',
    statut: 'ONBOARDING',
  },
  {
    id: 'u-rk-105',
    email: 'robert.klein@orange.fr',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'KLEIN',
    prenom: 'Robert',
    token: 'mock-token-patient-u-rk-105',
    age: 72,
    sexe: 'M',
    medecinId: 'u-kb-002',
    medecinNom: 'Dr. Karim BENALI',
    pathologie: undefined,
    statut: 'INACTIF',
    rgpdRetire: true,
  },
  {
    id: 'u-lb-106',
    email: 'lucie.bernard.parent@gmail.com',
    password: 'Patient1234!',
    role: 'PATIENT',
    nom: 'BERNARD',
    prenom: 'Lucie',
    token: 'mock-token-patient-u-lb-106',
    age: 16,
    sexe: 'F',
    medecinId: 'u-kb-002',
    medecinNom: 'Dr. Karim BENALI',
    pathologie: 'Epilepsie pediatrique',
    statut: 'ACTIF',
    representantLegal: true,
  },
];

// ---------------------------------------------------------------------------
// ADMINS
// ---------------------------------------------------------------------------
const admins: MockUser[] = [
  {
    id: 'u-adm-001',
    email: 'admin@caretrack.fr',
    password: 'Admin5678!',
    role: 'ADMIN',
    nom: 'Principal',
    prenom: 'Admin',
    token: 'mock-token-admin-u-adm-001',
    permissions: ['CRUD_USERS', 'STATS', 'EXPORT_RGPD', 'AUDIT_LOG'],
  },
  {
    id: 'u-adm-002',
    email: 'support@caretrack.fr',
    password: 'Support5678!',
    role: 'ADMIN_SUPPORT',
    nom: 'Support',
    prenom: 'Admin',
    token: 'mock-token-admin-u-adm-002',
    permissions: ['READ_ONLY', 'RESET_PASSWORD'],
  },
];

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------
export const ALL_USERS: MockUser[] = [...medecins, ...patients, ...admins];
export const ALL_MEDECINS = medecins;
export const ALL_PATIENTS = patients;
export const ALL_ADMINS = admins;

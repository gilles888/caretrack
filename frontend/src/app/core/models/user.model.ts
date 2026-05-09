export type UserRole = 'PATIENT' | 'MEDECIN' | 'ADMIN' | 'ADMIN_SUPPORT';
export type AlertNiveau = 'NORMAL' | 'ATTENTION' | 'CRITIQUE';
export type QStatut = 'COMPLETE' | 'EN_ATTENTE' | 'EN_RETARD';
export type AlertStatut = 'ACTIVE' | 'RESOLUE' | 'IGNOREE';
export type AlertType = 'SCORE_CRITIQUE' | 'NON_COMPLIANCE' | 'DONNEE_MANQUANTE';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  nom: string;
  prenom: string;
  token: string;
  // medecin
  specialite?: string;
  nbPatients?: number;
  premiereConnexion?: boolean;
  // patient
  age?: number;
  sexe?: 'M' | 'F';
  medecinId?: string;
  medecinNom?: string;
  pathologie?: string;
  statut?: 'ACTIF' | 'INACTIF' | 'ONBOARDING';
  rgpdRetire?: boolean;
  representantLegal?: boolean;
  // admin
  permissions?: string[];
}

export interface MockQuestionnaire {
  id: string;
  patientId: string;
  medecinId: string;
  templateCode: string;
  dateEnvoi: Date;
  dateReponse: Date | null;
  statut: QStatut;
  score: number | null;
  niveauAlerte: AlertNiveau | null;
  reponses: { questionId: string; valeur: string | number }[];
}

export interface MockAlerte {
  id: string;
  patientId: string;
  medecinId: string;
  type: AlertType;
  niveau: AlertNiveau;
  message: string;
  dateCreation: Date;
  dateResolution: Date | null;
  statut: AlertStatut;
  lu: boolean;
}

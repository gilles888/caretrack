export interface PatientSummary {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  maladie: string;
  protocole?: string;
  alerteNiveau?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface DashboardRow {
  patientId: string;
  patientNom: string;
  maladie: string;
  templateCode: string;
  templateNom: string;
  envoyeAt: string;
  completedAt?: string;
  scoreGlobal?: number;
  statut: 'CRITICAL' | 'WARNING' | 'NORMAL' | 'EN_ATTENTE';
  reponseId?: string;
  alerteId?: string;
  details?: Record<string, number>;
}

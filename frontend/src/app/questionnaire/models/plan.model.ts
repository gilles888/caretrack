export interface PlanItem {
  templateId: string;
  templateCode: string;
  templateNom: string;
  frequence: 'QUOTIDIEN' | 'HEBDO' | 'MENSUEL' | 'TRIMESTRIEL' | 'PAR_CYCLE';
  ordre: number;
  actif: boolean;
}

/** Correspond au PlanDto retourné par /api/v1/patients/{id}/questionnaires/plan */
export interface PatientPlanDto {
  id: string;
  patientId: string;
  template: {
    id: string;
    code: string;
    nom: string;
    description?: string;
    scope: string;
    frequence: string;
    dureeEstimeeMinutes?: number;
    licenceInfo?: string;
  };
  dateDebut: string;
  dateFin?: string;
  nextDueDate?: string;
  lastCompletedAt?: string;
  isActive: boolean;
}

export interface PatientQuestionnairePlan {
  id: string;
  patientId: string;
  patientNom: string;
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
  createdByMedecinId: string;
}

export interface PlanSoumission {
  patientId: string;
  items: Omit<PlanItem, 'templateNom'>[];
}

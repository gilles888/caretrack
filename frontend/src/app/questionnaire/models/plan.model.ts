export interface PlanItem {
  templateId: string;
  templateCode: string;
  templateNom: string;
  frequence: 'QUOTIDIEN' | 'HEBDO' | 'MENSUEL' | 'TRIMESTRIEL' | 'PAR_CYCLE';
  ordre: number;
  actif: boolean;
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

export type Frequence = 'QUOTIDIEN' | 'HEBDO' | 'MENSUEL' | 'TRIMESTRIEL' | 'PAR_CYCLE';

export interface PlanItemEtendu {
  templateId: string;
  templateCode: string;
  templateNom: string;
  frequence: Frequence;
  ordre: number;
  actif: boolean;
  rappelActif: boolean;
  heureRappel: Date | null;
  dureeEstimeeMinutes: number;
  licenceInfo: string;
}

export interface EntityOption {
  id: string;
  label: string;
  type: 'PATIENT' | 'PROTOCOLE';
  maladie?: string;
}

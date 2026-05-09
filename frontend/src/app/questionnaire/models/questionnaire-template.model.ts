import { QuestionItem } from './question-item.model';

export interface QuestionnaireTemplate {
  id: string;
  code: string;
  nom: string;
  description?: string;
  scope: 'CORE' | 'DISEASE_SPECIFIC';
  frequence: 'QUOTIDIEN' | 'HEBDO' | 'MENSUEL' | 'TRIMESTRIEL' | 'PAR_CYCLE';
  dureeEstimeeMinutes: number;
  licenceInfo: string;
  items: QuestionItem[];
  isDue?: boolean;
  lastCompletedAt?: string;
}

export type QuestionType = 'VAS_0_10' | 'LIKERT_4' | 'LIKERT_5' | 'YESNO' | 'TEXT';
export type AlerteNiveau = 'INFO' | 'WARNING' | 'CRITICAL';

export interface QuestionItem {
  id: string;
  texte: string;
  texteCourt?: string;
  type: QuestionType;
  ordre: number;
  attributes: string[];
  seuilAlerteMin?: number;
  alerteNiveau?: AlerteNiveau;
  labelMin?: string;
  labelMax?: string;
  isInverse?: boolean;
}

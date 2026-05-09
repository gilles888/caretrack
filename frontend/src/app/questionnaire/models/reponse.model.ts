export interface ReponseSoumission {
  templateCode: string;
  answers: Record<string, number | string | boolean>;
  dureeSecondes: number;
}

export interface ReponseDto {
  id: string;
  templateCode: string;
  templateNom: string;
  patientId: string;
  answers: Record<string, number | string | boolean>;
  dureeSecondes: number;
  createdAt: string;
  scoreGlobal?: number;
}

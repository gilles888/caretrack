export interface AlerteDto {
  id: string;
  patientNom: string;
  niveau: 'INFO' | 'WARNING' | 'CRITICAL';
  itemCode: string;
  valeurObservee: number;
  message: string;
  createdAt: string;
  isAcknowledged: boolean;
  patientId?: string;
  templateCode?: string;
}

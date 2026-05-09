import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReponseSoumission, ReponseDto } from '../models/reponse.model';

const API = '/api/v1';

@Injectable({ providedIn: 'root' })
export class ReponseService {
  private http = inject(HttpClient);

  soumettre(patientId: string, soumission: ReponseSoumission): Observable<ReponseDto> {
    return this.http.post<ReponseDto>(`${API}/patients/${patientId}/reponses`, soumission);
  }

  getReponses(patientId: string): Observable<ReponseDto[]> {
    return this.http.get<ReponseDto[]>(`${API}/patients/${patientId}/reponses`);
  }

  getReponsesParTemplate(patientId: string, templateCode: string): Observable<ReponseDto[]> {
    return this.http.get<ReponseDto[]>(`${API}/patients/${patientId}/reponses/${templateCode}`);
  }

  getDraft(templateCode: string): ReponseSoumission | null {
    const raw = localStorage.getItem(`draft_${templateCode}`);
    return raw ? JSON.parse(raw) : null;
  }

  saveDraft(templateCode: string, data: Partial<ReponseSoumission>): void {
    localStorage.setItem(`draft_${templateCode}`, JSON.stringify(data));
  }

  clearDraft(templateCode: string): void {
    localStorage.removeItem(`draft_${templateCode}`);
  }
}

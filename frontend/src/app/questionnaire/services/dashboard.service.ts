import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardRow, PatientSummary } from '../models/patient.model';

const API = '/api/v1';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getDashboardRows(): Observable<DashboardRow[]> {
    return this.http.get<DashboardRow[]>(`${API}/pro/dashboard`);
  }

  getPatient(id: string): Observable<PatientSummary> {
    return this.http.get<PatientSummary>(`${API}/patients/${id}`);
  }

  reviewReponse(reponseId: string, annotation: string): Observable<void> {
    return this.http.put<void>(`${API}/reponses/${reponseId}/review`, { annotation });
  }
}

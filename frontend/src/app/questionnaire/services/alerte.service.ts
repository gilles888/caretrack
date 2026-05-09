import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlerteDto } from '../models/alerte.model';

const API = '/api/v1';

@Injectable({ providedIn: 'root' })
export class AlerteService {
  private http = inject(HttpClient);

  getAlertes(params?: { niveau?: string; acknowledged?: boolean }): Observable<AlerteDto[]> {
    return this.http.get<AlerteDto[]>(`${API}/alertes`, { params: params as Record<string, string | boolean> });
  }

  getAlertesPatient(patientId: string): Observable<AlerteDto[]> {
    return this.http.get<AlerteDto[]>(`${API}/patients/${patientId}/alertes`);
  }

  acknowledgeAlerte(id: string): Observable<AlerteDto> {
    return this.http.patch<AlerteDto>(`${API}/alertes/${id}/acknowledge`, {});
  }

  acknowledgeAll(): Observable<void> {
    return this.http.post<void>(`${API}/alertes/acknowledge-all`, {});
  }
}

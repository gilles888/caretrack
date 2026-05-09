import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvolutionPoint {
  date: string;
  scores: Record<string, number>;
  scoreGlobal: number;
  alerteNiveaux: string[];
  reponseId: string;
}

export interface CohortePoint {
  patientId: string;
  patientNom: string;
  semaine: string;
  scoreGlobal: number;
  alerteNiveau: string | null;
}

export interface CompletionRate {
  templateCode: string;
  templateNom: string;
  tauxGlobal: number;
  parMaladie: Record<string, number>;
}

export interface AlerteTrendPoint {
  semaine: string;
  nbWarning: number;
  nbCritical: number;
  tauxCompletion: number;
}

const API = '/api/v1/analytics';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getPatientEvolution(
    patientId: string,
    templateCode: string,
    from: Date,
    to: Date
  ): Observable<EvolutionPoint[]> {
    const params = new HttpParams()
      .set('templateCode', templateCode)
      .set('from', this.toIsoDate(from))
      .set('to', this.toIsoDate(to));
    return this.http.get<EvolutionPoint[]>(`${API}/patient/${patientId}/evolution`, { params });
  }

  getCohorteData(diseaseCode: string, from: Date, to: Date): Observable<CohortePoint[]> {
    const params = new HttpParams()
      .set('diseaseCode', diseaseCode)
      .set('from', this.toIsoDate(from))
      .set('to', this.toIsoDate(to));
    return this.http.get<CohortePoint[]>(`${API}/cohorte`, { params });
  }

  getCompletionRates(from: Date, to: Date): Observable<CompletionRate[]> {
    const params = new HttpParams()
      .set('from', this.toIsoDate(from))
      .set('to', this.toIsoDate(to));
    return this.http.get<CompletionRate[]>(`${API}/completion-rate`, { params });
  }

  getAlertesTrend(from: Date, to: Date): Observable<AlerteTrendPoint[]> {
    const params = new HttpParams()
      .set('from', this.toIsoDate(from))
      .set('to', this.toIsoDate(to));
    return this.http.get<AlerteTrendPoint[]>(`${API}/alertes-trend`, { params });
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}

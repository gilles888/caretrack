import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionnaireTemplate } from '../models/questionnaire-template.model';

const API = '/api/v1';

@Injectable({ providedIn: 'root' })
export class QuestionnaireService {
  private http = inject(HttpClient);

  getTemplates(): Observable<QuestionnaireTemplate[]> {
    return this.http.get<QuestionnaireTemplate[]>(`${API}/questionnaires`);
  }

  getTemplate(id: string): Observable<QuestionnaireTemplate> {
    return this.http.get<QuestionnaireTemplate>(`${API}/questionnaires/${id}`);
  }

  getTemplateByCode(code: string): Observable<QuestionnaireTemplate> {
    return this.http.get<QuestionnaireTemplate>(`${API}/questionnaires/code/${code}`);
  }

  getTemplatesByDisease(diseaseCode: string): Observable<QuestionnaireTemplate[]> {
    const params = new HttpParams().set('diseaseCode', diseaseCode);
    return this.http.get<QuestionnaireTemplate[]>(`${API}/questionnaires`, { params });
  }

  getPatientDueTemplates(patientId: string): Observable<QuestionnaireTemplate[]> {
    return this.http.get<QuestionnaireTemplate[]>(`${API}/patients/${patientId}/questionnaires/due`);
  }
}

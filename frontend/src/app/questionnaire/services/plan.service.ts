import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientQuestionnairePlan, PatientPlanDto, PlanSoumission } from '../models/plan.model';

const API = '/api/v1';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);

  getPlanPatient(patientId: string): Observable<PatientQuestionnairePlan> {
    return this.http.get<PatientQuestionnairePlan>(`${API}/patients/${patientId}/plan`);
  }

  getPlansActifsPatient(patientId: string): Observable<PatientPlanDto[]> {
    return this.http.get<PatientPlanDto[]>(`${API}/patients/${patientId}/questionnaires/plan`);
  }

  savePlan(soumission: PlanSoumission): Observable<PatientQuestionnairePlan> {
    return this.http.post<PatientQuestionnairePlan>(`${API}/plans`, soumission);
  }

  updatePlan(planId: string, soumission: PlanSoumission): Observable<PatientQuestionnairePlan> {
    return this.http.put<PatientQuestionnairePlan>(`${API}/plans/${planId}`, soumission);
  }

  deletePlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${API}/plans/${planId}`);
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockUser, MockQuestionnaire, MockAlerte } from '../models/user.model';
import { ALL_USERS, ALL_PATIENTS } from './mock-users';
import { ALL_QUESTIONNAIRES } from './mock-questionnaires';
import { ALL_ALERTES } from './mock-alertes';
import { MOCK_TEMPLATE_MAP } from './mock-templates';
import { DashboardRow, PatientSummary } from '../../questionnaire/models/patient.model';
import { ReponseDto, ReponseSoumission } from '../../questionnaire/models/reponse.model';
import { PatientQuestionnairePlan } from '../../questionnaire/models/plan.model';
import { QuestionnaireTemplate } from '../../questionnaire/models/questionnaire-template.model';

export interface DashboardStats {
  totalPatients: number;
  alertesCritiques: number;
  questionnairesEnAttente: number;
  tauxCompliance: number;
}

// Structure persistée dans localStorage pour chaque soumission patient
interface StoredSub {
  id: string;
  patientId: string;
  templateCode: string;
  submittedAt: string; // ISO
  scoreGlobal: number;
  answers: Record<string, number | string | boolean>;
  dureeSecondes: number;
}

const SUBS_KEY = 'ct_mock_subs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // -------------------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------------------

  login(email: string, password: string): Observable<MockUser> {
    const user = ALL_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      return throwError(() => new Error('Identifiants invalides.')).pipe(
        delay(300),
      );
    }

    // Persistance dans localStorage (cles identiques a l'auth guard existant)
    localStorage.setItem('access_token', user.token);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_nom', `${user.prenom} ${user.nom}`);

    return of(user).pipe(delay(300));
  }

  getMe(): MockUser | null {
    const id = localStorage.getItem('user_id');
    if (!id) return null;
    return ALL_USERS.find((u) => u.id === id) ?? null;
  }

  // -------------------------------------------------------------------------
  // PATIENTS
  // -------------------------------------------------------------------------

  getPatientsByMedecin(medecinId: string): Observable<MockUser[]> {
    const result = ALL_PATIENTS.filter((p) => p.medecinId === medecinId);
    return of(result).pipe(delay(200));
  }

  getPatient(id: string): Observable<MockUser | undefined> {
    const result = ALL_USERS.find((u) => u.id === id);
    return of(result).pipe(delay(200));
  }

  // -------------------------------------------------------------------------
  // QUESTIONNAIRES
  // -------------------------------------------------------------------------

  getQuestionnairesPatient(patientId: string): Observable<MockQuestionnaire[]> {
    const staticQ = ALL_QUESTIONNAIRES.filter(q => q.patientId === patientId);
    const storedQ = this.getStoredSubs()
      .filter(s => s.patientId === patientId)
      .map<MockQuestionnaire>(s => ({
        id: s.id,
        patientId: s.patientId,
        medecinId: '',
        templateCode: s.templateCode,
        dateEnvoi: new Date(s.submittedAt),
        dateReponse: new Date(s.submittedAt),
        statut: 'COMPLETE',
        score: s.scoreGlobal * 10,
        niveauAlerte: null,
        reponses: Object.entries(s.answers).map(([questionId, valeur]) => ({
          questionId,
          valeur: typeof valeur === 'boolean' ? (valeur ? 1 : 0) : valeur,
        })),
      }));
    return of([...staticQ, ...storedQ]).pipe(delay(200));
  }

  /** Codes de templates soumis récemment par ce patient (depuis localStorage) */
  getSubmittedCodesForPatient(patientId: string): string[] {
    return this.getStoredSubs()
      .filter(s => s.patientId === patientId)
      .map(s => s.templateCode);
  }

  private getStoredSubs(): StoredSub[] {
    try {
      return JSON.parse(localStorage.getItem(SUBS_KEY) ?? '[]') as StoredSub[];
    } catch {
      return [];
    }
  }

  getQuestionnairesEnRetard(): Observable<MockQuestionnaire[]> {
    const result = ALL_QUESTIONNAIRES.filter(
      (q) => q.statut === 'EN_RETARD',
    );
    return of(result).pipe(delay(200));
  }

  // -------------------------------------------------------------------------
  // ALERTES
  // -------------------------------------------------------------------------

  getAlertes(medecinId: string): Observable<MockAlerte[]> {
    const result = ALL_ALERTES.filter((a) => a.medecinId === medecinId);
    return of(result).pipe(delay(300));
  }

  getAlertesActives(medecinId: string): Observable<MockAlerte[]> {
    const result = ALL_ALERTES.filter(
      (a) => a.medecinId === medecinId && a.statut === 'ACTIVE',
    );
    return of(result).pipe(delay(300));
  }

  // -------------------------------------------------------------------------
  // DASHBOARD ROWS (vue pro)
  // -------------------------------------------------------------------------

  getDashboardRows(medecinId?: string): Observable<DashboardRow[]> {
    const currentId = medecinId ?? localStorage.getItem('user_id') ?? '';
    const currentRole = localStorage.getItem('user_role') ?? '';
    const isAdmin = currentRole === 'ADMIN' || currentRole === 'ADMIN_SUPPORT';
    const patients = isAdmin
      ? ALL_PATIENTS
      : ALL_PATIENTS.filter(p => p.medecinId === currentId);
    const patientIds = new Set(patients.map(p => p.id));
    const qs = ALL_QUESTIONNAIRES.filter(q => patientIds.has(q.patientId));

    const rows: DashboardRow[] = qs.map(q => {
      const patient = ALL_PATIENTS.find(p => p.id === q.patientId);
      const alerte = ALL_ALERTES.find(a => a.patientId === q.patientId && a.statut === 'ACTIVE');

      let statut: DashboardRow['statut'] = 'EN_ATTENTE';
      if (q.statut === 'COMPLETE') {
        if (q.niveauAlerte === 'CRITIQUE') statut = 'CRITICAL';
        else if (q.niveauAlerte === 'ATTENTION') statut = 'WARNING';
        else statut = 'NORMAL';
      }

      return {
        patientId: q.patientId,
        patientNom: patient ? `${patient.prenom} ${patient.nom}` : q.patientId,
        maladie: patient?.pathologie ?? '—',
        templateCode: q.templateCode,
        templateNom: q.templateCode,
        envoyeAt: q.dateEnvoi.toISOString(),
        completedAt: q.dateReponse?.toISOString(),
        scoreGlobal: q.score ?? undefined,
        statut,
        reponseId: q.id,
        alerteId: alerte?.id,
      };
    });

    return of(rows).pipe(delay(300));
  }

  // -------------------------------------------------------------------------
  // STATS (dashboard)
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // PATIENT DETAIL (dossier médecin)
  // -------------------------------------------------------------------------

  getPatientSummary(id: string): Observable<PatientSummary | null> {
    const user = ALL_PATIENTS.find(p => p.id === id);
    if (!user) return of(null).pipe(delay(200));
    const year = new Date().getFullYear() - (user.age ?? 40);
    const alerte = ALL_ALERTES.find(a => a.patientId === id && a.statut === 'ACTIVE');
    const alerteNiveau = alerte
      ? (alerte.niveau === 'CRITIQUE' ? 'CRITICAL' : alerte.niveau === 'ATTENTION' ? 'WARNING' : 'INFO')
      : undefined;
    const summary: PatientSummary = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      dateNaissance: `${year}-06-15`,
      maladie: user.pathologie ?? '—',
      alerteNiveau: alerteNiveau as PatientSummary['alerteNiveau'],
    };
    return of(summary).pipe(delay(200));
  }

  getReponsesDto(patientId: string): Observable<ReponseDto[]> {
    const qs = ALL_QUESTIONNAIRES.filter(
      q => q.patientId === patientId && q.statut === 'COMPLETE',
    );
    const dtos: ReponseDto[] = qs.map(q => ({
      id: q.id,
      templateCode: q.templateCode,
      templateNom: q.templateCode,
      patientId: q.patientId,
      answers: Object.fromEntries(q.reponses.map(r => [r.questionId, r.valeur])),
      dureeSecondes: 300,
      createdAt: (q.dateReponse ?? q.dateEnvoi).toISOString(),
      scoreGlobal: q.score !== null ? Math.round(q.score / 10) : undefined,
    }));
    return of(
      dtos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ).pipe(delay(200));
  }

  getPlanPatient(patientId: string): Observable<PatientQuestionnairePlan | null> {
    const patient = ALL_PATIENTS.find(p => p.id === patientId);
    if (!patient) return of(null).pipe(delay(200));
    const codes = [...new Set(
      ALL_QUESTIONNAIRES.filter(q => q.patientId === patientId).map(q => q.templateCode),
    )];
    const plan: PatientQuestionnairePlan = {
      id: `plan-${patientId}`,
      patientId,
      patientNom: `${patient.prenom} ${patient.nom}`,
      items: codes.map((code, i) => ({
        templateId: `tpl-${code.toLowerCase()}`,
        templateCode: code,
        templateNom: code,
        frequence: 'HEBDO',
        ordre: i + 1,
        actif: true,
      })),
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date('2026-01-01').toISOString(),
      createdByMedecinId: patient.medecinId ?? '',
    };
    return of(plan).pipe(delay(200));
  }

  reviewReponse(_reponseId: string, _annotation: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  // -------------------------------------------------------------------------
  // TEMPLATES (wizard patient)
  // -------------------------------------------------------------------------

  getTemplateByCode(code: string): Observable<QuestionnaireTemplate> {
    const template = MOCK_TEMPLATE_MAP[code];
    if (!template) {
      return throwError(() => new Error(`Template ${code} non trouvé`)).pipe(delay(200));
    }
    return of(template).pipe(delay(200));
  }

  soumettreReponse(patientId: string, soumission: ReponseSoumission): Observable<ReponseDto> {
    const values = Object.values(soumission.answers)
      .map(v => (typeof v === 'number' ? v : 0))
      .filter(v => v > 0);
    const scoreGlobal = values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
    const reponse: ReponseDto = {
      id: `r-${Date.now()}`,
      templateCode: soumission.templateCode,
      templateNom: soumission.templateCode,
      patientId,
      answers: soumission.answers,
      dureeSecondes: soumission.dureeSecondes,
      createdAt: new Date().toISOString(),
      scoreGlobal,
    };

    // Persistance localStorage pour que la page patient se mette à jour
    const stored: StoredSub = {
      id: reponse.id,
      patientId,
      templateCode: soumission.templateCode,
      submittedAt: reponse.createdAt,
      scoreGlobal,
      answers: soumission.answers,
      dureeSecondes: soumission.dureeSecondes,
    };
    const subs = this.getStoredSubs();
    subs.push(stored);
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));

    return of(reponse).pipe(delay(500));
  }

  // -------------------------------------------------------------------------
  // STATS (dashboard)
  // -------------------------------------------------------------------------

  getStats(medecinId: string): Observable<DashboardStats> {
    const patients = ALL_PATIENTS.filter((p) => p.medecinId === medecinId);
    const totalPatients = patients.length;

    const alertesCritiques = ALL_ALERTES.filter(
      (a) =>
        a.medecinId === medecinId &&
        a.niveau === 'CRITIQUE' &&
        a.statut === 'ACTIVE',
    ).length;

    const patientIds = patients.map((p) => p.id);
    const questionnairesRelevants = ALL_QUESTIONNAIRES.filter((q) =>
      patientIds.includes(q.patientId),
    );

    const questionnairesEnAttente = questionnairesRelevants.filter(
      (q) => q.statut === 'EN_ATTENTE' || q.statut === 'EN_RETARD',
    ).length;

    const total = questionnairesRelevants.length;
    const completes = questionnairesRelevants.filter(
      (q) => q.statut === 'COMPLETE',
    ).length;
    const tauxCompliance =
      total > 0 ? Math.round((completes / total) * 100) : 0;

    const stats: DashboardStats = {
      totalPatients,
      alertesCritiques,
      questionnairesEnAttente,
      tauxCompliance,
    };

    return of(stats).pipe(delay(300));
  }
}

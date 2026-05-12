import { Injectable, inject, signal, computed, effect, linkedSignal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { QuestionnaireTemplate } from '../models/questionnaire-template.model';
import { AlerteDto } from '../models/alerte.model';
import { PatientPlanDto } from '../models/plan.model';
import { QuestionnaireService } from '../services/questionnaire.service';
import { AlerteService } from '../services/alerte.service';
import { PlanService } from '../services/plan.service';

@Injectable({ providedIn: 'root' })
export class QuestionnaireStore {
  private questionnaireService = inject(QuestionnaireService);
  private alerteService = inject(AlerteService);
  private planService = inject(PlanService);

  // State signals
  readonly templates = signal<QuestionnaireTemplate[]>([]);
  readonly alertes = signal<AlerteDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly alertesCritiques = computed(() =>
    this.alertes().filter(a => a.niveau === 'CRITICAL')
  );

  readonly alertesWarning = computed(() =>
    this.alertes().filter(a => a.niveau === 'WARNING')
  );

  readonly alertesNonAcquittees = computed(() =>
    this.alertes().filter(a => !a.isAcknowledged)
  );

  readonly dueCount = computed(() =>
    this.templates().filter(t => t.isDue).length
  );

  readonly templatesCore = computed(() =>
    this.templates().filter(t => t.scope === 'CORE')
  );

  // linkedSignal — état dérivé writable (stable v20)
  readonly selectedTemplate = linkedSignal<QuestionnaireTemplate | null>(
    () => this.templates()[0] ?? null
  );

  // effect — log alertes critiques (stable v20)
  private readonly critiquesEffect = effect(() => {
    const count = this.alertesCritiques().length;
    if (count > 0) {
      console.warn(`[CareTrack] ${count} alerte(s) critique(s) non traitée(s)`);
    }
  });

  loadTemplates(submittedCodes: string[] = [], patientId?: string): void {
    this.loading.set(true);
    this.error.set(null);

    if (patientId) {
      // Charger les templates et les plans actifs en parallèle
      forkJoin({
        templates: this.questionnaireService.getTemplates(),
        plans: this.planService.getPlansActifsPatient(patientId),
      }).subscribe({
        next: ({ templates, plans }) => {
          const now = new Date();
          // Indexer les plans par code template pour lookup O(1)
          const planByCode = new Map<string, PatientPlanDto>(
            plans.map(p => [p.template.code, p])
          );
          const withDue = templates.map(t => {
            const plan = planByCode.get(t.code);
            const nextDueDate = plan?.nextDueDate ?? undefined;
            return {
              ...t,
              nextDueDate,
              isDue: !!nextDueDate
                && new Date(nextDueDate) <= now
                && !submittedCodes.includes(t.code),
            };
          });
          this.templates.set(withDue);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Erreur chargement templates');
          this.loading.set(false);
        },
      });
    } else {
      // Fallback sans contexte patient : isDue non calculable depuis le backend
      this.questionnaireService.getTemplates().subscribe({
        next: (data) => {
          this.templates.set(data.map(t => ({ ...t, isDue: false })));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Erreur chargement templates');
          this.loading.set(false);
        },
      });
    }
  }

  markSubmitted(code: string): void {
    this.templates.update(list =>
      list.map(t =>
        t.code === code
          ? { ...t, isDue: false, lastCompletedAt: new Date().toISOString() }
          : t,
      ),
    );
  }

  loadAlertes(): void {
    this.loading.set(true);
    this.alerteService.getAlertes().subscribe({
      next: (data) => {
        this.alertes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Erreur chargement alertes');
        this.loading.set(false);
      },
    });
  }

  acknowledgeAlerte(id: string): void {
    this.alerteService.acknowledgeAlerte(id).subscribe({
      next: () => {
        this.alertes.update(list =>
          list.map(a => a.id === id ? { ...a, isAcknowledged: true } : a)
        );
      },
      error: (err) => {
        this.error.set(err.message ?? 'Erreur acquittement alerte');
      },
    });
  }

  selectTemplate(template: QuestionnaireTemplate): void {
    this.selectedTemplate.set(template);
  }

  clearError(): void {
    this.error.set(null);
  }
}

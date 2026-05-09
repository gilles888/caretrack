import { Injectable, inject, signal, computed } from '@angular/core';
import { QuestionnaireService } from '../services/questionnaire.service';
import { PlanService } from '../services/plan.service';
import { QuestionnaireTemplate } from '../models/questionnaire-template.model';
import { PlanItemEtendu, Frequence } from '../models/plan-builder.model';

type FreqMultiplier = Record<Frequence, number>;

const FREQ_MULTIPLIER: FreqMultiplier = {
  QUOTIDIEN: 7,
  HEBDO: 1,
  MENSUEL: 0.25,
  TRIMESTRIEL: 0.077,
  PAR_CYCLE: 0.25,
};

@Injectable({ providedIn: 'root' })
export class PlanBuilderStore {
  private readonly questionnaireService = inject(QuestionnaireService);
  private readonly planService = inject(PlanService);

  readonly selectedEntityId = signal<string | null>(null);
  readonly planItems = signal<PlanItemEtendu[]>([]);
  readonly availableTemplates = signal<QuestionnaireTemplate[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly isDirty = signal(false);

  /** Durée totale hebdomadaire en minutes */
  readonly totalDureeHebdo = computed(() =>
    this.planItems().reduce((acc, item) => {
      const mult = FREQ_MULTIPLIER[item.frequence] ?? 1;
      return acc + item.dureeEstimeeMinutes * mult;
    }, 0)
  );

  readonly totalDureeFormatted = computed(() => {
    const min = Math.round(this.totalDureeHebdo());
    if (min < 60) return `${min} min/sem`;
    return `${Math.floor(min / 60)}h${(min % 60).toString().padStart(2, '0')}/sem`;
  });

  /** Items groupés par fréquence */
  readonly itemsByFrequence = computed(() => {
    const result: Record<Frequence, PlanItemEtendu[]> = {
      QUOTIDIEN: [],
      HEBDO: [],
      MENSUEL: [],
      TRIMESTRIEL: [],
      PAR_CYCLE: [],
    };
    this.planItems().forEach(item => {
      result[item.frequence].push(item);
    });
    // Trier par ordre dans chaque groupe
    (Object.keys(result) as Frequence[]).forEach(k => {
      result[k].sort((a, b) => a.ordre - b.ordre);
    });
    return result;
  });

  /** Template IDs déjà dans le plan */
  readonly planTemplateIds = computed(() =>
    new Set(this.planItems().map(i => i.templateId))
  );

  loadTemplates(): void {
    this.loading.set(true);
    this.questionnaireService.getTemplates().subscribe({
      next: (t) => {
        this.availableTemplates.set(t);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadPlanForPatient(patientId: string): void {
    this.selectedEntityId.set(patientId);
    this.planService.getPlanPatient(patientId).subscribe({
      next: (plan) => {
        const items: PlanItemEtendu[] = plan.items.map(i => {
          const tpl = this.availableTemplates().find(t => t.id === i.templateId);
          return {
            ...i,
            rappelActif: false,
            heureRappel: null,
            dureeEstimeeMinutes: tpl?.dureeEstimeeMinutes ?? 10,
            licenceInfo: tpl?.licenceInfo ?? '',
          };
        });
        this.planItems.set(items);
        this.isDirty.set(false);
      },
      error: () => {
        this.planItems.set([]);
        this.isDirty.set(false);
      },
    });
  }

  addTemplate(template: QuestionnaireTemplate, frequence: Frequence): void {
    if (this.planTemplateIds().has(template.id)) return;
    const newItem: PlanItemEtendu = {
      templateId: template.id,
      templateCode: template.code,
      templateNom: template.nom,
      frequence,
      ordre: this.planItems().length,
      actif: true,
      rappelActif: false,
      heureRappel: null,
      dureeEstimeeMinutes: template.dureeEstimeeMinutes,
      licenceInfo: template.licenceInfo,
    };
    this.planItems.update(items => [...items, newItem]);
    this.isDirty.set(true);
  }

  removeItem(templateId: string): void {
    this.planItems.update(items => items.filter(i => i.templateId !== templateId));
    this.isDirty.set(true);
  }

  updateItemFrequence(templateId: string, frequence: Frequence): void {
    this.planItems.update(items =>
      items.map(i => i.templateId === templateId ? { ...i, frequence } : i)
    );
    this.isDirty.set(true);
  }

  reorderItems(items: PlanItemEtendu[]): void {
    const reindexed = items.map((item, i) => ({ ...item, ordre: i }));
    this.planItems.set(reindexed);
    this.isDirty.set(true);
  }

  savePlan(patientId: string): void {
    this.saving.set(true);
    const soumission = {
      patientId,
      items: this.planItems().map(({ templateId, templateCode, frequence, ordre, actif }) => ({
        templateId,
        templateCode,
        frequence,
        ordre,
        actif,
      })),
    };
    this.planService.savePlan(soumission).subscribe({
      next: () => {
        this.isDirty.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Erreur sauvegarde');
        this.saving.set(false);
      },
    });
  }

  reset(): void {
    this.planItems.set([]);
    this.isDirty.set(false);
  }
}

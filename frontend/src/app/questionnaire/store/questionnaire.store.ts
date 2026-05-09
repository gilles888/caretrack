import { Injectable, inject, signal, computed, effect, linkedSignal } from '@angular/core';
import { QuestionnaireTemplate } from '../models/questionnaire-template.model';
import { AlerteDto } from '../models/alerte.model';
import { QuestionnaireService } from '../services/questionnaire.service';
import { AlerteService } from '../services/alerte.service';

@Injectable({ providedIn: 'root' })
export class QuestionnaireStore {
  private questionnaireService = inject(QuestionnaireService);
  private alerteService = inject(AlerteService);

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

  loadTemplates(submittedCodes: string[] = []): void {
    this.loading.set(true);
    this.error.set(null);
    this.questionnaireService.getTemplates().subscribe({
      next: (data) => {
        const withDue = data.map((t, i) => ({
          ...t,
          isDue: i < 5 && !submittedCodes.includes(t.code),
        }));
        this.templates.set(withDue);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Erreur chargement templates');
        this.loading.set(false);
      },
    });
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

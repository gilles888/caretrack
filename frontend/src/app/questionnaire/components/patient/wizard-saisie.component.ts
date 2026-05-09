import {
  Component, inject, signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockDataService } from '../../../core/mocks/mock-data.service';
import { ReponseService } from '../../services/reponse.service';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { QuestionnaireTemplate } from '../../models/questionnaire-template.model';
import { QuestionItem } from '../../models/question-item.model';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { QuestionItemComponent } from './question-item.component';

@Component({
  selector: 'app-wizard-saisie',
  imports: [TranslateModule, ButtonModule, ProgressBarModule, CardModule, MessageModule, QuestionItemComponent],
  template: `
    <div class="wizard-container min-h-dvh bg-gray-50 flex flex-col">

      <!-- Header fixe -->
      <div class="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div class="max-w-2xl mx-auto space-y-2">
          <div class="flex items-center justify-between">
            <h1 class="text-base font-semibold text-caretrack-navy truncate">
              {{ template()?.nom ?? ('common.loading' | translate) }}
            </h1>
            <span class="text-xs text-gray-400 flex-shrink-0 ml-2"
                  [attr.aria-label]="'patient.wizard.timer' | translate">
              ⏱ {{ elapsedFormatted() }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <p-progressBar
              [value]="progressPercent()"
              [showValue]="false"
              styleClass="flex-1 h-2"
            />
            <span class="text-xs text-gray-500 flex-shrink-0">
              {{ currentStep() + 1 }}/{{ totalItems() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Corps principal -->
      <div class="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">

        @if (loading()) {
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center text-gray-400">
              <i class="pi pi-spin pi-spinner text-4xl mb-3 block"></i>
              <p>{{ 'patient.wizard.loading' | translate }}</p>
            </div>
          </div>
        } @else if (currentItem()) {
          <div class="flex-1 flex flex-col gap-6">

            <!-- Question -->
            <div
              role="group"
              [attr.aria-labelledby]="'question-' + currentItem()!.id"
              class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
            >
              <p
                [id]="'question-' + currentItem()!.id"
                class="text-lg font-medium text-caretrack-navy mb-6 leading-snug"
              >
                {{ currentItem()!.texte }}
              </p>

              <app-question-item
                [item]="currentItem()!"
                [value]="currentAnswer()"
                (answered)="onAnswered($event)"
              />
            </div>

            <!-- Spacer -->
            <div class="flex-1"></div>

            <!-- Navigation -->
            <div class="flex gap-3 pb-4">
              <p-button
                [label]="'patient.wizard.prev' | translate"
                icon="pi pi-arrow-left"
                [outlined]="true"
                [disabled]="currentStep() === 0"
                (click)="prevStep()"
                class="flex-1"
                styleClass="w-full"
                size="large"
              />
              @if (!isLastStep()) {
                <p-button
                  [label]="'patient.wizard.next' | translate"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  [disabled]="!isCurrentAnswered()"
                  (click)="nextStep()"
                  class="flex-1"
                  styleClass="w-full"
                  size="large"
                />
              } @else {
                <p-button
                  [label]="'patient.wizard.send' | translate"
                  icon="pi pi-send"
                  iconPos="right"
                  severity="success"
                  [disabled]="!isCurrentAnswered()"
                  [loading]="submitting()"
                  (click)="submit()"
                  class="flex-1"
                  styleClass="w-full"
                  size="large"
                />
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class WizardSaisieComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockService = inject(MockDataService);
  private readonly reponseService = inject(ReponseService);
  private readonly store = inject(QuestionnaireStore);
  private readonly translate = inject(TranslateService);

  protected readonly template = signal<QuestionnaireTemplate | null>(null);
  protected readonly currentStep = signal(0);
  protected readonly answers = signal<Map<string, number | string | boolean>>(new Map());
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);

  private readonly startTime = Date.now();
  private readonly elapsed = signal(0);
  private elapsedInterval?: ReturnType<typeof setInterval>;
  private draftInterval?: ReturnType<typeof setInterval>;

  private readonly patientId = localStorage.getItem('user_id') ?? '';
  private readonly code = this.route.snapshot.params['code'] as string;

  protected readonly totalItems = computed(() => this.template()?.items.length ?? 0);

  protected readonly currentItem = computed<QuestionItem | null>(() => {
    const items = this.template()?.items ?? [];
    const sorted = [...items].sort((a, b) => a.ordre - b.ordre);
    return sorted[this.currentStep()] ?? null;
  });

  protected readonly currentAnswer = computed(() => {
    const item = this.currentItem();
    if (!item) return null;
    return this.answers().get(item.id) ?? null;
  });

  protected readonly progressPercent = computed(() => {
    if (this.totalItems() === 0) return 0;
    return Math.round(((this.currentStep() + 1) / this.totalItems()) * 100);
  });

  protected readonly isLastStep = computed(() =>
    this.currentStep() === this.totalItems() - 1
  );

  protected readonly elapsedFormatted = computed(() => {
    const s = this.elapsed();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.loadTemplate();
    this.elapsedInterval = setInterval(() => {
      this.elapsed.update(s => s + 1);
    }, 1000);
    this.draftInterval = setInterval(() => this.saveDraft(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.elapsedInterval);
    clearInterval(this.draftInterval);
  }

  protected isCurrentAnswered(): boolean {
    const item = this.currentItem();
    if (!item) return false;
    const val = this.answers().get(item.id);
    return val !== undefined && val !== null && val !== '';
  }

  protected onAnswered(event: { itemId: string; value: number | string | boolean }): void {
    this.answers.update(map => {
      const next = new Map(map);
      next.set(event.itemId, event.value);
      return next;
    });
  }

  protected nextStep(): void {
    if (this.currentStep() < this.totalItems() - 1) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    const answers: Record<string, number | string | boolean> = {};
    this.answers().forEach((v, k) => { answers[k] = v; });
    const soumission = {
      templateCode: this.code,
      answers,
      dureeSecondes: Math.floor((Date.now() - this.startTime) / 1000),
    };
    this.mockService.soumettreReponse(this.patientId, soumission).subscribe({
      next: () => {
        this.reponseService.clearDraft(this.code);
        this.store.markSubmitted(this.code);
        this.router.navigate(['/patient/questionnaires/success'], {
          state: { code: this.code, answers },
        });
      },
      error: () => {
        this.submitting.set(false);
        this.saveDraft();
      },
    });
  }

  // Pour planDirtyGuard
  hasUnsavedChanges(): boolean {
    return this.answers().size > 0 && !this.submitting();
  }

  private loadTemplate(): void {
    this.loading.set(true);
    this.mockService.getTemplateByCode(this.code).subscribe({
      next: (t) => {
        this.template.set(t);
        this.restoreDraft();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/patient/questionnaires']);
      },
    });
  }

  private saveDraft(): void {
    if (this.answers().size === 0) return;
    const answers: Record<string, number | string | boolean> = {};
    this.answers().forEach((v, k) => { answers[k] = v; });
    this.reponseService.saveDraft(this.code, {
      templateCode: this.code,
      answers,
      dureeSecondes: Math.floor((Date.now() - this.startTime) / 1000),
    });
  }

  private restoreDraft(): void {
    const draft = this.reponseService.getDraft(this.code);
    if (!draft?.answers) return;
    const map = new Map<string, number | string | boolean>();
    Object.entries(draft.answers).forEach(([k, v]) => map.set(k, v));
    this.answers.set(map);
    const items = [...(this.template()?.items ?? [])].sort((a, b) => a.ordre - b.ordre);
    const firstUnanswered = items.findIndex(i => !map.has(i.id));
    if (firstUnanswered > 0) {
      this.currentStep.set(firstUnanswered);
    }
  }
}

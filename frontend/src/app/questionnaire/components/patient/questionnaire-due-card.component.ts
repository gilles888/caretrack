import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionnaireTemplate } from '../../models/questionnaire-template.model';
import { ReponseService } from '../../services/reponse.service';
import { MOCK_TEMPLATE_MAP, PATIENT_FRIENDLY_NAMES, QUESTION_COUNTS } from '../../../core/mocks/mock-templates';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

type FrequenceSeverity = 'info' | 'secondary' | 'success' | 'warn' | 'danger';

const FREQUENCE_SEVERITY: Record<string, FrequenceSeverity> = {
  QUOTIDIEN:   'info',
  HEBDO:       'secondary',
  MENSUEL:     'success',
  TRIMESTRIEL: 'warn',
  PAR_CYCLE:   'secondary',
};

const TYPE_ICON: Record<string, string> = {
  CORE:             '🩺',
  DISEASE_SPECIFIC: '💊',
};

@Component({
  selector: 'app-questionnaire-due-card',
  imports: [RouterLink, TranslateModule, ButtonModule, BadgeModule, ProgressBarModule, TagModule],
  template: `
    <!-- RouterLink sur le div : navigation déclarative, pas de Promise/AbortError -->
    <div
      [routerLink]="['/patient/questionnaires', template().code]"
      class="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
      [class.border-red-300]="isOverdue()"
      [class.border-slate-200]="!isOverdue()"
    >
      <!-- Top row -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span class="text-2xl flex-shrink-0">{{ typeIcon() }}</span>
          <div class="min-w-0">
            <h3 class="font-semibold text-caretrack-navy truncate text-sm md:text-base">
              {{ friendlyName() }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              @if (questionCount() > 0) {
                {{ questionCount() }} {{ 'patient.card.questions' | translate }} ·
              }
              ~{{ template().dureeEstimeeMinutes }} min
            </p>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <p-tag
            [value]="frequenceLabel()"
            [severity]="frequenceSeverity()"
            class="text-xs"
          />
          @if (isOverdue()) {
            <p-badge [value]="'patient.card.overdue' | translate" severity="danger" class="text-xs" />
          }
        </div>
      </div>

      <!-- Draft progress -->
      @if (draftProgress() > 0) {
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ 'patient.card.inProgress' | translate }}</span>
            <span>{{ draftProgress() }}%</span>
          </div>
          <p-progressBar
            [value]="draftProgress()"
            [showValue]="false"
            styleClass="h-1.5"
          />
        </div>
      }

      <!-- Bouton visuel (clic bulle vers le div[routerLink]) -->
      <div class="flex justify-end">
        <p-button
          [label]="draftProgress() > 0 ? ('patient.card.continue' | translate) : ('patient.card.start' | translate)"
          [severity]="draftProgress() > 0 ? 'secondary' : 'primary'"
          [icon]="draftProgress() > 0 ? 'pi pi-play' : 'pi pi-arrow-right'"
          iconPos="right"
          size="small"
        />
      </div>
    </div>
  `,
})
export class QuestionnaireDueCardComponent {
  readonly template  = input.required<QuestionnaireTemplate>();
  readonly isOverdue = input<boolean>(false);

  private readonly reponseService = inject(ReponseService);
  private readonly translate = inject(TranslateService);

  protected readonly friendlyName = computed(() => {
    const code       = this.template().code;
    const normalized = code.replace(/-/g, '_').toUpperCase();
    return PATIENT_FRIENDLY_NAMES[code]
        ?? PATIENT_FRIENDLY_NAMES[normalized]
        ?? this.translate.instant('patient.card.defaultName');
  });

  protected readonly questionCount = computed(() => {
    const code       = this.template().code;
    const normalized = code.replace(/-/g, '_').toUpperCase();
    return this.template().items?.length
        ?? MOCK_TEMPLATE_MAP[code]?.items.length
        ?? MOCK_TEMPLATE_MAP[normalized]?.items.length
        ?? QUESTION_COUNTS[code]
        ?? QUESTION_COUNTS[normalized]
        ?? 0;
  });

  protected readonly typeIcon = computed(() =>
    TYPE_ICON[this.template().scope] ?? '📋'
  );

  protected readonly frequenceLabel = computed(() => {
    const key = `patient.card.freq.${this.template().frequence}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : this.template().frequence;
  });

  protected readonly frequenceSeverity = computed((): FrequenceSeverity =>
    FREQUENCE_SEVERITY[this.template().frequence] ?? 'secondary'
  );

  protected readonly draftProgress = computed(() => {
    const draft    = this.reponseService.getDraft(this.template().code);
    if (!draft?.answers) return 0;
    const answered = Object.keys(draft.answers).length;
    const total    = this.questionCount();
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  });
}

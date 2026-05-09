import { Component, input, output, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionItem } from '../../models/question-item.model';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-question-item',
  imports: [FormsModule, TranslateModule, SliderModule, ButtonModule, TextareaModule, MessageModule],
  template: `
    <div class="space-y-4">

      @switch (item().type) {

        @case ('VAS_0_10') {
          <div class="space-y-4" [attr.aria-label]="item().texte">
            <!-- Valeur centrale -->
            <div class="text-center">
              <span
                class="text-5xl font-bold transition-colors duration-300"
                [class]="vasColorClass()"
              >
                {{ displayValue() }}
              </span>
            </div>

            <!-- Slider PrimeNG 19 : ControlValueAccessor via ngModel -->
            <p-slider
              [ngModel]="numericValue()"
              (onChange)="onSliderChange($event)"
              [min]="0"
              [max]="10"
              [step]="1"
              styleClass="w-full"
              [ariaLabel]="item().texte"
            />

            <!-- Labels min/max -->
            <div class="flex justify-between text-xs text-gray-400">
              <span>{{ item().labelMin ?? '0 — Aucun' }}</span>
              <span>{{ item().labelMax ?? '10 — Maximum' }}</span>
            </div>
          </div>
        }

        @case ('LIKERT_4') {
          <div class="space-y-2" role="radiogroup" [attr.aria-label]="item().texte">
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              @for (opt of likert4Options(); track opt.value) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="value() === opt.value"
                  [attr.aria-label]="opt.label"
                  (click)="emitAnswer(opt.value)"
                  (keydown.enter)="emitAnswer(opt.value)"
                  (keydown.space)="emitAnswer(opt.value)"
                  class="px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-caretrack-blue"
                  [class.bg-caretrack-blue]="value() === opt.value"
                  [class.text-white]="value() === opt.value"
                  [class.border-caretrack-blue]="value() === opt.value"
                  [class.bg-white]="value() !== opt.value"
                  [class.text-slate-700]="value() !== opt.value"
                  [class.border-slate-200]="value() !== opt.value"
                >
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>
        }

        @case ('LIKERT_5') {
          <div class="space-y-2" role="radiogroup" [attr.aria-label]="item().texte">
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-2">
              @for (opt of likert5Options(); track opt.value) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="value() === opt.value"
                  [attr.aria-label]="opt.label"
                  (click)="emitAnswer(opt.value)"
                  (keydown.enter)="emitAnswer(opt.value)"
                  (keydown.space)="emitAnswer(opt.value)"
                  class="px-2 py-3 rounded-xl border-2 text-xs font-medium transition-all duration-150 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-caretrack-blue"
                  [class.bg-caretrack-blue]="value() === opt.value"
                  [class.text-white]="value() === opt.value"
                  [class.border-caretrack-blue]="value() === opt.value"
                  [class.bg-white]="value() !== opt.value"
                  [class.text-slate-600]="value() !== opt.value"
                  [class.border-slate-200]="value() !== opt.value"
                >
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>
        }

        @case ('YESNO') {
          <div class="flex gap-4" role="group" [attr.aria-label]="item().texte">
            <p-button
              [label]="'patient.question.yes' | translate"
              icon="pi pi-check"
              severity="success"
              [outlined]="value() !== true"
              (click)="emitAnswer(true)"
              class="flex-1"
              styleClass="w-full justify-center"
              size="large"
              [attr.aria-pressed]="value() === true"
            />
            <p-button
              [label]="'patient.question.no' | translate"
              icon="pi pi-times"
              severity="danger"
              [outlined]="value() !== false"
              (click)="emitAnswer(false)"
              class="flex-1"
              styleClass="w-full justify-center"
              size="large"
              [attr.aria-pressed]="value() === false"
            />
          </div>
        }

        @default {
          <textarea
            pTextarea
            rows="3"
            [placeholder]="'patient.question.placeholder' | translate"
            [ngModel]="stringValue()"
            (ngModelChange)="emitAnswer($event)"
            [attr.aria-label]="item().texte"
            class="w-full rounded-xl border-slate-200 focus:border-caretrack-blue"
          ></textarea>
        }
      }

      <!-- Alertes cliniques -->
      @if (shouldShowCriticalAlert()) {
        <p-message
          severity="error"
          [text]="'patient.question.criticalAlert' | translate"
          styleClass="w-full"
        />
      } @else if (shouldShowWarningAlert()) {
        <p-message
          severity="warn"
          [text]="'patient.question.warningAlert' | translate"
          styleClass="w-full"
        />
      }

    </div>
  `,
})
export class QuestionItemComponent {
  readonly item = input.required<QuestionItem>();
  readonly value = input<number | string | boolean | null>(null);
  readonly answered = output<{ itemId: string; value: number | string | boolean }>();

  private readonly translate = inject(TranslateService);

  protected readonly numericValue = computed(() => {
    const v = this.value();
    return typeof v === 'number' ? v : 0;
  });

  protected readonly stringValue = computed(() => {
    const v = this.value();
    return typeof v === 'string' ? v : '';
  });

  protected readonly displayValue = computed(() => {
    const v = this.value();
    return v === null || v === undefined ? '—' : String(v);
  });

  protected readonly vasColorClass = computed(() => {
    const v = this.numericValue();
    if (v <= 3) return 'text-green-500';
    if (v <= 6) return 'text-orange-400';
    return 'text-red-500';
  });

  protected readonly shouldShowCriticalAlert = computed(() => {
    const item = this.item();
    if (item.alerteNiveau !== 'CRITICAL' || item.seuilAlerteMin === undefined) return false;
    const v = this.value();
    return typeof v === 'number' && v >= item.seuilAlerteMin;
  });

  protected readonly shouldShowWarningAlert = computed(() => {
    const item = this.item();
    if (item.alerteNiveau !== 'WARNING' || item.seuilAlerteMin === undefined) return false;
    const v = this.value();
    return typeof v === 'number' && v >= item.seuilAlerteMin;
  });

  protected readonly likert4Options = computed(() => [
    { value: 0, label: this.itemLabel(0, this.translate.instant('patient.question.likert4.0')) },
    { value: 1, label: this.itemLabel(1, this.translate.instant('patient.question.likert4.1')) },
    { value: 2, label: this.itemLabel(2, this.translate.instant('patient.question.likert4.2')) },
    { value: 3, label: this.itemLabel(3, this.translate.instant('patient.question.likert4.3')) },
  ]);

  protected readonly likert5Options = computed(() => [
    { value: 0, label: this.itemLabel(0, this.translate.instant('patient.question.likert5.0')) },
    { value: 1, label: this.itemLabel(1, this.translate.instant('patient.question.likert5.1')) },
    { value: 2, label: this.itemLabel(2, this.translate.instant('patient.question.likert5.2')) },
    { value: 3, label: this.itemLabel(3, this.translate.instant('patient.question.likert5.3')) },
    { value: 4, label: this.itemLabel(4, this.translate.instant('patient.question.likert5.4')) },
  ]);

  protected onSliderChange(event: { value?: number; values?: number[] }): void {
    if (event.value !== undefined) {
      this.emitAnswer(event.value);
    }
  }

  protected emitAnswer(value: number | string | boolean): void {
    this.answered.emit({ itemId: this.item().id, value });
  }

  private itemLabel(index: number, fallback: string): string {
    const item = this.item();
    if (index === 0 && item.labelMin) return item.labelMin;
    const maxIndex = item.type === 'LIKERT_4' ? 3 : 4;
    if (index === maxIndex && item.labelMax) return item.labelMax;
    return fallback;
  }
}

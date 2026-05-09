import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReponseService } from '../../services/reponse.service';
import { AlerteService } from '../../services/alerte.service';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { DashboardService } from '../../services/dashboard.service';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { ReponseDto } from '../../models/reponse.model';
import { AlerteDto } from '../../models/alerte.model';
import { QuestionItem } from '../../models/question-item.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-reponse-review',
  imports: [
    FormsModule,
    TranslateModule,
    CardModule, ButtonModule, MessageModule, TextareaModule,
    TagModule, SkeletonModule, TooltipModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8">
      <div class="max-w-3xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            (click)="goBack()"
            [attr.aria-label]="'pro.review.back' | translate"
          >
            <i class="pi pi-arrow-left text-gray-600"></i>
          </button>
          <div>
            <h1 class="text-xl font-bold text-caretrack-navy">{{ 'pro.review.title' | translate }}</h1>
            @if (reponse()) {
              <p class="text-sm text-gray-400">
                {{ reponse()!.templateNom }} · {{ formatDate(reponse()!.createdAt) }}
              </p>
            }
          </div>
        </div>

        <!-- Alertes sur cette réponse -->
        @if (alertesReponse().length > 0) {
          <p-message
            severity="error"
            [text]="alertesReponse().length + ' ' + ('pro.review.alertsDetected' | translate)"
            styleClass="w-full"
          />
        }

        @if (loading()) {
          <div class="space-y-3">
            @for (_ of skeletonRows; track $index) {
              <p-skeleton height="80px" borderRadius="12px" />
            }
          </div>
        } @else if (reponse()) {

          <!-- Liste des questions / réponses -->
          <p-card>
            <div class="space-y-4">
              @for (item of sortedItems(); track item.id) {
                <div
                  class="p-4 rounded-xl border-l-4 transition-colors"
                  [class.border-red-400]="isItemAlerte(item, 'CRITICAL')"
                  [class.bg-red-50]="isItemAlerte(item, 'CRITICAL')"
                  [class.border-orange-300]="isItemAlerte(item, 'WARNING')"
                  [class.bg-orange-50]="isItemAlerte(item, 'WARNING')"
                  [class.border-slate-100]="!isItemAlerte(item, 'CRITICAL') && !isItemAlerte(item, 'WARNING')"
                  [class.bg-white]="!isItemAlerte(item, 'CRITICAL') && !isItemAlerte(item, 'WARNING')"
                  [attr.role]="'group'"
                  [attr.aria-label]="item.texte"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-700 mb-1">{{ item.texte }}</p>
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-bold"
                              [class]="getAnswerClass(item)">
                          {{ formatAnswer(item) }}
                        </span>
                        @if (item.labelMin || item.labelMax) {
                          <span class="text-xs text-gray-400">
                            ({{ item.labelMin ?? '0' }} → {{ item.labelMax ?? '10' }})
                          </span>
                        }
                      </div>
                    </div>
                    @if (isItemAlerte(item, 'CRITICAL')) {
                      <p-tag [value]="'pro.review.criticalTag' | translate" severity="danger" icon="pi pi-exclamation-triangle" />
                    } @else if (isItemAlerte(item, 'WARNING')) {
                      <p-tag [value]="'pro.review.warningTag' | translate" severity="warn" />
                    }
                  </div>
                </div>
              }
            </div>
          </p-card>

          <!-- Zone annotation -->
          <p-card [header]="'pro.review.annotationHeader' | translate">
            <div class="space-y-3">
              <textarea
                pTextarea
                rows="4"
                [placeholder]="'pro.review.annotationPlaceholder' | translate"
                [(ngModel)]="annotation"
                [attr.aria-label]="'pro.review.annotationHeader' | translate"
                class="w-full"
              ></textarea>
              <div class="flex gap-2 justify-end">
                <p-button
                  [label]="'pro.review.acknowledgeAll' | translate"
                  icon="pi pi-check-square"
                  [outlined]="true"
                  severity="secondary"
                  [disabled]="alertesReponse().length === 0"
                  (click)="acknowledgeAll()"
                />
                <p-button
                  [label]="'pro.review.validate' | translate"
                  icon="pi pi-save"
                  severity="success"
                  [loading]="saving()"
                  [disabled]="!annotation.trim()"
                  (click)="validateReview()"
                />
              </div>
            </div>
          </p-card>

        }
      </div>
    </div>
  `,
})
export class ReponseReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reponseService = inject(ReponseService);
  private readonly alerteService = inject(AlerteService);
  private readonly questionnaireService = inject(QuestionnaireService);
  private readonly dashboardService = inject(DashboardService);
  private readonly store = inject(QuestionnaireStore);
  private readonly translate = inject(TranslateService);

  protected readonly reponse = signal<ReponseDto | null>(null);
  protected readonly alertesReponse = signal<AlerteDto[]>([]);
  protected readonly items = signal<QuestionItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected annotation = '';
  protected readonly skeletonRows = [1, 2, 3, 4];

  private readonly reponseId = this.route.snapshot.params['id'] as string;

  protected readonly sortedItems = computed(() =>
    [...this.items()].sort((a, b) => a.ordre - b.ordre)
  );

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as
      { reponse?: ReponseDto; alertes?: AlerteDto[] } | undefined;

    if (state?.reponse) {
      this.reponse.set(state.reponse);
      if (state.alertes) this.alertesReponse.set(state.alertes);
      this.loadTemplate(state.reponse.templateCode);
    }
    this.loading.set(false);
  }

  private loadTemplate(code: string): void {
    this.questionnaireService.getTemplateByCode(code).subscribe({
      next: (t) => this.items.set(t.items),
      error: () => {},
    });
  }

  protected isItemAlerte(item: QuestionItem, niveau: 'CRITICAL' | 'WARNING'): boolean {
    const alerteFromList = this.alertesReponse().find(
      a => a.itemCode === item.id && a.niveau === niveau
    );
    if (alerteFromList) return true;
    if (!item.seuilAlerteMin || !item.alerteNiveau) return false;
    const val = this.reponse()?.answers[item.id];
    return typeof val === 'number' && val >= item.seuilAlerteMin && item.alerteNiveau === niveau;
  }

  protected formatAnswer(item: QuestionItem): string {
    const val = this.reponse()?.answers[item.id];
    if (val === undefined || val === null) return '—';
    if (typeof val === 'boolean') return val
      ? this.translate.instant('pro.review.yes')
      : this.translate.instant('pro.review.no');
    return String(val);
  }

  protected getAnswerClass(item: QuestionItem): string {
    const val = this.reponse()?.answers[item.id];
    if (typeof val !== 'number') return 'text-gray-700';
    if (val <= 3) return 'text-green-600';
    if (val <= 6) return 'text-orange-500';
    return 'text-red-600';
  }

  protected acknowledgeAll(): void {
    this.alertesReponse().forEach(a => this.store.acknowledgeAlerte(a.id));
    this.alertesReponse.set(this.alertesReponse().map(a => ({ ...a, isAcknowledged: true })));
  }

  protected validateReview(): void {
    if (!this.annotation.trim() || !this.reponseId) return;
    this.saving.set(true);
    this.dashboardService.reviewReponse(this.reponseId, this.annotation).subscribe({
      next: () => {
        this.acknowledgeAll();
        this.saving.set(false);
        this.goBack();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  protected goBack(): void {
    this.router.navigate(['/pro/formulaires']);
  }
}

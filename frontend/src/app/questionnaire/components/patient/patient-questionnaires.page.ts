import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { MockDataService } from '../../../core/mocks/mock-data.service';
import { PATIENT_FRIENDLY_NAMES } from '../../../core/mocks/mock-templates';
import { QuestionnaireTemplate } from '../../models/questionnaire-template.model';
import { MockQuestionnaire } from '../../../core/models/user.model';
// PrimeNG standalone imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TimelineModule } from 'primeng/timeline';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
// Sub-component
import { QuestionnaireDueCardComponent } from './questionnaire-due-card.component';

@Component({
  selector: 'app-patient-questionnaires',
  imports: [
    TranslateModule,
    CardModule, ButtonModule, BadgeModule, TimelineModule,
    ChartModule, ProgressBarModule, TagModule, SkeletonModule,
    MessageModule, QuestionnaireDueCardComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8">
      <div class="max-w-4xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-caretrack-navy">{{ 'patient.questionnaires.title' | translate }}</h1>
          @if (store.dueCount() > 0) {
            <p-badge
              [value]="store.dueCount() + ' ' + ('patient.questionnaires.toFill' | translate)"
              severity="danger"
              class="text-sm"
            />
          }
        </div>

        <!-- Alertes critiques -->
        @if (store.alertesCritiques().length > 0) {
          <p-message
            severity="error"
            [text]="('patient.questionnaires.doctorAlerted' | translate) + ' ' + store.alertesCritiques().length + ' ' + ('patient.questionnaires.criticalAlerts' | translate)"
          />
        }

        <!-- Questionnaires dus -->
        <p-card>
          <ng-template #header>
            <div class="flex items-center gap-3 px-6 pt-6">
              <i class="pi pi-clipboard text-caretrack-blue text-xl"></i>
              <h2 class="text-lg font-semibold text-caretrack-navy">{{ 'patient.questionnaires.forms' | translate }}</h2>
            </div>
          </ng-template>

          @if (store.loading()) {
            <div class="space-y-3 p-4">
              @for (_ of [1,2,3]; track $index) {
                <p-skeleton height="80px" borderRadius="12px" />
              }
            </div>
          } @else if (dueTemplates().length === 0) {
            <div class="text-center py-12 text-gray-500">
              <i class="pi pi-check-circle text-4xl text-green-500 mb-3 block"></i>
              <p class="font-medium">{{ 'patient.questionnaires.allDone' | translate }}</p>
              <p class="text-sm mt-1">{{ 'patient.questionnaires.allDoneSub' | translate }}</p>
            </div>
          } @else {
            <div class="space-y-3 p-4">
              @for (template of dueTemplates(); track template.id) {
                <app-questionnaire-due-card
                  [template]="template"
                  [isOverdue]="isOverdue(template)"
                />
              }
            </div>
          }
        </p-card>

        <!-- Graphique évolution -->
        @if (chartData()) {
          <p-card>
            <ng-template #header>
              <div class="flex items-center gap-3 px-6 pt-6">
                <i class="pi pi-chart-line text-caretrack-teal text-xl"></i>
                <h2 class="text-lg font-semibold text-caretrack-navy">{{ 'patient.questionnaires.history' | translate }}</h2>
              </div>
            </ng-template>
            <div class="p-4">
              <p-chart type="line" [data]="chartData()" [options]="chartOptions" height="200" />
            </div>
          </p-card>
        }

        <!-- Timeline soumissions récentes -->
        @if (recentSubmissions().length > 0) {
          <p-card>
            <ng-template #header>
              <div class="flex items-center gap-3 px-6 pt-6">
                <i class="pi pi-history text-caretrack-blue text-xl"></i>
                <h2 class="text-lg font-semibold text-caretrack-navy">{{ 'patient.questionnaires.recentSubmissions' | translate }}</h2>
              </div>
            </ng-template>
            <div class="p-4">
              <p-timeline [value]="recentSubmissions()" styleClass="customized-timeline">
                <ng-template #content let-item>
                  <div class="text-sm">
                    <span class="font-medium text-caretrack-navy">{{ item.templateNom }}</span>
                    <span class="text-gray-400 ml-2 text-xs">{{ formatDate(item.createdAt) }}</span>
                    @if (item.scoreGlobal !== undefined) {
                      <span
                        class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                        [class]="scoreClass(item.scoreGlobal)"
                      >
                        {{ 'patient.questionnaires.score' | translate }} {{ item.scoreGlobal }}
                      </span>
                    }
                  </div>
                </ng-template>
                <ng-template #opposite let-item>
                  <i class="pi pi-check text-green-500 text-sm"></i>
                </ng-template>
              </p-timeline>
            </div>
          </p-card>
        }

      </div>
    </div>
  `,
})
export class PatientQuestionnairesPage implements OnInit {
  protected readonly store = inject(QuestionnaireStore);
  private readonly mockService = inject(MockDataService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly patientId = localStorage.getItem('user_id') ?? '';

  private readonly recentSubs = signal<MockQuestionnaire[]>([]);

  protected readonly dueTemplates = computed(() =>
    this.store.templates().filter(t => t.isDue)
  );

  protected readonly recentSubmissions = computed(() =>
    this.recentSubs()
      .filter(q => q.statut === 'COMPLETE')
      .slice(0, 5)
      .map(q => ({
        templateNom: PATIENT_FRIENDLY_NAMES[q.templateCode] ?? q.templateCode,
        createdAt: q.dateReponse?.toISOString() ?? q.dateEnvoi.toISOString(),
        scoreGlobal: q.score !== null ? Math.round(q.score / 10) : undefined,
      }))
  );

  protected readonly chartData = computed(() => {
    const subs = this.recentSubs().filter(q => q.score !== null);
    if (subs.length === 0) return null;
    const labels = subs.slice(0, 7).map(s => this.formatDate(s.dateReponse?.toISOString() ?? s.dateEnvoi.toISOString())).reverse();
    const scores = subs.slice(0, 7).map(s => Math.round((s.score ?? 0) / 10)).reverse();
    return {
      labels,
      datasets: [{
        label: this.translate.instant('patient.globalScore'),
        data: scores,
        borderColor: '#1565C0',
        backgroundColor: 'rgba(21,101,192,0.1)',
        tension: 0.4,
        fill: true,
      }],
    };
  });

  protected readonly chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 10, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  ngOnInit(): void {
    const submitted = this.mockService.getSubmittedCodesForPatient(this.patientId);
    this.store.loadTemplates(submitted, this.patientId || undefined);
    this.loadRecentSubmissions();
  }

  protected isOverdue(template: QuestionnaireTemplate): boolean {
    if (!template.lastCompletedAt) return true;
    const last = new Date(template.lastCompletedAt);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    const limits: Record<string, number> = {
      QUOTIDIEN: 1, HEBDO: 7, MENSUEL: 30, TRIMESTRIEL: 90, PAR_CYCLE: 30,
    };
    return diffDays > (limits[template.frequence] ?? 7);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  protected scoreClass(score: number): string {
    if (score <= 3) return 'bg-green-100 text-green-700';
    if (score <= 6) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }

  private loadRecentSubmissions(): void {
    if (!this.patientId) return;
    this.mockService.getQuestionnairesPatient(this.patientId).subscribe({
      next: (data) => this.recentSubs.set(data),
      error: () => {},
    });
  }
}

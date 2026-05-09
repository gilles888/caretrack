import { Component, inject, input, output, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockDataService } from '../../../core/mocks/mock-data.service';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { PatientSummary } from '../../models/patient.model';
import { ReponseDto } from '../../models/reponse.model';
import { PatientQuestionnairePlan } from '../../models/plan.model';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { ProgressBarModule } from 'primeng/progressbar';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-patient-detail-modal',
  imports: [
    FormsModule,
    TranslateModule,
    DialogModule, TabsModule, ButtonModule, TagModule,
    MessageModule, ChartModule, TimelineModule, ProgressBarModule,
    TextareaModule, ToggleButtonModule, SkeletonModule,
  ],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{width: '90vw', maxWidth: '860px'}"
      [draggable]="false"
      [resizable]="false"
      [closeOnEscape]="true"
      [attr.aria-label]="('pro.patientDetail.tabScores' | translate) + ' ' + (patient()?.nom ?? '')"
    >
      <ng-template #header>
        <div class="flex items-center gap-4 w-full">
          <!-- Avatar initiales -->
          <div class="w-12 h-12 rounded-full bg-caretrack-blue flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-lg">{{ initiales() }}</span>
          </div>
          <!-- Info patient -->
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-caretrack-navy text-lg leading-tight">
              {{ patient()?.prenom }} {{ patient()?.nom }}
            </h2>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-gray-500">{{ age() }} ans</span>
              <span class="text-gray-300">·</span>
              <span class="text-sm text-gray-500">{{ patient()?.maladie }}</span>
              @if (patient()?.protocole) {
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">{{ patient()?.protocole }}</span>
              }
            </div>
          </div>
          <!-- Niveau alerte -->
          @if (patient()?.alerteNiveau) {
            <p-tag
              [value]="alerteLabel(patient()!.alerteNiveau!)"
              [severity]="alerteSeverity(patient()!.alerteNiveau!)"
              [icon]="patient()!.alerteNiveau === 'CRITICAL' ? 'pi pi-exclamation-triangle' : undefined"
            />
          }
        </div>
      </ng-template>

      <!-- Contenu en tabs -->
      <p-tabs [value]="activeTab()">
        <p-tablist>
          <p-tab value="scores">{{ 'pro.patientDetail.tabScores' | translate }}</p-tab>
          <p-tab value="historique">{{ 'pro.patientDetail.tabHistory' | translate }}</p-tab>
          <p-tab value="plan">{{ 'pro.patientDetail.tabPlan' | translate }}</p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Onglet Scores -->
          <p-tabpanel value="scores">
            @if (loadingReponse()) {
              <div class="space-y-3 py-4">
                @for (_ of skeletonRows; track $index) {
                  <p-skeleton height="40px" />
                }
              </div>
            } @else if (latestReponse()) {
              <div class="space-y-4 py-4">
                @if (hasCriticalAlert()) {
                  <p-message
                    severity="error"
                    [text]="'pro.patientDetail.criticalAlert' | translate"
                    styleClass="w-full"
                  />
                }

                <div class="grid grid-cols-1 gap-3">
                  @for (entry of answersEntries(); track entry[0]) {
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 font-medium">{{ entry[0] }}</span>
                        <div class="flex items-center gap-2">
                          @if (getDelta(entry[0]) !== null) {
                            <span class="text-xs"
                                  [class.text-red-500]="getDelta(entry[0])! > 0"
                                  [class.text-green-500]="getDelta(entry[0])! < 0">
                              {{ getDelta(entry[0])! > 0 ? '↑' : '↓' }}
                              {{ mathAbs(getDelta(entry[0])!) }}
                            </span>
                          }
                          <span class="font-bold text-sm"
                                [class]="scoreClass(toNumber(entry[1]))">
                            {{ entry[1] }}
                          </span>
                        </div>
                      </div>
                      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          [style.width.%]="toPercent(entry[1])"
                          [class.bg-green-400]="toPercent(entry[1]) <= 30"
                          [class.bg-orange-400]="toPercent(entry[1]) > 30 && toPercent(entry[1]) <= 60"
                          [class.bg-red-500]="toPercent(entry[1]) > 60"
                        ></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <p class="text-center text-gray-400 py-8">{{ 'pro.patientDetail.noData' | translate }}</p>
            }
          </p-tabpanel>

          <!-- Onglet Historique -->
          <p-tabpanel value="historique">
            <div class="py-4 space-y-6">
              @if (historique().length > 0) {
                <!-- Graphique évolution -->
                <p-chart
                  type="line"
                  [data]="chartData()"
                  [options]="chartOptions"
                  height="200"
                />

                <!-- Timeline -->
                <p-timeline [value]="historique().slice(0, 10)" styleClass="mt-4">
                  <ng-template #content let-item>
                    <div class="text-sm pb-4">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-caretrack-navy">{{ item.templateNom }}</span>
                        @if (item.scoreGlobal !== undefined) {
                          <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                                [class]="scoreClass(item.scoreGlobal)">
                            {{ item.scoreGlobal }}/10
                          </span>
                        }
                      </div>
                      <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
                    </div>
                  </ng-template>
                  <ng-template #opposite>
                    <i class="pi pi-circle-fill text-caretrack-blue text-xs"></i>
                  </ng-template>
                </p-timeline>
              } @else {
                <p class="text-center text-gray-400 py-8">{{ 'pro.patientDetail.noHistory' | translate }}</p>
              }
            </div>
          </p-tabpanel>

          <!-- Onglet Plan de suivi -->
          <p-tabpanel value="plan">
            <div class="py-4 space-y-4">
              @if (plan()) {
                @for (item of plan()!.items; track item.templateId) {
                  <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-caretrack-navy text-sm truncate">{{ item.templateNom }}</p>
                      <p class="text-xs text-gray-400">{{ item.frequence }}</p>
                    </div>
                    <p-toggleButton
                      [(ngModel)]="item.actif"
                      [onLabel]="'pro.patientDetail.active' | translate"
                      [offLabel]="'pro.patientDetail.inactive' | translate"
                      onIcon="pi pi-check"
                      offIcon="pi pi-times"
                      [attr.aria-label]="('pro.patientDetail.active' | translate) + ' ' + item.templateNom"
                    />
                  </div>
                }
                <p-button
                  [label]="'pro.patientDetail.editPlan' | translate"
                  icon="pi pi-pencil"
                  [outlined]="true"
                  styleClass="w-full justify-center mt-2"
                />
              } @else {
                <p class="text-center text-gray-400 py-8">{{ 'pro.patientDetail.noPlan' | translate }}</p>
              }
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>

      <!-- Footer -->
      <ng-template #footer>
        <div class="flex flex-wrap gap-2 justify-between w-full">
          <div class="flex gap-2">
            @if (hasCriticalAlert()) {
              <p-button
                [label]="'pro.patientDetail.acknowledgeAlerts' | translate"
                icon="pi pi-check-circle"
                severity="danger"
                size="small"
                (click)="acknowledgePatientAlertes()"
              />
            }
            <p-button
              [label]="'pro.patientDetail.annotation' | translate"
              icon="pi pi-pencil"
              [outlined]="true"
              size="small"
              (click)="toggleAnnotation()"
            />
          </div>
          <p-button
            [label]="'pro.patientDetail.close' | translate"
            severity="secondary"
            [outlined]="true"
            size="small"
            (click)="visibleChange.emit(false)"
          />
        </div>
        @if (showAnnotation()) {
          <div class="w-full mt-3 space-y-2">
            <textarea
              pTextarea
              rows="3"
              [placeholder]="'pro.patientDetail.annotationPlaceholder' | translate"
              [(ngModel)]="annotation"
              [attr.aria-label]="'pro.patientDetail.annotation' | translate"
              class="w-full"
            ></textarea>
            <p-button
              [label]="'pro.patientDetail.saveAnnotation' | translate"
              icon="pi pi-save"
              size="small"
              (click)="saveAnnotation()"
            />
          </div>
        }
      </ng-template>
    </p-dialog>
  `,
})
export class PatientDetailModalComponent implements OnChanges {
  readonly patientId = input.required<string>();
  readonly reponseId = input<string>('');
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();

  private readonly mockService = inject(MockDataService);
  private readonly store = inject(QuestionnaireStore);
  private readonly translate = inject(TranslateService);

  protected readonly patient = signal<PatientSummary | null>(null);
  protected readonly historique = signal<ReponseDto[]>([]);
  protected readonly plan = signal<PatientQuestionnairePlan | null>(null);
  protected readonly loadingReponse = signal(false);
  protected readonly activeTab = signal('scores');
  protected readonly showAnnotation = signal(false);
  protected annotation = '';
  protected readonly skeletonRows = [1, 2, 3];

  protected readonly latestReponse = computed(() => this.historique()[0] ?? null);

  protected readonly previousReponse = computed(() => this.historique()[1] ?? null);

  protected readonly initiales = computed(() => {
    const p = this.patient();
    if (!p) return '?';
    return `${p.prenom[0] ?? ''}${p.nom[0] ?? ''}`.toUpperCase();
  });

  protected readonly age = computed(() => {
    const p = this.patient();
    if (!p) return '—';
    const diff = Date.now() - new Date(p.dateNaissance).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  });

  protected readonly hasCriticalAlert = computed(() =>
    this.store.alertesCritiques().some(a => a.patientId === this.patientId())
  );

  protected readonly answersEntries = computed((): [string, number | string | boolean][] => {
    const r = this.latestReponse();
    if (!r?.answers) return [];
    return Object.entries(r.answers);
  });

  protected readonly chartData = computed(() => {
    const h = this.historique().slice(0, 10).reverse();
    return {
      labels: h.map(r => this.formatDate(r.createdAt)),
      datasets: [{
        label: this.translate.instant('pro.patientDetail.tabScores'),
        data: h.map(r => r.scoreGlobal ?? 0),
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
      y: { min: 0, max: 10 },
      x: { grid: { display: false } },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.patientId()) {
      this.loadPatientData();
    }
  }

  private loadPatientData(): void {
    this.loadingReponse.set(true);
    const id = this.patientId();

    this.mockService.getPatientSummary(id).subscribe({
      next: (p) => this.patient.set(p),
      error: () => {},
    });

    this.mockService.getReponsesDto(id).subscribe({
      next: (data) => {
        this.historique.set(data);
        this.loadingReponse.set(false);
      },
      error: () => this.loadingReponse.set(false),
    });

    this.mockService.getPlanPatient(id).subscribe({
      next: (p) => this.plan.set(p),
      error: () => {},
    });
  }

  protected getDelta(key: string): number | null {
    const curr = this.latestReponse()?.answers[key];
    const prev = this.previousReponse()?.answers[key];
    if (typeof curr !== 'number' || typeof prev !== 'number') return null;
    return curr - prev;
  }

  protected toNumber(val: number | string | boolean): number {
    return typeof val === 'number' ? val : 0;
  }

  protected toPercent(val: number | string | boolean): number {
    if (typeof val !== 'number') return 0;
    return Math.min(100, val * 10);
  }

  protected mathAbs(n: number): number {
    return Math.abs(n);
  }

  protected scoreClass(score: number): string {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-orange-500';
    return 'text-red-600';
  }

  protected alerteLabel(n: string): string {
    return this.translate.instant(`pro.patientDetail.alerteLabel.${n}`) ?? n;
  }

  protected alerteSeverity(n: string): 'danger' | 'warn' | 'info' {
    const map: Record<string, 'danger' | 'warn' | 'info'> = {
      CRITICAL: 'danger', WARNING: 'warn', INFO: 'info'
    };
    return map[n] ?? 'info';
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  protected acknowledgePatientAlertes(): void {
    const alertes = this.store.alertesCritiques().filter(a => a.patientId === this.patientId());
    alertes.forEach(a => this.store.acknowledgeAlerte(a.id));
  }

  protected toggleAnnotation(): void {
    this.showAnnotation.update(v => !v);
  }

  protected saveAnnotation(): void {
    if (!this.annotation.trim() || !this.reponseId()) return;
    this.mockService.reviewReponse(this.reponseId(), this.annotation).subscribe({
      next: () => {
        this.annotation = '';
        this.showAnnotation.set(false);
      },
    });
  }
}

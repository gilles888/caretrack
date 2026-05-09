import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { DashboardService } from '../../services/dashboard.service';
import { MockDataService } from '../../../core/mocks/mock-data.service';
import { DashboardRow } from '../../models/patient.model';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { PatientDetailModalComponent } from './patient-detail-modal.component';

type StatutFilter = 'CRITICAL' | 'WARNING' | 'NORMAL' | 'EN_ATTENTE';

@Component({
  selector: 'app-dashboard-formulaires',
  imports: [
    FormsModule,
    TranslateModule,
    CardModule, TableModule, ButtonModule, BadgeModule, TagModule,
    InputTextModule, SelectModule, MultiSelectModule, DatePickerModule,
    KnobModule, SkeletonModule, MessageModule, TooltipModule,
    PatientDetailModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <div class="max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <h1 class="text-2xl font-bold text-caretrack-navy">{{ 'pro.dashboard.title' | translate }}</h1>
          <p-button
            [label]="'pro.dashboard.refresh' | translate"
            icon="pi pi-refresh"
            [outlined]="true"
            size="small"
            (click)="loadData()"
            [loading]="loading()"
          />
        </div>

        <!-- KPI Cards — 4 colonnes -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- Patients actifs -->
          <p-card styleClass="h-full">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500 font-medium">{{ 'pro.dashboard.activePatients' | translate }}</span>
                <i class="pi pi-users text-caretrack-blue"></i>
              </div>
              <span class="text-3xl font-bold text-caretrack-navy">{{ patientsActifs() }}</span>
              <p-badge
                [value]="'pro.dashboard.thisMonth' | translate"
                severity="success"
                class="self-start"
              />
            </div>
          </p-card>

          <!-- Formulaires en attente -->
          <p-card styleClass="h-full">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500 font-medium">{{ 'pro.dashboard.pending' | translate }}</span>
                <i class="pi pi-clock text-orange-400"></i>
              </div>
              <span class="text-3xl font-bold text-orange-500">{{ enAttente() }}</span>
              <p-badge
                [value]="'pro.dashboard.toReview' | translate"
                severity="warn"
                class="self-start"
              />
            </div>
          </p-card>

          <!-- Alertes critiques -->
          <p-card styleClass="h-full">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500 font-medium">{{ 'pro.dashboard.criticalAlerts' | translate }}</span>
                <i class="pi pi-exclamation-triangle"
                   [class.text-red-500]="store.alertesCritiques().length > 0"
                   [class.text-gray-300]="store.alertesCritiques().length === 0"
                   [class.animate-pulse]="store.alertesCritiques().length > 0"></i>
              </div>
              <span class="text-3xl font-bold"
                    [class.text-red-600]="store.alertesCritiques().length > 0"
                    [class.text-gray-400]="store.alertesCritiques().length === 0">
                {{ store.alertesCritiques().length }}
              </span>
              @if (store.alertesCritiques().length > 0) {
                <p-badge [value]="'pro.dashboard.urgent' | translate" severity="danger" class="self-start" />
              } @else {
                <p-badge [value]="'pro.dashboard.ras' | translate" severity="success" class="self-start" />
              }
            </div>
          </p-card>

          <!-- Taux de complétion -->
          <p-card styleClass="h-full">
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm text-gray-500 font-medium self-start">{{ 'pro.dashboard.completion' | translate }}</span>
              <p-knob
                [ngModel]="completionRate()"
                [readonly]="true"
                [size]="80"
                valueColor="#00796B"
                rangeColor="#E0F2F1"
                textColor="#0D1B2A"
                valueTemplate="{value}%"
              />
            </div>
          </p-card>

        </div>

        <!-- Alerte globale si critiques -->
        @if (store.alertesCritiques().length > 0) {
          <p-message
            severity="error"
            [text]="store.alertesCritiques().length + ' ' + ('pro.dashboard.criticalAction' | translate)"
            styleClass="w-full"
          />
        }

        <!-- Filtres -->
        <p-card>
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1 flex-1 min-w-32">
              <label class="text-xs text-gray-500 font-medium">{{ 'pro.dashboard.search' | translate }}</label>
              <input
                pInputText
                [placeholder]="'pro.dashboard.searchPlaceholder' | translate"
                [(ngModel)]="globalFilter"
                (ngModelChange)="onFilterChange()"
                [attr.aria-label]="'pro.dashboard.search' | translate"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-1 min-w-36">
              <label class="text-xs text-gray-500 font-medium">{{ 'pro.dashboard.disease' | translate }}</label>
              <p-select
                [options]="maladieOptions"
                [(ngModel)]="filterMaladie"
                optionLabel="label"
                optionValue="value"
                [placeholder]="'pro.dashboard.allDiseases' | translate"
                [showClear]="true"
                (onChange)="onFilterChange()"
                [attr.aria-label]="'pro.dashboard.disease' | translate"
              />
            </div>
            <div class="flex flex-col gap-1 min-w-40">
              <label class="text-xs text-gray-500 font-medium">{{ 'pro.dashboard.status' | translate }}</label>
              <p-multiSelect
                [options]="statutOptions"
                [(ngModel)]="filterStatuts"
                optionLabel="label"
                optionValue="value"
                [placeholder]="'pro.dashboard.allStatuses' | translate"
                (onChange)="onFilterChange()"
                [attr.aria-label]="'pro.dashboard.status' | translate"
              />
            </div>
            <div class="flex flex-col gap-1 min-w-44">
              <label class="text-xs text-gray-500 font-medium">{{ 'pro.dashboard.period' | translate }}</label>
              <p-datePicker
                [(ngModel)]="filterPeriode"
                selectionMode="range"
                [placeholder]="'pro.dashboard.allDates' | translate"
                dateFormat="dd/mm/yy"
                [showClear]="true"
                (onSelect)="onFilterChange()"
                [attr.aria-label]="'pro.dashboard.period' | translate"
              />
            </div>
            <p-button
              [label]="'pro.dashboard.reset' | translate"
              icon="pi pi-filter-slash"
              [outlined]="true"
              severity="secondary"
              size="small"
              (click)="resetFilters()"
            />
          </div>
        </p-card>

        <!-- Table principale -->
        <p-card>
          @if (loading()) {
            <div class="space-y-2 p-4">
              @for (_ of skeletonRows; track $index) {
                <p-skeleton height="48px" />
              }
            </div>
          } @else {
            <p-table
              [value]="filteredRows()"
              [paginator]="true"
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="{first}–{last} sur {totalRecords}"
              [rowsPerPageOptions]="[10, 25, 50]"
              sortField="completedAt"
              [sortOrder]="-1"
              dataKey="reponseId"
              [expandedRowKeys]="expandedRows"
              styleClass="p-datatable-sm p-datatable-gridlines"
              [tableStyle]="{'min-width': '900px'}"
            >
              <ng-template #header>
                <tr>
                  <th style="width: 3rem"></th>
                  <th pSortableColumn="patientNom">
                    {{ 'pro.dashboard.patient' | translate }} <p-sortIcon field="patientNom" />
                  </th>
                  <th>{{ 'pro.dashboard.disease' | translate }}</th>
                  <th>{{ 'pro.dashboard.questionnaire' | translate }}</th>
                  <th pSortableColumn="envoyeAt">
                    {{ 'pro.dashboard.sent' | translate }} <p-sortIcon field="envoyeAt" />
                  </th>
                  <th pSortableColumn="completedAt">
                    {{ 'pro.dashboard.completed' | translate }} <p-sortIcon field="completedAt" />
                  </th>
                  <th pSortableColumn="scoreGlobal">
                    {{ 'pro.dashboard.score' | translate }} <p-sortIcon field="scoreGlobal" />
                  </th>
                  <th>{{ 'pro.dashboard.status' | translate }}</th>
                  <th>{{ 'pro.dashboard.actions' | translate }}</th>
                </tr>
              </ng-template>

              <ng-template #body let-row let-expanded="expanded">
                <tr [class.bg-red-50]="row.statut === 'CRITICAL'"
                    [class.bg-orange-50]="row.statut === 'WARNING'">
                  <td>
                    <p-button
                      [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                      [text]="true"
                      size="small"
                      [pRowToggler]="row"
                      [attr.aria-label]="('pro.dashboard.details' | translate) + ' ' + row.patientNom"
                    />
                  </td>
                  <td class="font-medium text-caretrack-navy">{{ row.patientNom }}</td>
                  <td class="text-sm text-gray-600">{{ row.maladie }}</td>
                  <td class="text-sm">{{ row.templateNom }}</td>
                  <td class="text-xs text-gray-400">{{ formatDate(row.envoyeAt) }}</td>
                  <td class="text-xs">
                    @if (row.completedAt) {
                      {{ formatDate(row.completedAt) }}
                    } @else {
                      <span class="text-gray-400">—</span>
                    }
                  </td>
                  <td>
                    @if (row.scoreGlobal !== undefined) {
                      <span class="font-bold text-sm"
                            [class]="scoreClass(row.scoreGlobal)">
                        {{ row.scoreGlobal }}/10
                      </span>
                    } @else {
                      <span class="text-gray-400 text-xs">—</span>
                    }
                  </td>
                  <td>
                    <p-tag
                      [value]="statutLabel(row.statut)"
                      [severity]="statutSeverity(row.statut)"
                      [icon]="row.statut === 'CRITICAL' ? 'pi pi-exclamation-triangle' : undefined"
                    />
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <p-button
                        icon="pi pi-eye"
                        [text]="true"
                        size="small"
                        [pTooltip]="'pro.dashboard.viewFolder' | translate"
                        [attr.aria-label]="('pro.dashboard.viewFolder' | translate) + ' ' + row.patientNom"
                        (click)="openPatientDetail(row)"
                      />
                      <p-button
                        icon="pi pi-send"
                        [text]="true"
                        size="small"
                        severity="secondary"
                        [pTooltip]="'pro.dashboard.resend' | translate"
                        [attr.aria-label]="('pro.dashboard.resend' | translate) + ' ' + row.patientNom"
                        (click)="relancer(row)"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>

              <!-- Row expansion — scores par domaine -->
              <ng-template #expandedrow let-row>
                <tr>
                  <td [attr.colspan]="9" class="bg-slate-50 px-6 py-3">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      @if (row.details) {
                        @for (entry of objectEntries(row.details); track entry[0]) {
                          <div class="space-y-1">
                            <div class="flex justify-between text-xs text-gray-500">
                              <span>{{ entry[0] }}</span>
                              <span class="font-bold">{{ entry[1] }}/10</span>
                            </div>
                            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                class="h-full rounded-full transition-all"
                                [style.width.%]="entry[1] * 10"
                                [class.bg-green-500]="entry[1] <= 3"
                                [class.bg-orange-400]="entry[1] > 3 && entry[1] <= 6"
                                [class.bg-red-500]="entry[1] > 6"
                              ></div>
                            </div>
                          </div>
                        }
                      } @else {
                        <p class="text-sm text-gray-400 col-span-4">{{ 'pro.dashboard.noDetail' | translate }}</p>
                      }
                    </div>
                  </td>
                </tr>
              </ng-template>

              <ng-template #emptymessage>
                <tr>
                  <td colspan="9" class="text-center py-12 text-gray-400">
                    <i class="pi pi-inbox text-4xl block mb-3"></i>
                    <p>{{ 'pro.dashboard.noDataFilters' | translate }}</p>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>

      </div>
    </div>

    <!-- Modal détail patient -->
    @if (selectedRow()) {
      <app-patient-detail-modal
        [patientId]="selectedRow()!.patientId"
        [reponseId]="selectedRow()!.reponseId ?? ''"
        [visible]="showDetail()"
        (visibleChange)="showDetail.set($event)"
      />
    }
  `,
})
export class DashboardFormulairesPage implements OnInit {
  protected readonly store = inject(QuestionnaireStore);
  private readonly dashboardService = inject(DashboardService);
  private readonly mockService = inject(MockDataService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly rows = signal<DashboardRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly showDetail = signal(false);
  protected readonly selectedRow = signal<DashboardRow | null>(null);

  protected globalFilter = '';
  protected filterMaladie: string | null = null;
  protected filterStatuts: StatutFilter[] = [];
  protected filterPeriode: Date[] | null = null;

  protected expandedRows: Record<string, boolean> = {};
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  protected readonly maladieOptions = [
    { label: 'Cancer', value: 'CANCER' },
    { label: 'Insuffisance cardiaque', value: 'CARDIAC' },
    { label: 'Diabète', value: 'DIABETE' },
    { label: 'Neurologie', value: 'NEURO' },
  ];

  protected get statutOptions() {
    return [
      { label: this.translate.instant('pro.dashboard.statut.CRITICAL'), value: 'CRITICAL' },
      { label: this.translate.instant('pro.dashboard.statut.WARNING'), value: 'WARNING' },
      { label: this.translate.instant('pro.dashboard.statut.NORMAL'), value: 'NORMAL' },
      { label: this.translate.instant('pro.dashboard.statut.EN_ATTENTE'), value: 'EN_ATTENTE' },
    ];
  }

  protected readonly patientsActifs = computed(() =>
    new Set(this.rows().map(r => r.patientId)).size
  );

  protected readonly enAttente = computed(() =>
    this.rows().filter(r => r.statut === 'EN_ATTENTE').length
  );

  protected readonly completionRate = computed(() => {
    const total = this.rows().length;
    if (total === 0) return 0;
    const completed = this.rows().filter(r => r.completedAt).length;
    return Math.round((completed / total) * 100);
  });

  protected readonly filteredRows = computed(() => {
    let result = this.rows();

    if (this.globalFilter.trim()) {
      const q = this.globalFilter.toLowerCase();
      result = result.filter(r =>
        r.patientNom.toLowerCase().includes(q) ||
        r.templateCode.toLowerCase().includes(q) ||
        r.templateNom.toLowerCase().includes(q)
      );
    }

    if (this.filterMaladie) {
      result = result.filter(r => r.maladie === this.filterMaladie);
    }

    if (this.filterStatuts.length > 0) {
      result = result.filter(r => this.filterStatuts.includes(r.statut));
    }

    if (this.filterPeriode?.length === 2) {
      const [from, to] = this.filterPeriode;
      result = result.filter(r => {
        if (!r.completedAt) return false;
        const d = new Date(r.completedAt);
        return d >= from && d <= to;
      });
    }

    return result;
  });

  ngOnInit(): void {
    this.loadData();
    this.store.loadAlertes();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.mockService.getDashboardRows().subscribe({
      next: (data) => { this.rows.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected openPatientDetail(row: DashboardRow): void {
    this.selectedRow.set(row);
    this.showDetail.set(true);
  }

  protected relancer(row: DashboardRow): void {
    console.log('Relancer', row.patientId);
  }

  protected onFilterChange(): void {
    // filteredRows() est un computed signal — recalcul automatique
  }

  protected resetFilters(): void {
    this.globalFilter = '';
    this.filterMaladie = null;
    this.filterStatuts = [];
    this.filterPeriode = null;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  }

  protected scoreClass(score: number): string {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-orange-500';
    return 'text-red-600';
  }

  protected statutLabel(s: string): string {
    return this.translate.instant(`pro.dashboard.statut.${s}`) ?? s;
  }

  protected statutSeverity(s: string): 'danger' | 'warn' | 'success' | 'secondary' {
    const map: Record<string, 'danger' | 'warn' | 'success' | 'secondary'> = {
      CRITICAL: 'danger', WARNING: 'warn', NORMAL: 'success', EN_ATTENTE: 'secondary'
    };
    return map[s] ?? 'secondary';
  }

  protected objectEntries(obj: Record<string, number>): [string, number][] {
    return Object.entries(obj);
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExportService } from '../../services/export.service';
import { PatientEvolutionChartComponent } from './patient-evolution-chart.component';
import { CohorteHeatmapComponent } from './cohorte-heatmap.component';
import { AdherenceChartComponent } from './adherence-chart.component';
import { AlertesTrendComponent } from './alertes-trend.component';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';

type SparkDataset = {
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
};

type SparkData = {
  labels: string[];
  datasets: SparkDataset[];
};

const DEFAULT_WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

function defaultDateRange(): [Date, Date] {
  const to = new Date();
  const from = new Date(to.getTime() - 56 * 24 * 3600 * 1000);
  return [from, to];
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    ChartModule,
    SelectModule,
    DatePickerModule,
    SkeletonModule,
    TabsModule,
    PatientEvolutionChartComponent,
    CohorteHeatmapComponent,
    AdherenceChartComponent,
    AlertesTrendComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <div class="max-w-7xl mx-auto space-y-6 print:space-y-4" id="analytics-print-zone">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <h1 class="text-2xl font-bold text-caretrack-navy">
            {{ 'analytics.dashboard.title' | translate }}
          </h1>
          <p-button
            [label]="'analytics.dashboard.exportPdf' | translate"
            icon="pi pi-print"
            [outlined]="true"
            size="small"
            (onClick)="exportService.exportPDF()"
          />
        </div>

        <!-- Filtres -->
        <p-card>
          <div class="flex flex-wrap gap-3 items-end">

            <div class="flex flex-col gap-1 min-w-48">
              <label class="text-xs font-medium text-gray-500" for="filter-patient">
                {{ 'analytics.dashboard.patientFilter' | translate }}
              </label>
              <p-select
                inputId="filter-patient"
                [options]="patientOptions"
                [(ngModel)]="selectedPatientId"
                optionLabel="label"
                optionValue="id"
                [placeholder]="'analytics.dashboard.allPatients' | translate"
                [showClear]="true"
                [attr.aria-label]="'analytics.dashboard.patientFilter' | translate"
              />
            </div>

            <div class="flex flex-col gap-1 min-w-44">
              <label class="text-xs font-medium text-gray-500" for="filter-template">
                {{ 'analytics.dashboard.questionnaireFilter' | translate }}
              </label>
              <p-select
                inputId="filter-template"
                [options]="templateOptions"
                [(ngModel)]="selectedTemplateCode"
                optionLabel="label"
                optionValue="value"
                [placeholder]="'analytics.dashboard.allQuestionnaires' | translate"
                [showClear]="true"
                [attr.aria-label]="'analytics.dashboard.questionnaireFilter' | translate"
              />
            </div>

            <div class="flex flex-col gap-1 min-w-52">
              <label class="text-xs font-medium text-gray-500" for="filter-period">
                {{ 'analytics.dashboard.periodFilter' | translate }}
              </label>
              <p-datePicker
                inputId="filter-period"
                [(ngModel)]="pickedDates"
                selectionMode="range"
                [numberOfMonths]="2"
                dateFormat="dd/mm/yy"
                [placeholder]="'analytics.dashboard.last8Weeks' | translate"
                [attr.aria-label]="'analytics.dashboard.periodFilter' | translate"
              />
            </div>

            <p-button
              [label]="'analytics.dashboard.refresh' | translate"
              icon="pi pi-refresh"
              (onClick)="refresh()"
            />
          </div>
        </p-card>

        <!-- KPI Sparklines -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-500">{{ 'analytics.dashboard.esasScore' | translate }}</span>
              <span class="text-xl font-bold text-caretrack-navy">
                {{ esasScore() ?? '—' }}
              </span>
            </div>
            <div style="height: 64px">
              <p-chart
                type="bar"
                [data]="esasSparkData"
                [options]="sparkOptions"
                styleClass="w-full h-full"
              />
            </div>
          </div>

          <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-500">{{ 'analytics.dashboard.phq9Score' | translate }}</span>
              <span class="text-xl font-bold text-red-500">
                {{ phq9Score() ?? '—' }}
              </span>
            </div>
            <div style="height: 64px">
              <p-chart
                type="line"
                [data]="phq9SparkData"
                [options]="sparkOptions"
                styleClass="w-full h-full"
              />
            </div>
          </div>

          <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-500">{{ 'analytics.dashboard.completionRate' | translate }}</span>
              <span class="text-xl font-bold text-caretrack-teal">
                {{ completionPercent() ?? '—' }}%
              </span>
            </div>
            <div style="height: 64px">
              <p-chart
                type="line"
                [data]="completionSparkData"
                [options]="sparkOptions"
                styleClass="w-full h-full"
              />
            </div>
          </div>
        </div>

        <!-- Tabs principaux -->
        <p-tabs value="evolution">
          <p-tablist>
            <p-tab value="evolution">{{ 'analytics.dashboard.tabEvolution' | translate }}</p-tab>
            <p-tab value="cohorte">{{ 'analytics.dashboard.tabCohort' | translate }}</p-tab>
            <p-tab value="adherence">{{ 'analytics.dashboard.tabAdherence' | translate }}</p-tab>
            <p-tab value="alertes">{{ 'analytics.dashboard.tabAlerts' | translate }}</p-tab>
          </p-tablist>

          <p-tabpanels>
            <p-tabpanel value="evolution">
              @if (selectedPatientId && selectedTemplateCode) {
                <div class="py-4">
                  <app-patient-evolution-chart
                    [patientId]="selectedPatientId"
                    [templateCode]="selectedTemplateCode"
                    [dateRange]="activeDateRange()"
                  />
                </div>
              } @else {
                <div class="py-12 text-center text-gray-400">
                  <i class="pi pi-arrow-up text-3xl block mb-3 text-slate-200"></i>
                  <p>{{ 'analytics.dashboard.selectPatientAndTemplate' | translate }}</p>
                </div>
              }
            </p-tabpanel>

            <p-tabpanel value="cohorte">
              <div class="py-4">
                <app-cohorte-heatmap
                  diseaseCode="CANCER"
                  [dateRange]="activeDateRange()"
                />
              </div>
            </p-tabpanel>

            <p-tabpanel value="adherence">
              <div class="py-4">
                <app-adherence-chart [dateRange]="activeDateRange()" />
              </div>
            </p-tabpanel>

            <p-tabpanel value="alertes">
              <div class="py-4">
                <app-alertes-trend [dateRange]="activeDateRange()" />
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>

      </div>
    </div>

    <style>
      @media print {
        .sticky, p-button, p-card:first-child { display: none !important; }
        #analytics-print-zone { padding: 0; }
      }
    </style>
  `,
})
export class AnalyticsDashboardPage implements OnInit {
  protected readonly exportService = inject(ExportService);
  private readonly translate = inject(TranslateService);

  protected selectedPatientId: string | null = null;
  protected selectedTemplateCode: string | null = null;

  // Signal pour la plage de dates sélectionnée dans le datepicker (peut contenir 1 ou 2 dates)
  protected readonly pickedDatesSignal = signal<Date[] | null>(null);

  // Propriété ngModel pour le datepicker (pont vers le signal)
  get pickedDates(): Date[] | null {
    return this.pickedDatesSignal();
  }
  set pickedDates(value: Date[] | null) {
    this.pickedDatesSignal.set(value);
  }

  protected readonly activeDateRange = computed<[Date, Date]>(() => {
    const r = this.pickedDatesSignal();
    if (r && r.length === 2 && r[0] && r[1]) {
      return [r[0], r[1]];
    }
    return defaultDateRange();
  });

  protected readonly patientOptions = [
    { id: 'patient-1', label: 'Martin, Sophie' },
    { id: 'patient-2', label: 'Durand, Paul' },
    { id: 'patient-3', label: 'Lemaire, Claire' },
  ];

  protected readonly templateOptions = [
    { value: 'ESAS-R', label: 'ESAS-r' },
    { value: 'PHQ9', label: 'PHQ-9' },
    { value: 'EORTC-QLQ-C30', label: 'EORTC QLQ-C30' },
  ];

  protected readonly esasScore = signal<number | null>(4.2);
  protected readonly phq9Score = signal<number | null>(6.8);
  protected readonly completionPercent = signal<number | null>(87);

  protected readonly esasSparkData: SparkData = {
    labels: DEFAULT_WEEKS,
    datasets: [{
      data: [3.8, 4.5, 4.1, 5.2, 4.8, 4.0, 3.9, 4.2],
      borderColor: '#1565C0',
      backgroundColor: 'rgba(21,101,192,0.2)',
      tension: 0.4,
      fill: true,
    }],
  };

  protected readonly phq9SparkData: SparkData = {
    labels: DEFAULT_WEEKS,
    datasets: [{
      data: [7.2, 6.9, 7.5, 8.1, 7.0, 6.5, 6.8, 6.8],
      borderColor: '#DC2626',
      backgroundColor: 'rgba(220,38,38,0.15)',
      tension: 0.4,
      fill: true,
    }],
  };

  protected readonly completionSparkData: SparkData = {
    labels: DEFAULT_WEEKS,
    datasets: [{
      data: [82, 85, 88, 90, 86, 87, 89, 87],
      borderColor: '#00796B',
      backgroundColor: 'rgba(0,121,107,0.15)',
      tension: 0.4,
      fill: true,
    }],
  };

  protected readonly sparkOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: { point: { radius: 0 } },
    animation: false,
  };

  ngOnInit(): void {
    // Sous-composants se chargent via leurs propres OnChanges
  }

  protected refresh(): void {
    // Forcer la réévaluation du signal de dates pour déclencher OnChanges dans les enfants
    const current = this.pickedDatesSignal();
    if (current && current.length === 2) {
      this.pickedDatesSignal.set([...current]);
    } else {
      const [from, to] = defaultDateRange();
      this.pickedDatesSignal.set([from, to]);
    }
  }
}

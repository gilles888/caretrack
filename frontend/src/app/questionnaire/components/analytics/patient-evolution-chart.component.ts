import {
  Component,
  inject,
  input,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnalyticsService, EvolutionPoint } from '../../services/analytics.service';
import { ExportService } from '../../services/export.service';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

const DOMAIN_COLORS = [
  '#1565C0', '#00796B', '#7B1FA2', '#E65100', '#37474F',
  '#2E7D32', '#C62828', '#AD1457', '#F57F17', '#0277BD',
];

type ChartDataset = {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  borderWidth: number;
  borderDash?: number[];
  pointRadius: number | number[];
  pointHoverRadius?: number;
  pointBackgroundColor?: string[];
};

type ChartData = {
  labels: string[];
  datasets: ChartDataset[];
};

@Component({
  selector: 'app-patient-evolution-chart',
  standalone: true,
  imports: [TranslateModule, ChartModule, ButtonModule, SkeletonModule, MessageModule],
  template: `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">

      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h3 class="font-semibold text-caretrack-navy text-sm">
          {{ 'analytics.evolution.title' | translate }}
          @if (templateCode()) {
            — <span class="text-caretrack-blue">{{ templateCode() }}</span>
          }
        </h3>
        <div class="flex gap-2">
          <p-button
            [label]="'analytics.evolution.csv' | translate"
            icon="pi pi-download"
            size="small"
            [text]="true"
            severity="secondary"
            (onClick)="onExportCSV()"
            [disabled]="data().length === 0"
          />
          <p-button
            [label]="'analytics.evolution.pdf' | translate"
            icon="pi pi-print"
            size="small"
            [text]="true"
            severity="secondary"
            (onClick)="onExportPDF()"
          />
        </div>
      </div>

      @if (loading()) {
        <p-skeleton height="280px" borderRadius="12px" />
      } @else if (data().length === 0) {
        <div class="h-64 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <i class="pi pi-chart-line text-4xl mb-3 block text-slate-200"></i>
            <p class="text-sm">{{ 'analytics.evolution.noData' | translate }}</p>
          </div>
        </div>
      } @else {
        <div style="height: 280px; position: relative">
          <p-chart
            type="line"
            [data]="chartData()"
            [options]="chartOptions()"
            styleClass="w-full h-full"
          />
        </div>

        @if (hasAlertes()) {
          <p-message
            severity="warn"
            [text]="'analytics.evolution.alertDetected' | translate"
            styleClass="w-full"
          />
        }
      }
    </div>
  `,
})
export class PatientEvolutionChartComponent implements OnChanges {
  readonly patientId = input.required<string>();
  readonly templateCode = input<string>('');
  readonly dateRange = input<[Date, Date]>([
    new Date(Date.now() - 56 * 24 * 3600 * 1000),
    new Date(),
  ]);

  private readonly analyticsService = inject(AnalyticsService);
  private readonly exportService = inject(ExportService);
  private readonly translate = inject(TranslateService);

  protected readonly data = signal<EvolutionPoint[]>([]);
  protected readonly loading = signal(false);

  protected readonly hasAlertes = computed(() =>
    this.data().some(p => p.alerteNiveaux.length > 0)
  );

  protected readonly chartData = computed<ChartData>(() => {
    const points = this.data();
    if (points.length === 0) return { labels: [], datasets: [] };

    const labels = points.map(p =>
      new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    );

    const globalDataset: ChartDataset = {
      label: this.translate.instant('analytics.evolution.globalScore'),
      data: points.map(p => p.scoreGlobal),
      borderColor: '#1565C0',
      backgroundColor: 'rgba(21,101,192,0.08)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: points.map(p =>
        p.alerteNiveaux.includes('CRITICAL') ? '#DC2626' :
        p.alerteNiveaux.includes('WARNING') ? '#F59E0B' : '#1565C0'
      ),
    };

    const domaines = [...new Set(points.flatMap(p => Object.keys(p.scores ?? {})))];
    const domainDatasets: ChartDataset[] = domaines.slice(0, 5).map((dom, i) => ({
      label: dom,
      data: points.map(p => p.scores?.[dom] ?? null),
      borderColor: DOMAIN_COLORS[i + 1] ?? DOMAIN_COLORS[0],
      backgroundColor: 'transparent',
      tension: 0.3,
      borderWidth: 1.5,
      borderDash: [4, 4],
      pointRadius: 3,
      fill: false,
    }));

    return { labels, datasets: [globalDataset, ...domainDatasets] };
  });

  protected readonly chartOptions = computed(() => {
    const points = this.data();

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { boxWidth: 12, padding: 16, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            afterLabel: (ctx: { dataIndex: number }) => {
              const point = points[ctx.dataIndex];
              if (!point) return '';
              const parts: string[] = [];
              if (point.alerteNiveaux.length > 0) {
                parts.push(`Alertes : ${point.alerteNiveaux.join(', ')}`);
              }
              if (ctx.dataIndex > 0) {
                const prev = points[ctx.dataIndex - 1];
                if (prev) {
                  const delta = (point.scoreGlobal ?? 0) - (prev.scoreGlobal ?? 0);
                  parts.push(`Delta ${delta > 0 ? '+' : ''}${delta.toFixed(1)} vs précédent`);
                }
              }
              return parts;
            },
          },
        },
        annotation: {
          annotations: {
            alertThreshold: {
              type: 'line' as const,
              yMin: 7,
              yMax: 7,
              borderColor: 'rgba(220,38,38,0.6)',
              borderWidth: 1,
              borderDash: [6, 4],
              label: {
                content: this.translate.instant('analytics.evolution.criticalThreshold'),
                enabled: true,
                position: 'end',
                font: { size: 10 },
                color: '#DC2626',
              },
            },
            warningThreshold: {
              type: 'line' as const,
              yMin: 4,
              yMax: 4,
              borderColor: 'rgba(245,158,11,0.5)',
              borderWidth: 1,
              borderDash: [4, 4],
              label: {
                content: this.translate.instant('analytics.evolution.warningThreshold'),
                enabled: true,
                position: 'end',
                font: { size: 10 },
                color: '#F59E0B',
              },
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          min: 0,
          max: 10,
          grid: { color: '#f1f5f9' },
          ticks: { stepSize: 2, font: { size: 11 } },
        },
      },
      onClick: (_event: unknown, elements: { index: number }[]) => {
        if (elements.length > 0) {
          const first = elements[0];
          if (first) {
            const point = points[first.index];
            if (point) {
              console.log('[Analytics] Clic sur point:', point.reponseId, point.date);
            }
          }
        }
      },
    };
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientId'] || changes['templateCode'] || changes['dateRange']) {
      this.loadData();
    }
  }

  private loadData(): void {
    const pid = this.patientId();
    const code = this.templateCode();
    const range = this.dateRange();
    if (!pid || !code) return;

    this.loading.set(true);
    this.analyticsService.getPatientEvolution(pid, code, range[0], range[1]).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected onExportCSV(): void {
    const pid = this.patientId();
    const code = this.templateCode();
    this.exportService.exportCSV(pid, code, this.dateRange(), this.data());
  }

  protected onExportPDF(): void {
    this.exportService.exportPDF();
  }
}

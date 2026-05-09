import {
  Component,
  inject,
  input,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnalyticsService, CompletionRate } from '../../services/analytics.service';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

const DISEASE_COLORS: Record<string, string> = {
  CANCER: 'rgba(220,38,38,0.7)',
  SEP: 'rgba(245,158,11,0.7)',
  CARDIAC: 'rgba(0,121,107,0.7)',
  DIABETE: 'rgba(124,58,237,0.7)',
  INFLAM: 'rgba(34,197,94,0.7)',
  _global: 'rgba(21,101,192,0.7)',
};

type BarDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
  borderRadius: number;
};

type BarChartData = {
  labels: string[];
  datasets: BarDataset[];
};

@Component({
  selector: 'app-adherence-chart',
  standalone: true,
  imports: [TranslateModule, ChartModule, SkeletonModule],
  template: `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
      <h3 class="font-semibold text-caretrack-navy text-sm">
        {{ 'analytics.adherence.title' | translate }}
      </h3>

      @if (loading()) {
        <p-skeleton height="240px" borderRadius="12px" />
      } @else if (rates().length === 0) {
        <div class="h-48 flex items-center justify-center text-gray-400 text-sm">
          {{ 'analytics.adherence.noData' | translate }}
        </div>
      } @else {
        <div style="height: 240px; position: relative">
          <p-chart
            type="bar"
            [data]="chartData()"
            [options]="chartOptions()"
            styleClass="w-full h-full"
          />
        </div>
      }
    </div>
  `,
})
export class AdherenceChartComponent implements OnChanges {
  readonly dateRange = input<[Date, Date]>([
    new Date(Date.now() - 56 * 24 * 3600 * 1000),
    new Date(),
  ]);

  private readonly analyticsService = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);

  protected readonly rates = signal<CompletionRate[]>([]);
  protected readonly loading = signal(false);

  protected readonly chartData = computed<BarChartData>(() => {
    const r = this.rates();
    const diseases = [...new Set(r.flatMap(c => Object.keys(c.parMaladie)))];

    const labels = r.map(c =>
      c.templateNom.length > 20 ? c.templateNom.slice(0, 18) + '…' : c.templateNom
    );

    const globalDataset: BarDataset = {
      label: this.translate.instant('analytics.adherence.global'),
      data: r.map(c => Math.round(c.tauxGlobal * 100)),
      backgroundColor: DISEASE_COLORS['_global'] ?? 'rgba(21,101,192,0.7)',
      borderRadius: 4,
    };

    const diseaseDatasets: BarDataset[] = diseases.map(d => ({
      label: d,
      data: r.map(c => Math.round((c.parMaladie[d] ?? 0) * 100)),
      backgroundColor: DISEASE_COLORS[d] ?? 'rgba(100,116,139,0.6)',
      borderRadius: 4,
    }));

    return { labels, datasets: [globalDataset, ...diseaseDatasets] };
  });

  protected readonly chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
      },
      annotation: {
        annotations: {
          objectif: {
            type: 'line' as const,
            yMin: 85,
            yMax: 85,
            borderColor: 'rgba(21,101,192,0.5)',
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              content: this.translate.instant('analytics.adherence.target'),
              enabled: true,
              position: 'end' as const,
              font: { size: 10 },
              color: '#1565C0',
            },
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value: number | string) => `${value}%`,
          font: { size: 11 },
        },
      },
    },
  }));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange']) this.loadData();
  }

  private loadData(): void {
    const range = this.dateRange();
    this.loading.set(true);
    this.analyticsService.getCompletionRates(range[0], range[1]).subscribe({
      next: (d) => { this.rates.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

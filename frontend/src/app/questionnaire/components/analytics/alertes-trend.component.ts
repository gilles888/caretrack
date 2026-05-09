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
import { AnalyticsService, AlerteTrendPoint } from '../../services/analytics.service';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

type LineDataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
  tension: number;
  fill: boolean;
  yAxisID: string;
};

type LineChartData = {
  labels: string[];
  datasets: LineDataset[];
};

@Component({
  selector: 'app-alertes-trend',
  standalone: true,
  imports: [TranslateModule, ChartModule, SkeletonModule],
  template: `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
      <h3 class="font-semibold text-caretrack-navy text-sm">
        {{ 'analytics.alertsTrend.title' | translate }}
      </h3>

      @if (loading()) {
        <p-skeleton height="200px" borderRadius="12px" />
      } @else if (trend().length === 0) {
        <div class="h-40 flex items-center justify-center text-gray-400 text-sm">
          {{ 'analytics.alertsTrend.noData' | translate }}
        </div>
      } @else {
        <div style="height: 200px; position: relative">
          <p-chart
            type="line"
            [data]="chartData()"
            [options]="chartOptions()"
            styleClass="w-full h-full"
          />
        </div>
      }
    </div>
  `,
})
export class AlertesTrendComponent implements OnChanges {
  readonly dateRange = input<[Date, Date]>([
    new Date(Date.now() - 56 * 24 * 3600 * 1000),
    new Date(),
  ]);

  private readonly analyticsService = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);

  protected readonly trend = signal<AlerteTrendPoint[]>([]);
  protected readonly loading = signal(false);

  protected readonly chartData = computed<LineChartData>(() => {
    const t = this.trend();
    const labels = t.map(p =>
      new Date(p.semaine).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    );
    return {
      labels,
      datasets: [
        {
          label: this.translate.instant('analytics.alertsTrend.warningAlerts'),
          data: t.map(p => p.nbWarning),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245,158,11,0.15)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: this.translate.instant('analytics.alertsTrend.criticalAlerts'),
          data: t.map(p => p.nbCritical),
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220,38,38,0.15)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: this.translate.instant('analytics.alertsTrend.completionRate'),
          data: t.map(p => Math.round(p.tauxCompletion * 100)),
          borderColor: 'rgba(100,116,139,0.5)',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.3,
          fill: false,
          yAxisID: 'y2',
        },
      ],
    };
  });

  protected readonly chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        min: 0,
        grid: { color: '#f1f5f9' },
        title: {
          display: true,
          text: this.translate.instant('analytics.alertsTrend.alerts'),
          font: { size: 10 },
        },
      },
      y2: {
        type: 'linear' as const,
        position: 'right' as const,
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (value: number | string) => `${value}%`,
          font: { size: 10 },
        },
        title: {
          display: true,
          text: this.translate.instant('analytics.alertsTrend.completion'),
          font: { size: 10 },
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
    this.analyticsService.getAlertesTrend(range[0], range[1]).subscribe({
      next: (d) => { this.trend.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

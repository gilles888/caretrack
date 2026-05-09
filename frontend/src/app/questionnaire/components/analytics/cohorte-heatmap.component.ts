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
import { AnalyticsService, CohortePoint } from '../../services/analytics.service';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-cohorte-heatmap',
  standalone: true,
  imports: [TranslateModule, SkeletonModule, TooltipModule],
  template: `
    <div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">

      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-caretrack-navy text-sm">
          {{ 'analytics.heatmap.title' | translate }} — {{ diseaseCode() }}
        </h3>
        <span class="text-xs text-gray-400">{{ patients().length }} {{ 'analytics.heatmap.patients' | translate }}</span>
      </div>

      @if (loading()) {
        <p-skeleton height="200px" borderRadius="12px" />
      } @else if (patients().length === 0) {
        <div class="h-40 flex items-center justify-center text-gray-400 text-sm">
          {{ 'analytics.heatmap.noData' | translate }}
        </div>
      } @else {
        <div class="overflow-x-auto">
          <div class="min-w-max">

            <!-- Header semaines -->
            <div class="flex mb-1">
              <div class="w-36 flex-shrink-0"></div>
              @for (semaine of semaines(); track semaine) {
                <div class="w-10 text-center text-xs text-gray-400 truncate">
                  {{ formatSemaine(semaine) }}
                </div>
              }
            </div>

            <!-- Lignes patients -->
            @for (patient of patients(); track patient) {
              <div class="flex items-center mb-1">
                <div class="w-36 flex-shrink-0 text-xs text-gray-600 truncate pr-2 text-right">
                  {{ patient }}
                </div>
                @for (semaine of semaines(); track semaine) {
                  <div
                    class="w-10 h-8 mx-px rounded cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    [style.background]="cellColor(getCell(patient, semaine)?.scoreGlobal)"
                    [pTooltip]="cellTooltip(getCell(patient, semaine))"
                    tooltipPosition="top"
                    [attr.aria-label]="cellTooltip(getCell(patient, semaine))"
                    (click)="onCellClick(getCell(patient, semaine))"
                    (keydown.enter)="onCellClick(getCell(patient, semaine))"
                    (keydown.space)="onCellClick(getCell(patient, semaine))"
                    tabindex="0"
                    role="button"
                  >
                    @if (getCell(patient, semaine)?.alerteNiveau === 'CRITICAL') {
                      <span class="text-white text-xs font-bold">!</span>
                    }
                  </div>
                }
              </div>
            }

            <!-- Légende -->
            <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>{{ 'analytics.heatmap.score' | translate }}</span>
              @for (leg of legend; track leg.labelKey) {
                <div class="flex items-center gap-1">
                  <div class="w-4 h-4 rounded" [style.background]="leg.color"></div>
                  <span>{{ leg.labelKey | translate }}</span>
                </div>
              }
              <div class="flex items-center gap-1">
                <div class="w-4 h-4 rounded bg-slate-200"></div>
                <span>{{ 'analytics.heatmap.noDataCell' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CohorteHeatmapComponent implements OnChanges {
  readonly diseaseCode = input.required<string>();
  readonly dateRange = input<[Date, Date]>([
    new Date(Date.now() - 56 * 24 * 3600 * 1000),
    new Date(),
  ]);

  private readonly analyticsService = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);

  protected readonly rawData = signal<CohortePoint[]>([]);
  protected readonly loading = signal(false);

  protected readonly legend = [
    { labelKey: 'analytics.heatmap.legend.low',      color: '#bbf7d0' },
    { labelKey: 'analytics.heatmap.legend.moderate',  color: '#fde68a' },
    { labelKey: 'analytics.heatmap.legend.high',      color: '#fca5a5' },
  ];

  protected readonly patients = computed(() =>
    [...new Set(this.rawData().map(p => p.patientNom))].slice(0, 20)
  );

  protected readonly semaines = computed(() =>
    [...new Set(this.rawData().map(p => p.semaine))].sort()
  );

  private readonly cellIndex = computed(() => {
    const idx = new Map<string, CohortePoint>();
    this.rawData().forEach(p => idx.set(`${p.patientNom}::${p.semaine}`, p));
    return idx;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diseaseCode'] || changes['dateRange']) {
      this.loadData();
    }
  }

  private loadData(): void {
    const code = this.diseaseCode();
    const range = this.dateRange();
    this.loading.set(true);
    this.analyticsService.getCohorteData(code, range[0], range[1]).subscribe({
      next: (d) => { this.rawData.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected getCell(patient: string, semaine: string): CohortePoint | undefined {
    return this.cellIndex().get(`${patient}::${semaine}`);
  }

  protected cellColor(score?: number | null): string {
    if (score === null || score === undefined) return '#f1f5f9';
    if (score <= 3) return `hsl(142, ${30 + score * 20}%, ${85 - score * 5}%)`;
    if (score <= 6) return `hsl(48, ${60 + (score - 3) * 10}%, ${85 - (score - 3) * 5}%)`;
    return `hsl(0, ${40 + (score - 6) * 20}%, ${85 - (score - 6) * 5}%)`;
  }

  protected cellTooltip(cell?: CohortePoint): string {
    if (!cell) return this.translate.instant('analytics.heatmap.noDataCell');
    const alerte = cell.alerteNiveau ? ` · Alerte : ${cell.alerteNiveau}` : '';
    return `${cell.patientNom} · Score ${cell.scoreGlobal?.toFixed(1) ?? '—'}${alerte}`;
  }

  protected formatSemaine(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  protected onCellClick(cell?: CohortePoint): void {
    if (!cell) return;
    console.log('[Heatmap] Clic patient:', cell.patientId, cell.semaine);
  }
}

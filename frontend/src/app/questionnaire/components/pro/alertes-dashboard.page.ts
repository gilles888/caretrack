import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { AlerteDto } from '../../models/alerte.model';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-alertes-dashboard',
  imports: [
    TranslateModule,
    MessageModule, AccordionModule, ButtonModule, TagModule,
    CardModule, BadgeModule, ProgressBarModule, TooltipModule, SkeletonModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <div class="max-w-4xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-caretrack-navy">{{ 'pro.alerts.title' | translate }}</h1>
            @if (store.alertesNonAcquittees().length > 0) {
              <p-badge
                [value]="store.alertesNonAcquittees().length"
                severity="danger"
              />
            }
          </div>
          <div class="flex gap-2">
            <p-button
              [label]="'pro.alerts.acknowledgeAll' | translate"
              icon="pi pi-check-square"
              [outlined]="true"
              severity="secondary"
              size="small"
              [disabled]="store.alertesNonAcquittees().length === 0"
              (click)="acknowledgeAll()"
            />
            <p-button
              [label]="'pro.alerts.refresh' | translate"
              icon="pi pi-refresh"
              [outlined]="true"
              size="small"
              (click)="store.loadAlertes()"
              [loading]="store.loading()"
            />
          </div>
        </div>

        <!-- Banner critique -->
        @if (store.alertesCritiques().length > 0) {
          <p-message
            severity="error"
            [text]="store.alertesCritiques().length + ' ' + ('pro.alerts.criticalBanner' | translate)"
            styleClass="w-full animate-pulse"
          />
        }

        <!-- Stats rapides -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-red-600">{{ store.alertesCritiques().length }}</p>
            <p class="text-xs text-red-500 mt-1">{{ 'pro.alerts.critiques' | translate }}</p>
          </div>
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-orange-500">{{ store.alertesWarning().length }}</p>
            <p class="text-xs text-orange-400 mt-1">{{ 'pro.alerts.warnings' | translate }}</p>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-slate-600">{{ store.alertesNonAcquittees().length }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ 'pro.alerts.unacknowledged' | translate }}</p>
          </div>
        </div>

        <!-- Loading -->
        @if (store.loading()) {
          <div class="space-y-3">
            @for (_ of skeletonRows; track $index) {
              <p-skeleton height="80px" borderRadius="12px" />
            }
          </div>
        } @else if (store.alertes().length === 0) {
          <div class="text-center py-16 text-gray-400 bg-white rounded-2xl border border-slate-100">
            <i class="pi pi-check-circle text-5xl text-green-400 mb-4 block"></i>
            <p class="text-lg font-medium text-gray-500">{{ 'pro.alerts.noAlerts' | translate }}</p>
            <p class="text-sm mt-2">{{ 'pro.alerts.noAlertsSub' | translate }}</p>
          </div>
        } @else {

          <!-- Critiques en premier -->
          @if (store.alertesCritiques().length > 0) {
            <div class="space-y-2">
              <h2 class="text-sm font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-exclamation-triangle"></i> {{ 'pro.alerts.critiquesSection' | translate }}
              </h2>
              <p-accordion [multiple]="true">
                @for (alerte of store.alertesCritiques(); track alerte.id) {
                  <p-accordion-panel [value]="alerte.id">
                    <p-accordion-header>
                      <ng-template #toggleicon></ng-template>
                      <div class="flex items-center justify-between w-full gap-3 pr-2">
                        <div class="flex items-center gap-3 min-w-0">
                          <i class="pi pi-exclamation-triangle text-red-500 text-xl flex-shrink-0"></i>
                          <div class="min-w-0">
                            <p class="font-semibold text-caretrack-navy truncate">{{ alerte.patientNom }}</p>
                            <p class="text-xs text-gray-400 truncate">{{ alerte.message }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                          <p-tag [value]="'pro.alerts.criticalTag' | translate" severity="danger" />
                          <span class="text-xs text-gray-400">{{ relativeTime(alerte.createdAt) }}</span>
                        </div>
                      </div>
                    </p-accordion-header>
                    <p-accordion-content>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div class="space-y-3">
                          <h3 class="text-sm font-semibold text-gray-600">{{ 'pro.alerts.observedValue' | translate }}</h3>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-gray-600">{{ alerte.itemCode }}</span>
                              <span class="font-bold text-red-600">{{ alerte.valeurObservee }}/10</span>
                            </div>
                            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                class="h-full rounded-full transition-all bg-red-500"
                                [style.width.%]="alerte.valeurObservee * 10"
                              ></div>
                            </div>
                          </div>
                          <p class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">{{ alerte.message }}</p>
                        </div>
                        <div class="space-y-3">
                          <h3 class="text-sm font-semibold text-gray-600">{{ 'pro.alerts.actions' | translate }}</h3>
                          <div class="flex flex-col gap-2">
                            <p-button
                              [label]="'pro.alerts.callPatient' | translate"
                              icon="pi pi-phone"
                              severity="danger"
                              styleClass="w-full justify-center"
                              size="small"
                            />
                            <p-button
                              [label]="'pro.alerts.scheduleConsult' | translate"
                              icon="pi pi-calendar-plus"
                              [outlined]="true"
                              styleClass="w-full justify-center"
                              size="small"
                            />
                            @if (!alerte.isAcknowledged) {
                              <p-button
                                [label]="'pro.alerts.acknowledge' | translate"
                                icon="pi pi-check"
                                [text]="true"
                                severity="secondary"
                                styleClass="w-full justify-center"
                                size="small"
                                (click)="acknowledge(alerte.id)"
                              />
                            } @else {
                              <div class="flex items-center gap-2 text-green-600 text-sm py-1 justify-center">
                                <i class="pi pi-check-circle"></i>
                                <span>{{ 'pro.alerts.acknowledged' | translate }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </p-accordion-content>
                  </p-accordion-panel>
                }
              </p-accordion>
            </div>
          }

          <!-- Warnings -->
          @if (store.alertesWarning().length > 0) {
            <div class="space-y-2">
              <h2 class="text-sm font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-info-circle"></i> {{ 'pro.alerts.warningsSection' | translate }}
              </h2>
              <p-accordion [multiple]="true">
                @for (alerte of store.alertesWarning(); track alerte.id) {
                  <p-accordion-panel [value]="alerte.id">
                    <p-accordion-header>
                      <ng-template #toggleicon></ng-template>
                      <div class="flex items-center justify-between w-full gap-3 pr-2">
                        <div class="flex items-center gap-3 min-w-0">
                          <i class="pi pi-exclamation-circle text-orange-400 text-xl flex-shrink-0"></i>
                          <div class="min-w-0">
                            <p class="font-semibold text-caretrack-navy truncate">{{ alerte.patientNom }}</p>
                            <p class="text-xs text-gray-400 truncate">{{ alerte.message }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                          <p-tag [value]="'pro.alerts.warningTag' | translate" severity="warn" />
                          <span class="text-xs text-gray-400">{{ relativeTime(alerte.createdAt) }}</span>
                        </div>
                      </div>
                    </p-accordion-header>
                    <p-accordion-content>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div class="space-y-3">
                          <h3 class="text-sm font-semibold text-gray-600">{{ 'pro.alerts.observedValue' | translate }}</h3>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-gray-600">{{ alerte.itemCode }}</span>
                              <span class="font-bold text-orange-500">{{ alerte.valeurObservee }}/10</span>
                            </div>
                            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                class="h-full rounded-full transition-all bg-orange-400"
                                [style.width.%]="alerte.valeurObservee * 10"
                              ></div>
                            </div>
                          </div>
                          <p class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">{{ alerte.message }}</p>
                        </div>
                        <div class="space-y-3">
                          <h3 class="text-sm font-semibold text-gray-600">{{ 'pro.alerts.actions' | translate }}</h3>
                          <div class="flex flex-col gap-2">
                            <p-button
                              [label]="'pro.alerts.callPatient' | translate"
                              icon="pi pi-phone"
                              severity="danger"
                              [outlined]="true"
                              styleClass="w-full justify-center"
                              size="small"
                            />
                            <p-button
                              [label]="'pro.alerts.scheduleConsult' | translate"
                              icon="pi pi-calendar-plus"
                              [outlined]="true"
                              styleClass="w-full justify-center"
                              size="small"
                            />
                            @if (!alerte.isAcknowledged) {
                              <p-button
                                [label]="'pro.alerts.acknowledge' | translate"
                                icon="pi pi-check"
                                [text]="true"
                                severity="secondary"
                                styleClass="w-full justify-center"
                                size="small"
                                (click)="acknowledge(alerte.id)"
                              />
                            } @else {
                              <div class="flex items-center gap-2 text-green-600 text-sm py-1 justify-center">
                                <i class="pi pi-check-circle"></i>
                                <span>{{ 'pro.alerts.acknowledged' | translate }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </p-accordion-content>
                  </p-accordion-panel>
                }
              </p-accordion>
            </div>
          }
        }

      </div>
    </div>
  `,
})
export class AlertesDashboardPage implements OnInit {
  protected readonly store = inject(QuestionnaireStore);
  private readonly translate = inject(TranslateService);
  protected readonly skeletonRows = [1, 2, 3];

  ngOnInit(): void {
    this.store.loadAlertes();
  }

  protected acknowledge(id: string): void {
    this.store.acknowledgeAlerte(id);
  }

  protected acknowledgeAll(): void {
    const nonAcq = this.store.alertesNonAcquittees();
    nonAcq.forEach(a => this.store.acknowledgeAlerte(a.id));
  }

  protected relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor(diff / 60_000);
    const days = Math.floor(h / 24);
    if (h >= 24) return this.translate.instant('common.time.daysAgo', { count: days });
    if (h >= 1) return this.translate.instant('common.time.hoursAgo', { count: h });
    if (m >= 1) return this.translate.instant('common.time.minutesAgo', { count: m });
    return this.translate.instant('common.time.justNow');
  }
}

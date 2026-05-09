import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { PlanBuilderStore } from '../../store/plan-builder.store';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { QuestionnaireTemplate } from '../../models/questionnaire-template.model';
import { PlanItemEtendu, Frequence, EntityOption } from '../../models/plan-builder.model';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

type FrequenceSection = {
  key: Frequence;
  labelKey: string;
  color: string;
  bgClass: string;
  borderClass: string;
};

const SECTIONS: FrequenceSection[] = [
  { key: 'QUOTIDIEN',   labelKey: 'pro.builder.freq.QUOTIDIEN',   color: '#1565C0', bgClass: 'bg-blue-50',   borderClass: 'border-blue-200' },
  { key: 'HEBDO',       labelKey: 'pro.builder.freq.HEBDO',       color: '#7B1FA2', bgClass: 'bg-purple-50', borderClass: 'border-purple-200' },
  { key: 'MENSUEL',     labelKey: 'pro.builder.freq.MENSUEL',     color: '#00796B', bgClass: 'bg-teal-50',   borderClass: 'border-teal-200' },
  { key: 'TRIMESTRIEL', labelKey: 'pro.builder.freq.TRIMESTRIEL', color: '#E65100', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' },
  { key: 'PAR_CYCLE',   labelKey: 'pro.builder.freq.PAR_CYCLE',   color: '#37474F', bgClass: 'bg-slate-50',  borderClass: 'border-slate-200' },
];

type ModuleConfig = {
  labelKey: string;
  scope: 'CORE' | 'DISEASE_SPECIFIC';
  diseaseFilter?: string;
  badgeClass: string;
  defaultFreq: Frequence;
};

const MODULES: ModuleConfig[] = [
  { labelKey: 'Core universel',          scope: 'CORE',             badgeClass: 'bg-blue-100 text-blue-700',     defaultFreq: 'HEBDO' },
  { labelKey: 'Cancer',                  scope: 'DISEASE_SPECIFIC', diseaseFilter: 'CANCER',  badgeClass: 'bg-red-100 text-red-700',       defaultFreq: 'HEBDO' },
  { labelKey: 'SEP',                     scope: 'DISEASE_SPECIFIC', diseaseFilter: 'SEP',     badgeClass: 'bg-orange-100 text-orange-700', defaultFreq: 'MENSUEL' },
  { labelKey: 'Insuffisance cardiaque',  scope: 'DISEASE_SPECIFIC', diseaseFilter: 'CARDIAC', badgeClass: 'bg-teal-100 text-teal-700',     defaultFreq: 'HEBDO' },
  { labelKey: 'Diabète',                 scope: 'DISEASE_SPECIFIC', diseaseFilter: 'DIABETE', badgeClass: 'bg-purple-100 text-purple-700', defaultFreq: 'MENSUEL' },
  { labelKey: 'Maladies inflammatoires', scope: 'DISEASE_SPECIFIC', diseaseFilter: 'INFLAM',  badgeClass: 'bg-green-100 text-green-700',  defaultFreq: 'MENSUEL' },
];

@Component({
  selector: 'app-plan-builder',
  standalone: true,
  providers: [ConfirmationService],
  imports: [
    NgClass,
    FormsModule,
    TranslateModule,
    DragDropModule,
    AccordionModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    TagModule,
    CardModule,
    MessageModule,
    TooltipModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    DatePickerModule,
    SelectModule,
    SkeletonModule,
    DividerModule,
  ],
  styles: [`
    .cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border-radius: 12px;
      opacity: 0.95;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      background: #f8fafc;
    }
    .cdk-drag-animating {
      transition: transform 200ms cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .cdk-drop-list-dragging .plan-item:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .drop-zone-active {
      background: rgba(21, 101, 192, 0.05);
      border-color: #1565C0 !important;
    }
  `],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Header sticky -->
      <div class="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              (click)="navigateBack()"
              [attr.aria-label]="'pro.builder.back' | translate"
            >
              <i class="pi pi-arrow-left text-gray-600"></i>
            </button>
            <h1 class="text-xl font-bold text-[#0D1B2A]">{{ 'pro.builder.title' | translate }}</h1>
            @if (store.isDirty()) {
              <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                {{ 'pro.builder.unsaved' | translate }}
              </span>
            }
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500 font-medium">
              <i class="pi pi-clock text-[#00796B] mr-1"></i>
              {{ store.totalDureeFormatted() }}
            </span>
            <p-button
              [label]="'pro.builder.save' | translate"
              icon="pi pi-save"
              severity="success"
              size="small"
              [loading]="store.saving()"
              [disabled]="!store.isDirty() || !store.selectedEntityId()"
              (onClick)="savePlan()"
            />
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto p-4 md:p-6">

        <!-- Sélecteur entité + message erreur -->
        <div class="mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex flex-col gap-1 min-w-64">
            <label class="text-xs font-medium text-gray-500" for="entity-select">
              {{ 'pro.builder.entityLabel' | translate }}
            </label>
            <p-select
              inputId="entity-select"
              [options]="entityOptions"
              [(ngModel)]="selectedEntityId"
              optionLabel="label"
              optionValue="id"
              [placeholder]="'pro.builder.entityPlaceholder' | translate"
              [showClear]="true"
              (onChange)="onEntityChange($event.value)"
              [ariaLabel]="'pro.builder.entityLabel' | translate"
            />
          </div>
          @if (store.error()) {
            <p-message severity="error" [text]="store.error()!" />
          }
        </div>

        <!-- Layout 2 colonnes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- COLONNE GAUCHE — Bibliothèque -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold text-[#0D1B2A]">{{ 'pro.builder.library' | translate }}</h2>
              <span class="text-xs text-gray-400">{{ filteredCount() }} {{ 'pro.builder.questionnaires' | translate }}</span>
            </div>

            <!-- Filtre -->
            <input
              pInputText
              id="library-filter"
              [placeholder]="'pro.builder.filterPlaceholder' | translate"
              [(ngModel)]="libraryFilter"
              [attr.aria-label]="'pro.builder.filterPlaceholder' | translate"
              class="w-full"
            />

            <!-- Modules accordion -->
            @if (store.loading()) {
              <div class="space-y-2">
                @for (_ of skeletons; track $index) {
                  <p-skeleton height="52px" borderRadius="8px" />
                }
              </div>
            } @else {
              <p-accordion [multiple]="true" [value]="openModules">
                @for (module of modules; track module.labelKey) {
                  <p-accordion-panel [value]="module.labelKey">
                    <p-accordion-header>
                      <div class="flex items-center justify-between w-full pr-2">
                        <span class="font-medium text-sm text-[#0D1B2A]">{{ module.labelKey }}</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold {{ module.badgeClass }}">
                          {{ getModuleTemplates(module).length }}
                        </span>
                      </div>
                    </p-accordion-header>
                    <p-accordion-content>
                      <div class="space-y-2 py-2">
                        @if (getModuleTemplates(module).length === 0) {
                          <p class="text-xs text-gray-400 text-center py-3">
                            {{ 'pro.builder.noMatch' | translate }}
                          </p>
                        }
                        @for (tpl of getModuleTemplates(module); track tpl.id) {
                          <div
                            class="bg-white border border-slate-200 rounded-xl p-3
                                   hover:shadow-sm hover:border-[#1565C0] transition-all
                                   flex items-start gap-3"
                            [class.opacity-50]="store.planTemplateIds().has(tpl.id)"
                          >
                            <!-- Info template -->
                            <div class="flex-1 min-w-0">
                              <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                  <p class="font-medium text-sm text-[#0D1B2A] truncate">{{ tpl.nom }}</p>
                                  <p class="text-xs text-gray-400 mt-0.5">
                                    {{ tpl.code }} · {{ tpl.items.length }} items · {{ tpl.dureeEstimeeMinutes }} min
                                  </p>
                                </div>
                                <span
                                  class="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  [class.bg-green-100]="isFreeLicence(tpl)"
                                  [class.text-green-700]="isFreeLicence(tpl)"
                                  [class.bg-orange-100]="!isFreeLicence(tpl)"
                                  [class.text-orange-700]="!isFreeLicence(tpl)"
                                >
                                  {{ isFreeLicence(tpl) ? ('pro.builder.free' | translate) : ('pro.builder.auth' | translate) }}
                                </span>
                              </div>
                            </div>

                            <!-- Bouton ajouter -->
                            <p-button
                              icon="pi pi-plus"
                              [text]="true"
                              size="small"
                              [pTooltip]="'pro.builder.addToPlan' | translate"
                              [disabled]="store.planTemplateIds().has(tpl.id)"
                              [ariaLabel]="('pro.builder.addToPlan' | translate) + ' ' + tpl.nom"
                              (onClick)="addToPlan(tpl, module.defaultFreq)"
                            />
                          </div>
                        }
                      </div>
                    </p-accordion-content>
                  </p-accordion-panel>
                }
              </p-accordion>
            }
          </div>

          <!-- COLONNE DROITE — Plan actif -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold text-[#0D1B2A]">
                {{ 'pro.builder.plan' | translate }}
                @if (selectedEntityLabel()) {
                  <span class="text-[#00796B]"> — {{ selectedEntityLabel() }}</span>
                }
              </h2>
              <span class="text-xs text-gray-400">{{ store.planItems().length }} {{ 'pro.builder.questionnaires' | translate }}</span>
            </div>

            @if (!store.selectedEntityId()) {
              <div class="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-gray-400">
                <i class="pi pi-user text-4xl mb-3 block text-slate-300"></i>
                <p class="text-sm">{{ 'pro.builder.selectEntity' | translate }}</p>
              </div>
            } @else {

              <!-- Drop zones par fréquence -->
              <div cdkDropListGroup class="space-y-3">
                @for (section of sections; track section.key) {
                  <div
                    class="rounded-xl border-2 overflow-hidden"
                    [ngClass]="[section.bgClass, section.borderClass]"
                  >
                    <!-- Section header -->
                    <div class="px-4 py-2 flex items-center justify-between">
                      <span class="text-xs font-bold uppercase tracking-wider" [style.color]="section.color">
                        {{ section.labelKey | translate }}
                        <span class="ml-2 font-normal text-gray-400">
                          ({{ store.itemsByFrequence()[section.key].length }})
                        </span>
                      </span>
                      <span class="text-xs text-gray-400">
                        {{ sectionDuree(section.key) }}
                      </span>
                    </div>

                    <!-- Drop list CDK -->
                    <div
                      cdkDropList
                      [id]="'droplist-' + section.key"
                      [cdkDropListData]="getSectionItems(section.key)"
                      [cdkDropListConnectedTo]="connectedDropLists"
                      (cdkDropListDropped)="onDrop($event, section.key)"
                      class="min-h-16 px-3 pb-3 space-y-2"
                    >
                      @if (store.itemsByFrequence()[section.key].length === 0) {
                        <div class="h-12 flex items-center justify-center text-xs text-gray-300 border border-dashed border-gray-200 rounded-lg">
                          {{ 'pro.builder.dropHere' | translate }}
                        </div>
                      }

                      @for (item of store.itemsByFrequence()[section.key]; track item.templateId) {
                        <div
                          cdkDrag
                          [cdkDragData]="item"
                          class="plan-item bg-white border border-slate-200 rounded-xl p-3 cursor-grab hover:shadow-sm transition-all"
                        >
                          <div class="flex items-start gap-3">
                            <!-- Drag handle -->
                            <div
                              cdkDragHandle
                              class="mt-1 cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0"
                              [attr.aria-label]="'pro.builder.moveItem' | translate"
                            >
                              <i class="pi pi-bars text-sm"></i>
                            </div>

                            <!-- Contenu -->
                            <div class="flex-1 min-w-0 space-y-2">
                              <div class="flex items-start justify-between gap-2">
                                <p class="font-medium text-sm text-[#0D1B2A] truncate">
                                  {{ item.templateNom }}
                                </p>
                                <p-button
                                  icon="pi pi-trash"
                                  [text]="true"
                                  severity="danger"
                                  size="small"
                                  [ariaLabel]="('pro.builder.remove' | translate) + ' ' + item.templateNom"
                                  (onClick)="removeItem(item.templateId)"
                                />
                              </div>

                              <!-- Contrôles -->
                              <div class="grid grid-cols-2 gap-2">
                                <!-- Fréquence -->
                                <div class="flex flex-col gap-1">
                                  <label class="text-xs text-gray-400">{{ 'pro.builder.freq' | translate }}</label>
                                  <p-select
                                    [options]="frequenceOptions"
                                    [(ngModel)]="item.frequence"
                                    optionLabel="label"
                                    optionValue="value"
                                    (onChange)="onFrequenceChange(item, $event.value)"
                                    [ariaLabel]="('pro.builder.freq' | translate) + ' ' + item.templateNom"
                                  />
                                </div>

                                <!-- Rappel switch -->
                                <div class="flex flex-col gap-1">
                                  <label class="text-xs text-gray-400">{{ 'pro.builder.reminder' | translate }}</label>
                                  <div class="flex items-center gap-2 mt-1">
                                    <p-toggleSwitch
                                      [(ngModel)]="item.rappelActif"
                                      (onChange)="store.isDirty.set(true)"
                                      [ariaLabel]="('pro.builder.reminder' | translate) + ' ' + item.templateNom"
                                    />
                                    <span class="text-xs text-gray-500">
                                      {{ item.rappelActif ? ('pro.builder.reminderOn' | translate) : ('pro.builder.reminderOff' | translate) }}
                                    </span>
                                  </div>
                                </div>

                                <!-- Heure rappel -->
                                @if (item.rappelActif) {
                                  <div class="flex flex-col gap-1 col-span-2">
                                    <label class="text-xs text-gray-400">{{ 'pro.builder.reminderTime' | translate }}</label>
                                    <p-datePicker
                                      [(ngModel)]="item.heureRappel"
                                      [timeOnly]="true"
                                      hourFormat="24"
                                      placeholder="08:00"
                                      (onSelect)="store.isDirty.set(true)"
                                      [ariaLabel]="('pro.builder.reminderTime' | translate) + ' ' + item.templateNom"
                                    />
                                  </div>
                                }
                              </div>

                              <!-- Durée estimée -->
                              <p class="text-xs text-gray-400">
                                {{ item.dureeEstimeeMinutes }} min
                                @if (!isFreeLicenceStr(item.licenceInfo)) {
                                  · <span class="text-orange-500">{{ 'pro.builder.authRequired' | translate }}</span>
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Footer plan -->
              <p-card styleClass="mt-4">
                <div class="space-y-4">
                  <!-- Stats -->
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600 font-medium">{{ 'pro.builder.totalLoad' | translate }}</span>
                    <span class="font-bold text-[#00796B] text-lg">
                      {{ store.totalDureeFormatted() }}
                    </span>
                  </div>

                  <p-divider />

                  <!-- Actions -->
                  <div class="flex flex-col gap-2">
                    <p-button
                      [label]="'pro.builder.savePlan' | translate"
                      icon="pi pi-save"
                      severity="success"
                      styleClass="w-full justify-center"
                      [loading]="store.saving()"
                      [disabled]="!store.isDirty()"
                      (onClick)="savePlan()"
                    />
                    <p-button
                      [label]="'pro.builder.reset' | translate"
                      icon="pi pi-refresh"
                      severity="secondary"
                      [outlined]="true"
                      styleClass="w-full justify-center"
                      [disabled]="store.planItems().length === 0"
                      (onClick)="confirmReset()"
                    />
                    <p-button
                      [label]="'pro.builder.applyAll' | translate"
                      icon="pi pi-users"
                      severity="help"
                      [outlined]="true"
                      styleClass="w-full justify-center"
                      [disabled]="!store.isDirty() || store.planItems().length === 0"
                      (onClick)="applyToAll()"
                    />
                  </div>
                </div>
              </p-card>
            }
          </div>

        </div>
      </div>
    </div>

    <!-- ConfirmDialog global -->
    <p-confirmDialog />
  `,
})
export class PlanBuilderComponent implements OnInit, OnDestroy {
  protected readonly store = inject(PlanBuilderStore);
  private readonly qStore = inject(QuestionnaireStore);
  private readonly confirmService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly sections = SECTIONS;
  protected readonly modules = MODULES;
  protected readonly skeletons = Array(4).fill(0);

  protected selectedEntityId: string | null = null;
  protected libraryFilter = '';
  protected openModules = MODULES.map(m => m.labelKey);

  protected readonly entityOptions: EntityOption[] = [
    { id: 'patient-1',    label: 'Martin, Sophie',              type: 'PATIENT',   maladie: 'CANCER' },
    { id: 'patient-2',    label: 'Durand, Paul',                type: 'PATIENT',   maladie: 'SEP' },
    { id: 'proto-cancer', label: '[Protocole] Cancer standard', type: 'PROTOCOLE', maladie: 'CANCER' },
    { id: 'proto-sep',    label: '[Protocole] SEP rémittente',  type: 'PROTOCOLE', maladie: 'SEP' },
  ];

  protected get frequenceOptions() {
    return [
      { label: this.translate.instant('pro.builder.freq.QUOTIDIEN'),   value: 'QUOTIDIEN' },
      { label: this.translate.instant('pro.builder.freq.HEBDO'),       value: 'HEBDO' },
      { label: this.translate.instant('pro.builder.freq.MENSUEL'),     value: 'MENSUEL' },
      { label: this.translate.instant('pro.builder.freq.TRIMESTRIEL'), value: 'TRIMESTRIEL' },
      { label: this.translate.instant('pro.builder.freq.PAR_CYCLE'),   value: 'PAR_CYCLE' },
    ];
  }

  /** IDs des drop lists CDK — utilisés pour [cdkDropListConnectedTo] */
  protected readonly connectedDropLists = SECTIONS.map(s => `droplist-${s.key}`);

  protected readonly filteredCount = computed(() =>
    this.modules.reduce((acc, m) => acc + this.getModuleTemplates(m).length, 0)
  );

  protected readonly selectedEntityLabel = computed(() => {
    const opt = this.entityOptions.find(e => e.id === this.selectedEntityId);
    return opt?.label ?? null;
  });

  ngOnInit(): void {
    this.store.loadTemplates();
    this.qStore.loadTemplates();
  }

  ngOnDestroy(): void {}

  /** Exposé pour le planDirtyGuard */
  hasUnsavedChanges(): boolean {
    return this.store.isDirty();
  }

  protected onEntityChange(id: string | null): void {
    if (id) {
      this.store.loadPlanForPatient(id);
    } else {
      this.store.reset();
    }
  }

  protected getModuleTemplates(module: ModuleConfig): QuestionnaireTemplate[] {
    const all = this.store.availableTemplates();
    const filter = this.libraryFilter.toLowerCase().trim();

    return all.filter(t => {
      if (module.scope === 'CORE' && t.scope !== 'CORE') return false;
      if (module.scope === 'DISEASE_SPECIFIC' && t.scope !== 'DISEASE_SPECIFIC') return false;
      if (filter && !t.nom.toLowerCase().includes(filter) && !t.code.toLowerCase().includes(filter)) {
        return false;
      }
      return true;
    });
  }

  protected getSectionItems(freq: Frequence): PlanItemEtendu[] {
    return this.store.itemsByFrequence()[freq] ?? [];
  }

  protected sectionDuree(freq: Frequence): string {
    const items = this.getSectionItems(freq);
    if (items.length === 0) return '';
    const total = items.reduce((acc, i) => acc + i.dureeEstimeeMinutes, 0);
    return `${total} min`;
  }

  protected isFreeLicence(tpl: QuestionnaireTemplate): boolean {
    return this.isFreeLicenceStr(tpl.licenceInfo);
  }

  protected isFreeLicenceStr(info: string): boolean {
    const lower = (info ?? '').toLowerCase();
    return lower.includes('libre') || lower.includes('free') || lower.includes('public') || lower === '';
  }

  protected addToPlan(tpl: QuestionnaireTemplate, freq: Frequence): void {
    this.store.addTemplate(tpl, freq);
  }

  protected removeItem(templateId: string): void {
    this.store.removeItem(templateId);
  }

  protected onFrequenceChange(item: PlanItemEtendu, newFreq: Frequence): void {
    this.store.updateItemFrequence(item.templateId, newFreq);
  }

  protected onDrop(event: CdkDragDrop<PlanItemEtendu[]>, targetFreq: Frequence): void {
    const item = event.item.data as PlanItemEtendu;
    const sourceFreq = item.frequence;

    if (sourceFreq === targetFreq) {
      const sectionItems = [...(this.store.itemsByFrequence()[targetFreq] ?? [])];
      moveItemInArray(sectionItems, event.previousIndex, event.currentIndex);
      const otherItems = this.store.planItems().filter(i => i.frequence !== targetFreq);
      this.store.reorderItems([...otherItems, ...sectionItems]);
    } else {
      this.store.updateItemFrequence(item.templateId, targetFreq);
    }
  }

  protected savePlan(): void {
    const id = this.store.selectedEntityId();
    if (!id) return;
    this.store.savePlan(id);
  }

  protected confirmReset(): void {
    this.confirmService.confirm({
      message: this.translate.instant('pro.builder.confirmReset.message'),
      header: this.translate.instant('pro.builder.confirmReset.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('pro.builder.confirmReset.accept'),
      rejectLabel: this.translate.instant('pro.builder.confirmReset.reject'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.reset(),
    });
  }

  protected applyToAll(): void {
    const entity = this.entityOptions.find(e => e.id === this.selectedEntityId);
    const maladie = entity?.maladie ?? 'cette maladie';
    this.confirmService.confirm({
      message: `${this.translate.instant('pro.builder.confirmApply.message') ?? ''} ${maladie} ?`,
      header: this.translate.instant('pro.builder.confirmApply.header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('pro.builder.confirmApply.accept'),
      rejectLabel: this.translate.instant('pro.builder.confirmApply.reject'),
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        console.log('Apply bulk to', maladie);
      },
    });
  }

  protected navigateBack(): void {
    if (this.store.isDirty()) {
      this.confirmService.confirm({
        message: this.translate.instant('pro.builder.confirmBack.message'),
        header: this.translate.instant('pro.builder.confirmBack.header'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.translate.instant('pro.builder.confirmBack.accept'),
        rejectLabel: this.translate.instant('pro.builder.confirmBack.reject'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => this.router.navigate(['/pro/formulaires']),
      });
    } else {
      this.router.navigate(['/pro/formulaires']);
    }
  }
}

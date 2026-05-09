import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PlanBuilderStore } from './plan-builder.store';
import { PlanItemEtendu, Frequence } from '../models/plan-builder.model';

const makePlanItem = (overrides: Partial<PlanItemEtendu> = {}): PlanItemEtendu => ({
  templateId: 'tpl-1',
  templateCode: 'PHQ9',
  templateNom: 'PHQ-9',
  frequence: 'HEBDO',
  ordre: 0,
  actif: true,
  rappelActif: false,
  heureRappel: null,
  dureeEstimeeMinutes: 10,
  licenceInfo: 'libre',
  ...overrides,
});

describe('PlanBuilderStore', () => {
  let store: PlanBuilderStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(PlanBuilderStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should start with empty planItems and isDirty=false', () => {
    expect(store.planItems()).toEqual([]);
    expect(store.isDirty()).toBeFalse();
  });

  describe('totalDureeHebdo', () => {
    it('should return 0 when no items', () => {
      expect(store.totalDureeHebdo()).toBe(0);
    });

    it('should calculate QUOTIDIEN correctly (×7)', () => {
      // 10 min × 7 = 70 min
      store.planItems.set([makePlanItem({ frequence: 'QUOTIDIEN', dureeEstimeeMinutes: 10 })]);
      expect(store.totalDureeHebdo()).toBe(70);
    });

    it('should calculate HEBDO correctly (×1)', () => {
      // 20 min × 1 = 20 min
      store.planItems.set([makePlanItem({ frequence: 'HEBDO', dureeEstimeeMinutes: 20 })]);
      expect(store.totalDureeHebdo()).toBe(20);
    });

    it('should calculate MENSUEL correctly (×0.25)', () => {
      // 40 min × 0.25 = 10 min
      store.planItems.set([makePlanItem({ frequence: 'MENSUEL', dureeEstimeeMinutes: 40 })]);
      expect(store.totalDureeHebdo()).toBe(10);
    });

    it('should sum multiple items with different frequences', () => {
      // QUOTIDIEN 10×7=70, HEBDO 20×1=20, MENSUEL 40×0.25=10 → total=100
      store.planItems.set([
        makePlanItem({ templateId: 'tpl-1', frequence: 'QUOTIDIEN', dureeEstimeeMinutes: 10 }),
        makePlanItem({ templateId: 'tpl-2', frequence: 'HEBDO', dureeEstimeeMinutes: 20 }),
        makePlanItem({ templateId: 'tpl-3', frequence: 'MENSUEL', dureeEstimeeMinutes: 40 }),
      ]);
      expect(store.totalDureeHebdo()).toBe(100);
    });
  });

  it('should mark isDirty=true after removeItem()', () => {
    store.planItems.set([makePlanItem({ templateId: 'tpl-1' })]);
    expect(store.isDirty()).toBeFalse();

    store.removeItem('tpl-1');

    expect(store.isDirty()).toBeTrue();
  });

  it('should remove item correctly by templateId', () => {
    store.planItems.set([
      makePlanItem({ templateId: 'tpl-1' }),
      makePlanItem({ templateId: 'tpl-2', templateCode: 'GAD7' }),
    ]);

    store.removeItem('tpl-1');

    expect(store.planItems().length).toBe(1);
    expect(store.planItems()[0].templateId).toBe('tpl-2');
  });

  it('should not remove any item if templateId not found', () => {
    store.planItems.set([makePlanItem({ templateId: 'tpl-1' })]);
    store.removeItem('tpl-inexistant');
    expect(store.planItems().length).toBe(1);
  });

  it('should mark isDirty=true after updateItemFrequence()', () => {
    store.planItems.set([makePlanItem({ templateId: 'tpl-1', frequence: 'HEBDO' })]);
    expect(store.isDirty()).toBeFalse();

    store.updateItemFrequence('tpl-1', 'QUOTIDIEN');

    expect(store.isDirty()).toBeTrue();
  });

  it('should update frequence for specific item', () => {
    store.planItems.set([
      makePlanItem({ templateId: 'tpl-1', frequence: 'HEBDO' }),
      makePlanItem({ templateId: 'tpl-2', frequence: 'MENSUEL' }),
    ]);

    store.updateItemFrequence('tpl-1', 'QUOTIDIEN');

    expect(store.planItems()[0].frequence).toBe('QUOTIDIEN');
    expect(store.planItems()[1].frequence).toBe('MENSUEL'); // inchangé
  });

  describe('itemsByFrequence', () => {
    it('should group items by frequence', () => {
      store.planItems.set([
        makePlanItem({ templateId: 'tpl-1', frequence: 'QUOTIDIEN', ordre: 0 }),
        makePlanItem({ templateId: 'tpl-2', frequence: 'HEBDO', ordre: 0 }),
        makePlanItem({ templateId: 'tpl-3', frequence: 'QUOTIDIEN', ordre: 1 }),
      ]);

      const grouped = store.itemsByFrequence();
      expect(grouped.QUOTIDIEN.length).toBe(2);
      expect(grouped.HEBDO.length).toBe(1);
      expect(grouped.MENSUEL.length).toBe(0);
    });

    it('should sort items by ordre within each frequence group', () => {
      store.planItems.set([
        makePlanItem({ templateId: 'tpl-b', frequence: 'QUOTIDIEN', ordre: 2 }),
        makePlanItem({ templateId: 'tpl-a', frequence: 'QUOTIDIEN', ordre: 0 }),
        makePlanItem({ templateId: 'tpl-c', frequence: 'QUOTIDIEN', ordre: 1 }),
      ]);

      const grouped = store.itemsByFrequence();
      expect(grouped.QUOTIDIEN[0].templateId).toBe('tpl-a');
      expect(grouped.QUOTIDIEN[1].templateId).toBe('tpl-c');
      expect(grouped.QUOTIDIEN[2].templateId).toBe('tpl-b');
    });

    it('should return empty arrays for all frequences when no items', () => {
      const grouped = store.itemsByFrequence();
      const allEmpty = Object.values(grouped).every(arr => arr.length === 0);
      expect(allEmpty).toBeTrue();
    });
  });

  it('should reset to empty state', () => {
    store.planItems.set([makePlanItem()]);
    store.isDirty.set(true);

    store.reset();

    expect(store.planItems()).toEqual([]);
    expect(store.isDirty()).toBeFalse();
  });

  it('should set isDirty=true when addTemplate is called', () => {
    const template = {
      id: 'tpl-new',
      code: 'NEW',
      nom: 'Nouveau',
      scope: 'CORE' as const,
      frequence: 'HEBDO' as const,
      dureeEstimeeMinutes: 5,
      licenceInfo: 'libre',
      items: [],
    };

    store.addTemplate(template, 'HEBDO');

    expect(store.isDirty()).toBeTrue();
    expect(store.planItems().length).toBe(1);
    expect(store.planItems()[0].templateId).toBe('tpl-new');
  });

  it('should not add duplicate template', () => {
    const template = {
      id: 'tpl-1',
      code: 'PHQ9',
      nom: 'PHQ-9',
      scope: 'CORE' as const,
      frequence: 'HEBDO' as const,
      dureeEstimeeMinutes: 10,
      licenceInfo: 'libre',
      items: [],
    };
    store.planItems.set([makePlanItem({ templateId: 'tpl-1' })]);

    store.addTemplate(template, 'QUOTIDIEN');

    expect(store.planItems().length).toBe(1);
  });
});

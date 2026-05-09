import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuestionnaireStore } from './questionnaire.store';
import { AlerteDto } from '../models/alerte.model';

const makeAlerte = (overrides: Partial<AlerteDto> = {}): AlerteDto => ({
  id: 'a1',
  patientNom: 'Dupont Jean',
  niveau: 'WARNING',
  itemCode: 'PHQ9_Q9',
  valeurObservee: 6,
  message: 'Valeur élevée',
  createdAt: new Date().toISOString(),
  isAcknowledged: false,
  ...overrides,
});

describe('QuestionnaireStore', () => {
  let store: QuestionnaireStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(QuestionnaireStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with empty state', () => {
    expect(store.templates()).toEqual([]);
    expect(store.alertes()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should compute alertesCritiques: only CRITICAL niveau', () => {
    const critical = makeAlerte({ id: 'c1', niveau: 'CRITICAL' });
    const warning = makeAlerte({ id: 'w1', niveau: 'WARNING' });
    const info = makeAlerte({ id: 'i1', niveau: 'INFO' });

    store.alertes.set([critical, warning, info]);

    expect(store.alertesCritiques().length).toBe(1);
    expect(store.alertesCritiques()[0].id).toBe('c1');
  });

  it('should compute alertesWarning: only WARNING niveau', () => {
    const critical = makeAlerte({ id: 'c1', niveau: 'CRITICAL' });
    const warning1 = makeAlerte({ id: 'w1', niveau: 'WARNING' });
    const warning2 = makeAlerte({ id: 'w2', niveau: 'WARNING' });

    store.alertes.set([critical, warning1, warning2]);

    expect(store.alertesWarning().length).toBe(2);
    expect(store.alertesWarning().map(a => a.id)).toEqual(['w1', 'w2']);
  });

  it('should compute alertesNonAcquittees: only isAcknowledged=false', () => {
    const nonAck = makeAlerte({ id: 'na1', isAcknowledged: false });
    const acked = makeAlerte({ id: 'ack1', isAcknowledged: true });

    store.alertes.set([nonAck, acked]);

    expect(store.alertesNonAcquittees().length).toBe(1);
    expect(store.alertesNonAcquittees()[0].id).toBe('na1');
  });

  it('should set loading=true then false after loadAlertes() with HttpTestingController', () => {
    store.loadAlertes();
    expect(store.loading()).toBeTrue();

    const req = httpMock.expectOne('/api/alertes');
    req.flush([]);

    expect(store.loading()).toBeFalse();
  });

  it('should update alertes on successful loadAlertes()', () => {
    const mockAlertes: AlerteDto[] = [
      makeAlerte({ id: 'a1', niveau: 'CRITICAL' }),
      makeAlerte({ id: 'a2', niveau: 'WARNING' }),
    ];

    store.loadAlertes();

    const req = httpMock.expectOne('/api/alertes');
    expect(req.request.method).toBe('GET');
    req.flush(mockAlertes);

    expect(store.alertes().length).toBe(2);
    expect(store.alertes()[0].id).toBe('a1');
    expect(store.alertes()[1].id).toBe('a2');
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set error on loadAlertes() HTTP failure', () => {
    store.loadAlertes();

    const req = httpMock.expectOne('/api/alertes');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeTruthy();
  });

  it('should optimistically update alerte to acknowledged on acknowledgeAlerte(id)', () => {
    const alerte = makeAlerte({ id: 'a1', isAcknowledged: false });
    store.alertes.set([alerte]);

    store.acknowledgeAlerte('a1');

    const req = httpMock.expectOne('/api/alertes/a1/acknowledge');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...alerte, isAcknowledged: true });

    const updated = store.alertes().find(a => a.id === 'a1');
    expect(updated?.isAcknowledged).toBeTrue();
  });

  it('should set error on acknowledgeAlerte() HTTP failure', () => {
    const alerte = makeAlerte({ id: 'a1', isAcknowledged: false });
    store.alertes.set([alerte]);

    store.acknowledgeAlerte('a1');

    const req = httpMock.expectOne('/api/alertes/a1/acknowledge');
    req.flush('Error', { status: 400, statusText: 'Bad Request' });

    expect(store.error()).toBeTruthy();
    // L'alerte ne doit pas avoir été modifiée côté client en cas d'erreur
    expect(store.alertes()[0].isAcknowledged).toBeFalse();
  });

  it('should return empty alertesCritiques when no alertes', () => {
    expect(store.alertesCritiques()).toEqual([]);
  });

  it('should return empty alertesWarning when no alertes', () => {
    expect(store.alertesWarning()).toEqual([]);
  });

  it('should return empty alertesNonAcquittees when all are acknowledged', () => {
    store.alertes.set([
      makeAlerte({ id: 'a1', isAcknowledged: true }),
      makeAlerte({ id: 'a2', isAcknowledged: true }),
    ]);
    expect(store.alertesNonAcquittees()).toEqual([]);
  });
});

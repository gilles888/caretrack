import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AlertesDashboardPage } from './alertes-dashboard.page';
import { QuestionnaireStore } from '../../store/questionnaire.store';
import { AlerteDto } from '../../models/alerte.model';

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

describe('AlertesDashboardPage', () => {
  let fixture: ComponentFixture<AlertesDashboardPage>;
  let component: AlertesDashboardPage;
  let store: QuestionnaireStore;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertesDashboardPage],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    // Flush the loadAlertes() call from ngOnInit before creating the component
    store = TestBed.inject(QuestionnaireStore);
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(AlertesDashboardPage);
    component = fixture.componentInstance;

    // ngOnInit calls store.loadAlertes() → flush the HTTP request
    fixture.detectChanges();
    httpMock.expectOne('/api/alertes').flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 0 non-acknowledged alertes initially', () => {
    expect(store.alertesNonAcquittees().length).toBe(0);
  });

  it('should compute alertesCritiques correctly from store', () => {
    store.alertes.set([
      makeAlerte({ id: 'c1', niveau: 'CRITICAL' }),
      makeAlerte({ id: 'w1', niveau: 'WARNING' }),
    ]);
    fixture.detectChanges();

    expect(store.alertesCritiques().length).toBe(1);
    expect(store.alertesCritiques()[0].id).toBe('c1');
  });

  it('should call store.acknowledgeAlerte when acknowledge() is called', () => {
    store.alertes.set([makeAlerte({ id: 'a1', isAcknowledged: false })]);
    fixture.detectChanges();

    (component as any).acknowledge('a1');

    const req = httpMock.expectOne('/api/alertes/a1/acknowledge');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...makeAlerte({ id: 'a1' }), isAcknowledged: true });
  });

  it('should count non-acknowledged alertes correctly', () => {
    store.alertes.set([
      makeAlerte({ id: 'a1', isAcknowledged: false }),
      makeAlerte({ id: 'a2', isAcknowledged: false }),
      makeAlerte({ id: 'a3', isAcknowledged: true }),
    ]);
    fixture.detectChanges();

    expect(store.alertesNonAcquittees().length).toBe(2);
  });

  it('should show empty state when no alertes and not loading', () => {
    store.alertes.set([]);
    fixture.detectChanges();

    expect(store.alertes().length).toBe(0);
    expect(store.loading()).toBeFalse();
  });

  it('should call acknowledgeAlerte for each non-acknowledged alerte when acknowledgeAll() is called', () => {
    store.alertes.set([
      makeAlerte({ id: 'a1', isAcknowledged: false }),
      makeAlerte({ id: 'a2', isAcknowledged: false }),
      makeAlerte({ id: 'a3', isAcknowledged: true }),
    ]);
    fixture.detectChanges();

    // Only 2 non-acknowledged before the call
    expect(store.alertesNonAcquittees().length).toBe(2);

    (component as any).acknowledgeAll();

    // Two PATCH requests expected (only non-acknowledged)
    const req1 = httpMock.expectOne('/api/alertes/a1/acknowledge');
    req1.flush({ ...makeAlerte({ id: 'a1' }), isAcknowledged: true });

    const req2 = httpMock.expectOne('/api/alertes/a2/acknowledge');
    req2.flush({ ...makeAlerte({ id: 'a2' }), isAcknowledged: true });

    // After flushing, both alertes are acknowledged
    expect(store.alertesNonAcquittees().length).toBe(0);
  });

  it('should expose alertesWarning from store', () => {
    store.alertes.set([
      makeAlerte({ id: 'w1', niveau: 'WARNING' }),
      makeAlerte({ id: 'w2', niveau: 'WARNING' }),
    ]);
    fixture.detectChanges();

    expect(store.alertesWarning().length).toBe(2);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WizardSaisieComponent } from './wizard-saisie.component';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { ReponseService } from '../../services/reponse.service';
import { QuestionnaireTemplate } from '../../models/questionnaire-template.model';

const MOCK_TEMPLATE: QuestionnaireTemplate = {
  id: 'tpl-1',
  code: 'PHQ9',
  nom: 'PHQ-9',
  scope: 'CORE',
  frequence: 'HEBDO',
  dureeEstimeeMinutes: 5,
  licenceInfo: 'libre',
  items: [
    { id: 'q1', texte: 'Q1', type: 'LIKERT_4', ordre: 0, attributes: [] },
    { id: 'q2', texte: 'Q2', type: 'LIKERT_4', ordre: 1, attributes: [] },
  ],
};

describe('WizardSaisieComponent', () => {
  let fixture: ComponentFixture<WizardSaisieComponent>;
  let component: WizardSaisieComponent;
  let questionnaireServiceSpy: jasmine.SpyObj<QuestionnaireService>;
  let reponseServiceSpy: jasmine.SpyObj<ReponseService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Nettoyer le localStorage avant chaque test
    localStorage.removeItem('draft_PHQ9');

    questionnaireServiceSpy = jasmine.createSpyObj('QuestionnaireService', ['getTemplateByCode']);
    reponseServiceSpy = jasmine.createSpyObj('ReponseService', [
      'soumettre',
      'getDraft',
      'saveDraft',
      'clearDraft',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    // Par défaut : pas de draft, template OK
    questionnaireServiceSpy.getTemplateByCode.and.returnValue(of(MOCK_TEMPLATE));
    reponseServiceSpy.getDraft.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [WizardSaisieComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { code: 'PHQ9' } },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: QuestionnaireService, useValue: questionnaireServiceSpy },
        { provide: ReponseService, useValue: reponseServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardSaisieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Attendre que le signal loading passe à false
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('draft_PHQ9');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(questionnaireServiceSpy.getTemplateByCode).toHaveBeenCalledWith('PHQ9');
  });

  it('should start at step 0', () => {
    expect((component as any).currentStep()).toBe(0);
  });

  it('should not allow next when no answer for current question', () => {
    // Aucune réponse → isCurrentAnswered() = false
    expect((component as any).isCurrentAnswered()).toBeFalse();
  });

  it('should allow next after an answer is provided', () => {
    (component as any).onAnswered({ itemId: 'q1', value: 2 });
    expect((component as any).isCurrentAnswered()).toBeTrue();
  });

  it('should advance step on nextStep()', () => {
    // Fournir une réponse pour q1 d'abord
    (component as any).onAnswered({ itemId: 'q1', value: 1 });

    (component as any).nextStep();
    fixture.detectChanges();

    expect((component as any).currentStep()).toBe(1);
  });

  it('should not advance beyond last step on nextStep()', () => {
    // Aller au dernier step manuellement
    (component as any).currentStep.set(1);
    (component as any).onAnswered({ itemId: 'q2', value: 1 });

    (component as any).nextStep();
    fixture.detectChanges();

    // totalItems = 2, currentStep reste à 1 (indices 0 et 1)
    expect((component as any).currentStep()).toBe(1);
  });

  it('should go back on prevStep()', () => {
    // Avancer d'abord
    (component as any).currentStep.set(1);

    (component as any).prevStep();
    fixture.detectChanges();

    expect((component as any).currentStep()).toBe(0);
  });

  it('should not go below step 0 on prevStep()', () => {
    expect((component as any).currentStep()).toBe(0);

    (component as any).prevStep();
    fixture.detectChanges();

    expect((component as any).currentStep()).toBe(0);
  });

  it('should save draft to localStorage via reponseService on saveDraft()', () => {
    (component as any).onAnswered({ itemId: 'q1', value: 3 });

    // Appel direct à la méthode privée saveDraft()
    (component as any).saveDraft();

    expect(reponseServiceSpy.saveDraft).toHaveBeenCalledWith('PHQ9', jasmine.objectContaining({
      templateCode: 'PHQ9',
      answers: jasmine.objectContaining({ q1: 3 }),
    }));
  });

  it('should not save draft when no answers', () => {
    // answers est vide → saveDraft() retourne sans rien faire
    (component as any).saveDraft();

    expect(reponseServiceSpy.saveDraft).not.toHaveBeenCalled();
  });

  it('should restore draft answers from localStorage on init', async () => {
    // Simuler un draft existant
    reponseServiceSpy.getDraft.and.returnValue({
      templateCode: 'PHQ9',
      answers: { q1: 2 },
      dureeSecondes: 30,
    });

    // Recréer le composant pour simuler le rechargement
    fixture = TestBed.createComponent(WizardSaisieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // La réponse doit avoir été restaurée
    expect((component as any).answers().get('q1')).toBe(2);
  });

  it('should restore draft and jump to first unanswered step', async () => {
    // q1 répondu → premier non-répondu est q2 (index 1)
    reponseServiceSpy.getDraft.and.returnValue({
      templateCode: 'PHQ9',
      answers: { q1: 1 },
      dureeSecondes: 10,
    });

    fixture = TestBed.createComponent(WizardSaisieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).currentStep()).toBe(1);
  });

  it('should compute progressPercent correctly at step 0 with 2 items', () => {
    // step 0, total 2 → (0+1)/2 × 100 = 50%
    expect((component as any).progressPercent()).toBe(50);
  });

  it('should compute progressPercent correctly at last step', () => {
    (component as any).currentStep.set(1);
    fixture.detectChanges();
    // step 1, total 2 → (1+1)/2 × 100 = 100%
    expect((component as any).progressPercent()).toBe(100);
  });

  it('should have totalItems equal to template items count', () => {
    expect((component as any).totalItems()).toBe(2);
  });

  it('should have isLastStep=false at step 0', () => {
    expect((component as any).isLastStep()).toBeFalse();
  });

  it('should have isLastStep=true at last step', () => {
    (component as any).currentStep.set(1);
    fixture.detectChanges();
    expect((component as any).isLastStep()).toBeTrue();
  });

  it('should report hasUnsavedChanges=true when answers exist and not submitting', () => {
    (component as any).onAnswered({ itemId: 'q1', value: 1 });
    expect(component.hasUnsavedChanges()).toBeTrue();
  });

  it('should report hasUnsavedChanges=false when no answers', () => {
    expect(component.hasUnsavedChanges()).toBeFalse();
  });

  it('should handle HTTP error on loadTemplate and set loading=false', async () => {
    questionnaireServiceSpy.getTemplateByCode.and.returnValue(
      throwError(() => new Error('404 Not Found'))
    );

    // Recréer le composant avec l'erreur
    fixture = TestBed.createComponent(WizardSaisieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).loading()).toBeFalse();
  });

  it('should store answer and retrieve it via currentAnswer signal', () => {
    (component as any).onAnswered({ itemId: 'q1', value: 3 });
    fixture.detectChanges();

    // currentStep est 0, currentItem est q1
    expect((component as any).currentAnswer()).toBe(3);
  });
});

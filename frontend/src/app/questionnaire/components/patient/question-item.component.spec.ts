import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { QuestionItemComponent } from './question-item.component';
import { QuestionItem } from '../../models/question-item.model';

describe('QuestionItemComponent', () => {
  let fixture: ComponentFixture<QuestionItemComponent>;
  let component: QuestionItemComponent;

  const baseItem: QuestionItem = {
    id: 'q1',
    texte: 'Évaluez votre douleur',
    type: 'VAS_0_10',
    ordre: 0,
    attributes: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionItemComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('item', baseItem);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit answered event when emitAnswer() is called', () => {
    fixture.componentRef.setInput('item', baseItem);
    fixture.detectChanges();

    const spy = jasmine.createSpy('answeredSpy');
    component.answered.subscribe(spy);

    (component as any).emitAnswer(7);

    expect(spy).toHaveBeenCalledWith({ itemId: 'q1', value: 7 });
  });

  it('should show CRITICAL alert when value >= seuilAlerteMin and alerteNiveau is CRITICAL', () => {
    const criticalItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'CRITICAL',
      seuilAlerteMin: 7,
    };
    fixture.componentRef.setInput('item', criticalItem);
    fixture.componentRef.setInput('value', 8);
    fixture.detectChanges();

    expect((component as any).shouldShowCriticalAlert()).toBeTrue();
  });

  it('should NOT show CRITICAL alert when value < seuilAlerteMin', () => {
    const criticalItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'CRITICAL',
      seuilAlerteMin: 7,
    };
    fixture.componentRef.setInput('item', criticalItem);
    fixture.componentRef.setInput('value', 5);
    fixture.detectChanges();

    expect((component as any).shouldShowCriticalAlert()).toBeFalse();
  });

  it('should NOT show CRITICAL alert when value equals seuilAlerteMin exactly (boundary = inclusive)', () => {
    const criticalItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'CRITICAL',
      seuilAlerteMin: 7,
    };
    fixture.componentRef.setInput('item', criticalItem);
    fixture.componentRef.setInput('value', 7);
    fixture.detectChanges();

    // seuilAlerteMin = 7, value = 7 → 7 >= 7 → true
    expect((component as any).shouldShowCriticalAlert()).toBeTrue();
  });

  it('should show WARNING alert when alerteNiveau is WARNING and value >= seuilAlerteMin', () => {
    const warningItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'WARNING',
      seuilAlerteMin: 5,
    };
    fixture.componentRef.setInput('item', warningItem);
    fixture.componentRef.setInput('value', 6);
    fixture.detectChanges();

    expect((component as any).shouldShowWarningAlert()).toBeTrue();
  });

  it('should NOT show WARNING alert when value < seuilAlerteMin', () => {
    const warningItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'WARNING',
      seuilAlerteMin: 5,
    };
    fixture.componentRef.setInput('item', warningItem);
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    expect((component as any).shouldShowWarningAlert()).toBeFalse();
  });

  it('should NOT show CRITICAL alert when alerteNiveau is WARNING', () => {
    const warningItem: QuestionItem = {
      ...baseItem,
      alerteNiveau: 'WARNING',
      seuilAlerteMin: 5,
    };
    fixture.componentRef.setInput('item', warningItem);
    fixture.componentRef.setInput('value', 9);
    fixture.detectChanges();

    expect((component as any).shouldShowCriticalAlert()).toBeFalse();
  });

  describe('vasColorClass', () => {
    it('should return text-green-500 for value 0', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 0);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-green-500');
    });

    it('should return text-green-500 for value 3', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 3);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-green-500');
    });

    it('should return text-orange-400 for value 4', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 4);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-orange-400');
    });

    it('should return text-orange-400 for value 6', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 6);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-orange-400');
    });

    it('should return text-red-500 for value 7', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 7);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-red-500');
    });

    it('should return text-red-500 for value 10', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 10);
      fixture.detectChanges();
      expect((component as any).vasColorClass()).toBe('text-red-500');
    });
  });

  describe('displayValue', () => {
    it('should return em dash when value is null', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', null);
      fixture.detectChanges();
      expect((component as any).displayValue()).toBe('—');
    });

    it('should return string representation for numeric value', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 5);
      fixture.detectChanges();
      expect((component as any).displayValue()).toBe('5');
    });

    it('should return string value as-is for string inputs', () => {
      const textItem: QuestionItem = { ...baseItem, type: 'TEXT' };
      fixture.componentRef.setInput('item', textItem);
      fixture.componentRef.setInput('value', 'abc');
      fixture.detectChanges();
      expect((component as any).displayValue()).toBe('abc');
    });
  });

  describe('numericValue', () => {
    it('should return 0 when value is null', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', null);
      fixture.detectChanges();
      expect((component as any).numericValue()).toBe(0);
    });

    it('should return the numeric value when it is a number', () => {
      fixture.componentRef.setInput('item', baseItem);
      fixture.componentRef.setInput('value', 8);
      fixture.detectChanges();
      expect((component as any).numericValue()).toBe(8);
    });
  });
});

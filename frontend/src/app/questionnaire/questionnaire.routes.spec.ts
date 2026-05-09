import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { planDirtyGuard } from './questionnaire.routes';

describe('planDirtyGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    });
  });

  it('should allow navigation when hasUnsavedChanges returns false', () => {
    const component = { hasUnsavedChanges: () => false } as any;
    const result = TestBed.runInInjectionContext(() =>
      planDirtyGuard(component, {} as any, {} as any, {} as any)
    );
    expect(result).toBeTrue();
  });

  it('should block navigation when dirty and user cancels confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = { hasUnsavedChanges: () => true } as any;
    const result = TestBed.runInInjectionContext(() =>
      planDirtyGuard(component, {} as any, {} as any, {} as any)
    );
    expect(result).toBeFalse();
  });

  it('should allow navigation when dirty and user confirms', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const component = { hasUnsavedChanges: () => true } as any;
    const result = TestBed.runInInjectionContext(() =>
      planDirtyGuard(component, {} as any, {} as any, {} as any)
    );
    expect(result).toBeTrue();
  });

  it('should not call confirm when hasUnsavedChanges returns false', () => {
    const confirmSpy = spyOn(window, 'confirm');
    const component = { hasUnsavedChanges: () => false } as any;
    TestBed.runInInjectionContext(() =>
      planDirtyGuard(component, {} as any, {} as any, {} as any)
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('should call confirm with a meaningful message when dirty', () => {
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    const component = { hasUnsavedChanges: () => true } as any;
    TestBed.runInInjectionContext(() =>
      planDirtyGuard(component, {} as any, {} as any, {} as any)
    );
    expect(confirmSpy).toHaveBeenCalledWith(jasmine.any(String));
    const message: unknown = confirmSpy.calls.mostRecent().args[0];
    expect(typeof message === 'string' && message.length > 0).toBeTrue();
  });
});

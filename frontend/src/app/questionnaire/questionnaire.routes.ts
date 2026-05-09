import { Routes, CanDeactivateFn } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

// planDirtyGuard défini avant son utilisation dans questRoutes
interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

export const planDirtyGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('Des modifications non sauvegardees seront perdues. Quitter quand meme ?');
  }
  return true;
};

export const questRoutes: Routes = [
  {
    path: 'patient/questionnaires',
    loadComponent: () =>
      import('./components/patient/patient-questionnaires.page').then(
        m => m.PatientQuestionnairesPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'patient/questionnaires/success',
    loadComponent: () =>
      import('./components/patient/wizard-success.component').then(
        m => m.WizardSuccessComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'patient/questionnaires/:code',
    loadComponent: () =>
      import('./components/patient/wizard-saisie.component').then(
        m => m.WizardSaisieComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'pro/formulaires',
    loadComponent: () =>
      import('./components/pro/dashboard-formulaires.page').then(
        m => m.DashboardFormulairesPage
      ),
    canActivate: [authGuard, roleGuard('MEDECIN', 'INFIRMIER', 'ADMIN', 'ADMIN_SUPPORT')],
  },
  {
    path: 'pro/formulaires/builder',
    loadComponent: () =>
      import('./components/pro/plan-builder.component').then(
        m => m.PlanBuilderComponent
      ),
    canActivate: [authGuard, roleGuard('MEDECIN', 'ADMIN')],
    canDeactivate: [planDirtyGuard],
  },
  {
    path: 'pro/alertes',
    loadComponent: () =>
      import('./components/pro/alertes-dashboard.page').then(
        m => m.AlertesDashboardPage
      ),
    canActivate: [authGuard, roleGuard('MEDECIN', 'INFIRMIER', 'ADMIN', 'ADMIN_SUPPORT')],
  },
  {
    path: 'pro/reponses/:id/review',
    loadComponent: () =>
      import('./components/pro/reponse-review.component').then(
        m => m.ReponseReviewComponent
      ),
    canActivate: [authGuard, roleGuard('MEDECIN', 'INFIRMIER', 'ADMIN', 'ADMIN_SUPPORT')],
  },
  {
    path: 'pro/analytics',
    loadComponent: () =>
      import('./components/analytics/analytics-dashboard.page').then(
        m => m.AnalyticsDashboardPage
      ),
    canActivate: [authGuard, roleGuard('MEDECIN', 'INFIRMIER', 'ADMIN', 'ADMIN_SUPPORT')],
  },
];

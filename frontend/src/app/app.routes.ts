import { Routes } from '@angular/router';
import { questRoutes } from './questionnaire/questionnaire.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'patient/questionnaires', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/components/login.component').then(
        m => m.LoginComponent
      ),
  },
  ...questRoutes,
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./core/components/unauthorized.component').then(
        m => m.UnauthorizedComponent
      ),
  },
  { path: '**', redirectTo: 'login' },
];

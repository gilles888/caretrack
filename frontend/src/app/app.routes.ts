import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { Router } from '@angular/router';
import { questRoutes } from './questionnaire/questionnaire.routes';
import { AuthService } from './core/services/auth.service';

/**
 * Root guard: redirects authenticated users to /pro/alertes,
 * unauthenticated users to /login.
 * Returns a UrlTree so Angular performs the navigation directly.
 */
const rootGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree(
    auth.isAuthenticated() ? ['/pro/alertes'] : ['/login']
  );
};

export const routes: Routes = [
  // Root path: smart redirect based on auth state
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootGuard],
    // A loadComponent or component is required even though rootGuard always redirects
    loadComponent: () =>
      import('./core/components/login.component').then(m => m.LoginComponent),
  },
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

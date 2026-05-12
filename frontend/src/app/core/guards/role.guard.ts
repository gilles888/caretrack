import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard factory that checks whether the current user has at least one of
 * the required roles. Redirects to /unauthorized if the check fails.
 *
 * Usage in routes:
 *   canActivate: [authGuard, roleGuard('MEDECIN', 'ADMIN')]
 */
export const roleGuard = (...roles: string[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole(...roles)) {
    return true;
  }
  return router.createUrlTree(['/unauthorized']);
};

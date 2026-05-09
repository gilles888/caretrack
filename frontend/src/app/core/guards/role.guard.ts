import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard = (...roles: string[]): CanActivateFn => () => {
  const router = inject(Router);
  const userRole = localStorage.getItem('user_role') ?? '';
  const hasRole = roles.includes(userRole);
  if (hasRole) return true;
  return router.createUrlTree(['/unauthorized']);
};

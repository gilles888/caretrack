import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const patientOwnerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const patientId = route.paramMap.get('patientId');
  const currentUserId = localStorage.getItem('user_id');
  const userRoles: string[] = JSON.parse(localStorage.getItem('user_roles') ?? '[]');

  // Les professionnels de santé peuvent accéder à tous les patients
  const isPro = userRoles.some(r => ['MEDECIN', 'INFIRMIER', 'ADMIN'].includes(r));
  if (isPro) return true;

  // Le patient ne peut accéder qu'à ses propres données
  if (patientId && currentUserId && patientId === currentUserId) return true;

  return router.createUrlTree(['/unauthorized']);
};

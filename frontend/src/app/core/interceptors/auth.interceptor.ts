import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor that:
 *  1. Attaches the JWT Bearer token to every outgoing API request,
 *     except for the /auth/login endpoint itself.
 *  2. Handles 401 Unauthorized responses by clearing the session and
 *     redirecting the user to /login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding the Authorization header for the login endpoint
  const isLoginRequest = req.url.includes('/auth/login');

  const token = authService.getToken();
  const authReq =
    token && !isLoginRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token expired or invalid — clear session and go to login
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

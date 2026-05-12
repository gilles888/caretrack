import { Injectable, Injector, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, throwError, switchMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  userId: string;
  roles: string[];
  email: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  roles: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOKEN_KEY = 'caretrack_token';
const USER_KEY = 'caretrack_user';

// ─── JWT helpers (no external library) ───────────────────────────────────────

interface JwtPayload {
  sub?: string;
  exp?: number;
  roles?: string[];
  email?: string;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Pad base64url to standard base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Mock JWT builder (dev mode) ─────────────────────────────────────────────

function buildMockJwt(userId: string, email: string, roles: string[]): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 86400; // 24h
  const payload = btoa(
    JSON.stringify({ sub: userId, email, roles, exp }),
  );
  // Fake signature — sufficient for client-side mock
  const sig = btoa('mock-sig');
  return `${header}.${payload}.${sig}`;
}

// ─── AuthService ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  // Signal backing the current user state
  private readonly _currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());

  /** Read-only signal of the logged-in user (or null if not authenticated). */
  readonly currentUser = this._currentUser.asReadonly();

  /** True when a valid, non-expired token is present. */
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Authenticate against the backend (or mock in dev mode).
   * On success, persists token + user info and updates `currentUser` signal.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    if (environment.useMocks) {
      return this.loginMock(email, password);
    }
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.persistSession(res)),
        catchError((err) => throwError(() => err)),
      );
  }

  /** Clear session and navigate to /login. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Remove legacy keys used by MockDataService
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_nom');
    this._currentUser.set(null);
    this.router.navigateByUrl('/login');
  }

  /**
   * Returns true when a JWT token is present in localStorage AND its `exp`
   * claim is in the future. Falls back gracefully if the token cannot be
   * decoded (mock tokens without proper exp are treated as valid).
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload) {
      // Token present but undecodable — treat as still valid (mock tokens)
      return true;
    }
    if (payload['exp'] !== undefined) {
      return (payload['exp'] as number) > Math.floor(Date.now() / 1000);
    }
    return true;
  }

  /** Returns the roles array from the stored user, or [] if not authenticated. */
  getRoles(): string[] {
    return this._currentUser()?.roles ?? [];
  }

  /** Returns true when the current user has at least one of the given roles. */
  hasRole(...roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((r) => userRoles.includes(r));
  }

  /** Returns the raw JWT token, or null if not present. */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: CurrentUser = {
      userId: res.userId,
      email: res.email,
      roles: res.roles,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Keep legacy keys in sync so MockDataService continues to work in dev
    localStorage.setItem('access_token', res.token);
    localStorage.setItem('user_role', res.roles[0] ?? '');
    localStorage.setItem('user_id', res.userId);

    this._currentUser.set(user);
  }

  private loadUserFromStorage(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as CurrentUser;
      // Validate minimum shape
      if (!user.userId || !user.email || !Array.isArray(user.roles)) return null;
      // Check token not expired
      if (!this.isAuthenticatedFromToken(localStorage.getItem(TOKEN_KEY))) return null;
      return user;
    } catch {
      return null;
    }
  }

  private isAuthenticatedFromToken(token: string | null): boolean {
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload) return true; // mock token
    if (payload['exp'] !== undefined) {
      return (payload['exp'] as number) > Math.floor(Date.now() / 1000);
    }
    return true;
  }

  // ─── Mock login (dynamic import — mock data excluded from production bundle) ──

  private loginMock(email: string, password: string): Observable<AuthResponse> {
    return from(import('../mocks/mock-data.service')).pipe(
      switchMap(({ MockDataService }) => {
        const mockDataService = this.injector.get(MockDataService);
        return new Observable<AuthResponse>((observer) => {
          mockDataService.login(email, password).subscribe({
            next: (mockUser) => {
              const roles = [mockUser.role];
              const token = buildMockJwt(mockUser.id, mockUser.email, roles);
              const res: AuthResponse = {
                token,
                userId: mockUser.id,
                roles,
                email: mockUser.email,
              };
              this.persistSession(res);
              observer.next(res);
              observer.complete();
            },
            error: (err) => observer.error(err),
          });
        });
      }),
    );
  }
}

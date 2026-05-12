import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, AuthResponse } from '../services/auth.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher.component';
import { environment } from '../../../environments/environment';

interface QuickAccess {
  label: string;
  name: string;
  email: string;
  password: string;
  cssClass: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule, TranslateModule, LanguageSwitcherComponent],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(145deg, #0D1B2A 0%, #1565C0 55%, #00796B 100%);
    }

    .login-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.15);
      padding: 2.5rem;
      width: 100%;
      max-width: 460px;
    }

    .logo-circle {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #1565C0, #00796B);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 1.25rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .input-full :deep(.p-inputtext),
    .input-full :deep(input) {
      width: 100%;
      height: 44px;
      border-radius: 10px;
      border: 1.5px solid #e5e7eb;
      font-size: 0.875rem;
      padding: 0 14px;
      transition: border-color 0.2s;
    }

    .input-full :deep(.p-inputtext:focus),
    .input-full :deep(input:focus) {
      border-color: #1565C0;
      box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
    }

    .input-full :deep(.p-password),
    .input-full :deep(.p-password-input) {
      width: 100%;
    }

    .btn-primary {
      width: 100%;
      height: 46px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      background: linear-gradient(135deg, #1565C0, #1976D2);
      border: none;
      margin-top: 0.25rem;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #0D47A1, #1565C0);
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 1.5rem 0;
      color: #9ca3af;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .error-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1.25rem;
      color: #DC2626;
      font-size: 0.875rem;
    }

    .page-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    /* Decorative circles in background */
    .bg-decor {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.1);
    }

    /* Language switcher positioning */
    .lang-bar {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 100;
    }

    /* Quick access grid */
    .quick-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 6px;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .quick-chip {
      padding: 6px 10px;
      border-radius: 8px;
      border: 1.5px solid #e5e7eb;
      background: white;
      font-size: 0.75rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }

    .quick-chip .chip-role {
      display: block;
      font-weight: 600;
      color: #374151;
    }

    .quick-chip .chip-name {
      display: block;
      color: #6B7280;
      font-size: 0.7rem;
      margin-top: 1px;
    }

    .quick-chip:hover {
      border-color: #1565C0;
      background: #EFF6FF;
    }

    .quick-chip.medecin:hover {
      border-color: #00796B;
      background: #E0F2F1;
    }

    .quick-chip.admin:hover {
      border-color: #7C3AED;
      background: #EDE9FE;
    }

    .quick-chip:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Prod hint */
    .prod-hint {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.75rem;
      color: #1E40AF;
      margin-bottom: 1.25rem;
      line-height: 1.5;
    }
  `],
  template: `
    <!-- Sélecteur de langue — coin supérieur droit -->
    <div class="lang-bar">
      <app-language-switcher />
    </div>

    <!-- Fond degrade + deco -->
    <div class="bg-decor">
      <div class="circle" style="width:500px;height:500px;top:-150px;right:-150px;"></div>
      <div class="circle" style="width:300px;height:300px;bottom:-80px;left:-80px;"></div>
      <div class="circle" style="width:180px;height:180px;bottom:100px;right:100px;"></div>
    </div>

    <!-- Contenu centre -->
    <div class="page-wrapper">
      <div class="login-card">

        <!-- Logo -->
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div class="logo-circle">
            <i class="pi pi-heart-fill" style="color:white; font-size:1.5rem;"></i>
          </div>
          <h1 style="font-size:1.75rem; font-weight:700; color:#1565C0; margin:0 0 4px;">
            {{ 'common.appName' | translate }}
          </h1>
          <p style="color:#6B7280; font-size:0.875rem; margin:0;">
            {{ 'login.title' | translate }}
          </p>
        </div>

        <!-- Erreur -->
        @if (erreur()) {
          <div class="error-box" role="alert" aria-live="assertive">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            <span>{{ erreur() }}</span>
          </div>
        }

        <!-- Formulaire -->
        <form (ngSubmit)="onSubmit()" novalidate>

          <div class="form-group">
            <label class="form-label" for="email">{{ 'login.email' | translate }}</label>
            <div class="input-full">
              <input
                pInputText
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                [placeholder]="'login.emailPlaceholder' | translate"
                autocomplete="username"
                [attr.aria-label]="'login.email' | translate"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">{{ 'login.password' | translate }}</label>
            <div class="input-full">
              <p-password
                inputId="password"
                [(ngModel)]="password"
                name="password"
                [placeholder]="'login.passwordPlaceholder' | translate"
                autocomplete="current-password"
                [feedback]="false"
                [toggleMask]="true"
              />
            </div>
          </div>

          <p-button
            type="submit"
            [label]="'login.submit' | translate"
            icon="pi pi-arrow-right"
            iconPos="right"
            styleClass="btn-primary"
            [loading]="loading()"
          />
        </form>

        <!-- Accès rapide — uniquement en mode mock (dev) -->
        @if (isMockMode) {
          <div class="divider">{{ 'login.quickAccess' | translate }}</div>

          <!-- Medecins -->
          <p class="quick-section-title">{{ 'login.quickDoctors' | translate }}</p>
          <div class="quick-grid">
            @for (entry of quickMedecins; track entry.email) {
              <button
                type="button"
                class="quick-chip medecin"
                (click)="loginQuick(entry)"
                [disabled]="loading()"
                [attr.aria-label]="('login.quickLoginLabel' | translate) + ' ' + entry.name"
              >
                <span class="chip-role">{{ entry.label }}</span>
                <span class="chip-name">{{ entry.name }}</span>
              </button>
            }
          </div>

          <!-- Patients -->
          <p class="quick-section-title" style="margin-top:12px;">{{ 'login.quickPatients' | translate }}</p>
          <div class="quick-grid">
            @for (entry of quickPatients; track entry.email) {
              <button
                type="button"
                class="quick-chip"
                (click)="loginQuick(entry)"
                [disabled]="loading()"
                [attr.aria-label]="('login.quickLoginLabel' | translate) + ' ' + entry.name"
              >
                <span class="chip-role">{{ entry.label }}</span>
                <span class="chip-name">{{ entry.name }}</span>
              </button>
            }
          </div>

          <!-- Admin -->
          <p class="quick-section-title" style="margin-top:12px;">{{ 'login.quickAdmin' | translate }}</p>
          <div class="quick-grid">
            @for (entry of quickAdmins; track entry.email) {
              <button
                type="button"
                class="quick-chip admin"
                (click)="loginQuick(entry)"
                [disabled]="loading()"
                [attr.aria-label]="('login.quickLoginLabel' | translate) + ' ' + entry.name"
              >
                <span class="chip-role">{{ entry.label }}</span>
                <span class="chip-name">{{ entry.name }}</span>
              </button>
            }
          </div>

          <p style="text-align:center;color:#9CA3AF;font-size:0.75rem;margin-top:1.25rem;margin-bottom:0;">
            {{ 'login.simulation' | translate }}
          </p>
        }

      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly isMockMode = environment.useMocks;

  email = '';
  password = '';
  erreur = signal<string | null>(null);
  loading = signal(false);

  readonly quickMedecins: QuickAccess[] = [
    { label: 'Medecin', name: 'S. Martin',  email: 'sophie.martin@caretrack.fr',  password: 'Medecin1234!', cssClass: 'medecin' },
    { label: 'Medecin', name: 'K. Benali',  email: 'karim.benali@caretrack.fr',   password: 'Medecin1234!', cssClass: 'medecin' },
    { label: 'Medecin', name: 'A. Rousseau', email: 'anne.rousseau@caretrack.fr', password: 'Medecin1234!', cssClass: 'medecin' },
  ];

  readonly quickPatients: QuickAccess[] = [
    { label: 'Patient', name: 'J. Dupont',  email: 'jean.dupont@gmail.com',            password: 'Patient1234!', cssClass: '' },
    { label: 'Patient', name: 'M. Leblanc', email: 'marie.leblanc@gmail.com',           password: 'Patient1234!', cssClass: '' },
    { label: 'Patient', name: 'P. Moreau',  email: 'pierre.moreau@hotmail.com',         password: 'Patient1234!', cssClass: '' },
    { label: 'Patient', name: 'F. Ouali',   email: 'fatima.ouali@gmail.com',            password: 'Patient1234!', cssClass: '' },
  ];

  readonly quickAdmins: QuickAccess[] = [
    { label: 'Admin', name: 'Principal', email: 'admin@caretrack.fr', password: 'Admin5678!', cssClass: 'admin' },
  ];

  onSubmit(): void {
    this.erreur.set(null);
    if (!this.email || !this.password) {
      this.erreur.set(this.translate.instant('login.fillAll'));
      return;
    }
    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.navigateByRoles(res.roles);
      },
      error: () => {
        this.loading.set(false);
        this.erreur.set(this.translate.instant('login.errors.invalidCredentials'));
      },
    });
  }

  loginQuick(entry: QuickAccess): void {
    this.erreur.set(null);
    this.email = entry.email;
    this.password = entry.password;
    this.loading.set(true);
    this.authService.login(entry.email, entry.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.navigateByRoles(res.roles);
      },
      error: () => {
        this.loading.set(false);
        this.erreur.set(this.translate.instant('login.quickLoginError'));
      },
    });
  }

  private navigateByRoles(roles: string[]): void {
    if (roles.includes('PATIENT')) {
      this.router.navigateByUrl('/patient/questionnaires');
    } else {
      // MEDECIN, ADMIN, ADMIN_SUPPORT, INFIRMIER → pro dashboard
      this.router.navigateByUrl('/pro/alertes');
    }
  }
}

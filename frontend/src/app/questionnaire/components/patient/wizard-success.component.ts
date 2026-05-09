import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { KnobModule } from 'primeng/knob';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-wizard-success',
  imports: [FormsModule, TranslateModule, ButtonModule, CardModule, KnobModule, MessageModule],
  template: `
    <div class="min-h-dvh bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">

      <!-- Icône succès animée -->
      <div class="mb-6 relative">
        <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce-once">
          <i class="pi pi-check text-5xl text-green-500"></i>
        </div>
        <!-- Confetti CSS -->
        @for (i of confettiItems; track i) {
          <span
            class="confetti-dot absolute rounded-full"
            [style.left.%]="confettiPositions[i].x"
            [style.top.%]="confettiPositions[i].y"
            [style.background]="confettiPositions[i].color"
            [style.width.px]="8"
            [style.height.px]="8"
            [style.animation-delay.ms]="i * 80"
          ></span>
        }
      </div>

      <h1 class="text-3xl font-bold text-caretrack-navy mb-2 text-center">
        {{ 'wizard.success.title' | translate }}
      </h1>
      <p class="text-gray-500 text-center mb-8 max-w-sm">
        {{ 'wizard.success.message' | translate }}
      </p>

      <!-- Score global -->
      @if (score() !== null) {
        <div class="mb-8 text-center">
          <p-knob
            [ngModel]="score()!"
            [readonly]="true"
            [min]="0"
            [max]="10"
            [size]="120"
            valueColor="#1565C0"
            rangeColor="#E3F2FD"
            textColor="#0D1B2A"
            valueTemplate="{value}/10"
          />
          <p class="text-sm text-gray-500 mt-2">{{ 'wizard.success.globalScore' | translate }}</p>
        </div>
      }

      <!-- Alerte si détectée -->
      @if (hasAlert()) {
        <div class="w-full max-w-sm mb-6">
          <p-message
            severity="info"
            [text]="'wizard.success.teamNotified' | translate"
            styleClass="w-full"
          />
        </div>
      }

      <!-- Actions -->
      <div class="flex flex-col gap-3 w-full max-w-sm">
        <p-button
          [label]="'wizard.success.backToSpace' | translate"
          icon="pi pi-home"
          [outlined]="true"
          styleClass="w-full justify-center"
          size="large"
          (click)="goHome()"
        />
        <p-button
          [label]="'wizard.success.viewHistory' | translate"
          icon="pi pi-history"
          severity="secondary"
          [text]="true"
          styleClass="w-full justify-center"
          size="large"
          (click)="goHistory()"
        />
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce-once {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    .animate-bounce-once { animation: bounce-once 0.6s ease-in-out; }

    @keyframes confetti-fall {
      0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
      100% { opacity: 0; transform: translateY(60px) rotate(360deg); }
    }
    .confetti-dot { animation: confetti-fall 1.2s ease-out forwards; }
  `],
})
export class WizardSuccessComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly score = signal<number | null>(null);
  protected readonly hasAlert = signal(false);

  protected readonly confettiItems = Array.from({ length: 12 }, (_, i) => i);
  protected readonly confettiPositions = this.confettiItems.map(() => ({
    x: Math.random() * 140 - 20,
    y: Math.random() * 140 - 20,
    color: ['#1565C0', '#00796B', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
  }));

  ngOnInit(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state as
      { code?: string; answers?: Record<string, number | string | boolean> } | undefined;
    if (state?.answers) {
      const numericVals = Object.values(state.answers)
        .filter((v): v is number => typeof v === 'number');
      if (numericVals.length > 0) {
        const avg = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
        this.score.set(Math.round(avg * 10) / 10);
        this.hasAlert.set(avg >= 7);
      }
    }
  }

  protected goHome(): void {
    this.router.navigate(['/patient/questionnaires']);
  }

  protected goHistory(): void {
    this.router.navigate(['/patient/questionnaires'], { fragment: 'historique' });
  }
}

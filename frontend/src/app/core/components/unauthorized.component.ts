import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [TranslateModule, ButtonModule],
  template: `
    <div class="p-8 text-center">
      <i class="pi pi-lock text-5xl text-red-400 mb-4 block"></i>
      <h1 class="text-2xl font-bold text-red-600 mb-4">
        {{ 'unauthorized.title' | translate }}
      </h1>
      <p class="mt-2 text-gray-600 max-w-md mx-auto">
        {{ 'unauthorized.message' | translate }}
      </p>
      <p-button
        [label]="'unauthorized.back' | translate"
        icon="pi pi-arrow-left"
        [outlined]="true"
        styleClass="mt-6"
        (click)="goBack()"
      />
    </div>
  `,
})
export class UnauthorizedComponent {
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}

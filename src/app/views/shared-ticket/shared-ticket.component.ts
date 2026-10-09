import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { AppLogo } from '../../components/app-logo';

@Component({
  standalone: true,
  imports: [CommonModule, AppLogo],
  template: `
    <main class="shared-ticket-page d-flex align-items-center justify-content-center min-vh-100 px-3 py-4 bg-body-tertiary">
      <section class="shared-ticket-card card border-0 shadow-sm w-100" aria-labelledby="shared-ticket-title">
        <div class="card-body p-4 p-md-5 text-center" *ngIf="response; else estado">
          <div class="mb-4"><app-app-logo [logoMaxWidth]="170" /></div>
          <p class="text-uppercase small fw-semibold text-primary mb-2">Ticket compartido</p>
          <h1 id="shared-ticket-title" class="h3 fw-bold mb-3">Elegí dónde abrir tu ticket</h1>
          <p class="text-body-secondary mb-4">Seleccioná el sistema que querés utilizar para continuar.</p>
          <div class="d-grid gap-2 d-sm-flex justify-content-center" *ngIf="response.destinos.length > 1">
            <button type="button" class="btn btn-primary px-4" *ngIf="response.destinos.includes('GEM_WEB')" (click)="seleccionarDestino('GEM_WEB')">Interno</button>
            <button type="button" class="btn btn-outline-primary px-4" *ngIf="response.destinos.includes('GEM_CLIENTES')" (click)="seleccionarDestino('GEM_CLIENTES')">Externo</button>
          </div>
        </div>
        <ng-template #estado>
          <div class="card-body p-4 p-md-5 text-center" aria-live="polite">
            <div class="mb-4"><app-app-logo [logoMaxWidth]="170" /></div>
            <div *ngIf="!error" class="spinner-border text-primary mb-3" role="status"><span class="visually-hidden">Validando el enlace del ticket</span></div>
            <p class="mb-0" [class.text-danger]="!!error" [attr.role]="error ? 'alert' : null">{{ error || 'Validando el enlace del ticket…' }}</p>
          </div>
        </ng-template>
      </section>
    </main>
  `,
  styles: [`.shared-ticket-card { max-width: 30rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedTicketComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  response: { destinos: Array<'GEM_WEB' | 'GEM_CLIENTES'> } | null = null;
  error = '';

  constructor() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      void this.router.navigate(['/login']);
      return;
    }
    this.http.get<{ destinos: Array<'GEM_WEB' | 'GEM_CLIENTES'> }>(`${environment.apiBaseUrl}/shared/ticket/${encodeURIComponent(token)}`).subscribe({
      next: response => {
        this.response = response;
        if (response.destinos.includes('GEM_CLIENTES')) {
          this.seleccionarDestino('GEM_CLIENTES', token);
          return;
        }
        this.cdr.markForCheck();
        if (response.destinos.length === 1) this.seleccionarDestino(response.destinos[0], token);
      },
      error: () => {
        this.error = 'El enlace no existe, fue revocado o expiró.';
        this.cdr.markForCheck();
      },
    });
  }

  seleccionarDestino(destino: 'GEM_WEB' | 'GEM_CLIENTES', token = this.route.snapshot.paramMap.get('token') ?? ''): void {
    if (destino === 'GEM_WEB') {
      window.location.assign(`${environment.gemWebUrl}/shared/ticket/${encodeURIComponent(token)}`);
      return;
    }
    if (this.auth.isAuthenticated()) {
      void this.router.navigate(['/tickets'], { queryParams: { sharedTicketToken: token } });
      return;
    }
    void this.router.navigate(['/login'], { queryParams: { returnUrl: `/shared/ticket/${encodeURIComponent(token)}` } });
  }
}

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PortalClientIdentityService } from './portal-client-identity.service';

@Injectable({ providedIn: 'root' })
export class PortalClientSessionService {
  private readonly identity = inject(PortalClientIdentityService);
  private readonly router = inject(Router);
  private redirectStarted = false;

  handleInvalidSession(): void {
    if (this.redirectStarted) return;

    this.redirectStarted = true;
    sessionStorage.removeItem('gem_clientes_authenticated');
    this.identity.clear();
    void this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
  }

  markAuthenticated(): void {
    this.redirectStarted = false;
  }
}

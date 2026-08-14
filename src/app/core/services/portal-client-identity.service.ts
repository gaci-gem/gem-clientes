import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PortalClientIdentity } from '../models/portal-client-identity.model';

@Injectable({ providedIn: 'root' })
export class PortalClientIdentityService {
  private readonly http = inject(HttpClient);

  readonly identity = signal<PortalClientIdentity | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly displayName = computed(() => this.identity()?.name?.trim() || 'Cliente');

  load(): Observable<PortalClientIdentity | null> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<PortalClientIdentity>(`${environment.apiBaseUrl}/v1/portal-cliente/auth/me`).pipe(
      tap((identity) => this.identity.set(identity)),
      catchError(() => {
        this.identity.set(null);
        this.error.set('No pudimos cargar la identidad del cliente.');
        return of(null);
      }),
      tap(() => this.loading.set(false)),
    );
  }

  clear(): void {
    this.identity.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

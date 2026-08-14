import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { finalize, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PortalClientIdentityService } from './portal-client-identity.service';
import { PortalClientSessionService } from './portal-client-session.service';

interface LoginResponse { authenticated: true; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly identity = inject(PortalClientIdentityService);
  private readonly session = inject(PortalClientSessionService);
  private readonly authenticatedKey = 'gem_clientes_authenticated';

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/v1/portal-cliente/auth/login`, { login, password }).pipe(
      tap((response) => {
        if (response.authenticated) sessionStorage.setItem(this.authenticatedKey, 'true');
        this.session.markAuthenticated();
      }),
      switchMap((response) => this.identity.load().pipe(map(() => response))),
    );
  }

  isAuthenticated(): boolean { return sessionStorage.getItem(this.authenticatedKey) === 'true'; }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/v1/portal-cliente/auth/logout`, {}).pipe(
      finalize(() => {
        sessionStorage.removeItem(this.authenticatedKey);
        this.identity.clear();
      }),
    );
  }
}

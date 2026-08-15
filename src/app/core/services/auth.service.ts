import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { finalize, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GemClientesIdentityService } from './gem-clientes-identity.service';
import { GemClientesSessionService } from './gem-clientes-session.service';

interface LoginResponse { authenticated: true; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly identity = inject(GemClientesIdentityService);
  private readonly session = inject(GemClientesSessionService);
  private readonly authenticatedKey = 'gem_clientes_authenticated';

  login(login: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/v1/gem-clientes/auth/login`, { login, password }).pipe(
      tap((response) => {
        if (response.authenticated) sessionStorage.setItem(this.authenticatedKey, 'true');
        this.session.markAuthenticated();
      }),
      switchMap((response) => this.identity.load().pipe(map(() => response))),
    );
  }

  isAuthenticated(): boolean { return sessionStorage.getItem(this.authenticatedKey) === 'true'; }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/v1/gem-clientes/auth/logout`, {}).pipe(
      finalize(() => {
        sessionStorage.removeItem(this.authenticatedKey);
        this.identity.clear();
      }),
    );
  }
}

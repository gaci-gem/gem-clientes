import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChangePortalClientPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class PortalClientPasswordService {
  private readonly http = inject(HttpClient);

  changePassword(payload: ChangePortalClientPasswordRequest): Observable<{ authenticated: true }> {
    return this.http.post<{ authenticated: true }>(
      `${environment.apiBaseUrl}/v1/portal-cliente/auth/password`,
      payload,
    );
  }
}

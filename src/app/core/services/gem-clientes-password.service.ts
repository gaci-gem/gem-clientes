import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChangeGemClientesPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class GemClientesPasswordService {
  private readonly http = inject(HttpClient);

  changePassword(payload: ChangeGemClientesPasswordRequest): Observable<{ authenticated: true }> {
    return this.http.post<{ authenticated: true }>(
      `${environment.apiBaseUrl}/v1/gem-clientes/auth/password`,
      payload,
    );
  }
}

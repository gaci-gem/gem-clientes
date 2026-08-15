import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { GemClientesSessionService } from './services/gem-clientes-session.service';

const gemClientesApiPrefix = `${environment.apiBaseUrl}/v1/gem-clientes/`;

export const invalidSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(GemClientesSessionService);
  const isGemClientesRequest = request.url.startsWith(gemClientesApiPrefix);
  const isLoginOrLogout = /\/auth\/(login|logout)$/.test(request.url);

  if (!isGemClientesRequest || isLoginOrLogout) return next(request);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        session.handleInvalidSession();
      }
      return throwError(() => error);
    }),
  );
};

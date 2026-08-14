import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PortalClientSessionService } from './services/portal-client-session.service';

const portalApiPrefix = `${environment.apiBaseUrl}/v1/portal-cliente/`;

export const invalidSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(PortalClientSessionService);
  const isPortalRequest = request.url.startsWith(portalApiPrefix);
  const isLoginOrLogout = /\/auth\/(login|logout)$/.test(request.url);

  if (!isPortalRequest || isLoginOrLogout) return next(request);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        session.handleInvalidSession();
      }
      return throwError(() => error);
    }),
  );
};

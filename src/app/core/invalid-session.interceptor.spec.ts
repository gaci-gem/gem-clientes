import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { invalidSessionInterceptor } from './invalid-session.interceptor';
import { PortalClientIdentityService } from './services/portal-client-identity.service';
import { PortalClientSessionService } from './services/portal-client-session.service';

describe('invalidSessionInterceptor', () => {
  let handler: jasmine.SpyObj<PortalClientSessionService>;
  let next: jasmine.Spy;

  beforeEach(() => {
    handler = jasmine.createSpyObj('PortalClientSessionService', ['handleInvalidSession']);
    next = jasmine.createSpy('next');
    TestBed.configureTestingModule({ providers: [
      { provide: PortalClientSessionService, useValue: handler },
    ] });
  });

  it('handles one protected portal 401 and rethrows it', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/v1/portal-cliente/tickets' });
    next.and.returnValue(throwError(() => error));

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', '/v1/portal-cliente/tickets'), next),
    ))).toBeRejectedWith(error);

    expect(handler.handleInvalidSession).toHaveBeenCalledTimes(1);
  });

  it('does not handle login or logout 401 responses', async () => {
    const error = new HttpErrorResponse({ status: 401 });
    next.and.returnValue(throwError(() => error));

    for (const url of ['/v1/portal-cliente/auth/login', '/v1/portal-cliente/auth/logout']) {
      await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', url), next),
      ))).toBeRejectedWith(error);
    }

    expect(handler.handleInvalidSession).not.toHaveBeenCalled();
  });

  it('ignores non-401 responses', async () => {
    next.and.returnValue(of(new HttpResponse({ body: 'ok' })));

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', '/v1/portal-cliente/tickets'), next),
    ))).toBeResolvedTo(jasmine.any(HttpResponse));

    expect(handler.handleInvalidSession).not.toHaveBeenCalled();
  });
});

describe('PortalClientSessionService', () => {
  it('clears auth state and redirects only once', () => {
    const identity = jasmine.createSpyObj('PortalClientIdentityService', ['clear']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    sessionStorage.setItem('gem_clientes_authenticated', 'true');

    TestBed.configureTestingModule({ providers: [
      PortalClientSessionService,
      { provide: PortalClientIdentityService, useValue: identity },
      { provide: Router, useValue: router },
    ] });

    const service = TestBed.inject(PortalClientSessionService);
    service.handleInvalidSession();
    service.handleInvalidSession();

    expect(sessionStorage.getItem('gem_clientes_authenticated')).toBeNull();
    expect(identity.clear).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], { queryParams: { sessionExpired: 'true' } });
  });
});

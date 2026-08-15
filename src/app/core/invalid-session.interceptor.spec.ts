import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { invalidSessionInterceptor } from './invalid-session.interceptor';
import { GemClientesIdentityService } from './services/gem-clientes-identity.service';
import { GemClientesSessionService } from './services/gem-clientes-session.service';

describe('invalidSessionInterceptor', () => {
  let handler: jasmine.SpyObj<GemClientesSessionService>;
  let next: jasmine.Spy;

  beforeEach(() => {
    handler = jasmine.createSpyObj('GemClientesSessionService', ['handleInvalidSession']);
    next = jasmine.createSpy('next');
    TestBed.configureTestingModule({ providers: [
      { provide: GemClientesSessionService, useValue: handler },
    ] });
  });

  it('handles one protected GEM Clientes 401 and rethrows it', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/v1/gem-clientes/tickets' });
    next.and.returnValue(throwError(() => error));

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', '/v1/gem-clientes/tickets'), next),
    ))).toBeRejectedWith(error);

    expect(handler.handleInvalidSession).toHaveBeenCalledTimes(1);
  });

  it('does not handle login or logout 401 responses', async () => {
    const error = new HttpErrorResponse({ status: 401 });
    next.and.returnValue(throwError(() => error));

    for (const url of ['/v1/gem-clientes/auth/login', '/v1/gem-clientes/auth/logout']) {
      await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', url), next),
      ))).toBeRejectedWith(error);
    }

    expect(handler.handleInvalidSession).not.toHaveBeenCalled();
  });

  it('ignores non-401 responses', async () => {
    next.and.returnValue(of(new HttpResponse({ body: 'ok' })));

    await expectAsync(firstValueFrom(TestBed.runInInjectionContext(() =>
      invalidSessionInterceptor(new HttpRequest('GET', '/v1/gem-clientes/tickets'), next),
    ))).toBeResolvedTo(jasmine.any(HttpResponse));

    expect(handler.handleInvalidSession).not.toHaveBeenCalled();
  });
});

describe('GemClientesSessionService', () => {
  it('clears auth state and redirects only once', () => {
    const identity = jasmine.createSpyObj('GemClientesIdentityService', ['clear']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    sessionStorage.setItem('gem_clientes_authenticated', 'true');

    TestBed.configureTestingModule({ providers: [
      GemClientesSessionService,
      { provide: GemClientesIdentityService, useValue: identity },
      { provide: Router, useValue: router },
    ] });

    const service = TestBed.inject(GemClientesSessionService);
    service.handleInvalidSession();
    service.handleInvalidSession();

    expect(sessionStorage.getItem('gem_clientes_authenticated')).toBeNull();
    expect(identity.clear).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], { queryParams: { sessionExpired: 'true' } });
  });
});

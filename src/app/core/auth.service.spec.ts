import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { credentialsInterceptor } from './credentials.interceptor';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [AuthService, provideHttpClient(withInterceptors([credentialsInterceptor])), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('logs in with the portal contract and marks the cookie session', () => {
    service.login('cliente-1', 'secret').subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/portal-cliente/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ login: 'cliente-1', password: 'secret' });
    request.flush({ authenticated: true });
    const identityRequest = http.expectOne(`${environment.apiBaseUrl}/v1/portal-cliente/auth/me`);
    expect(identityRequest.request.method).toBe('GET');
    expect(identityRequest.request.withCredentials).toBeTrue();
    identityRequest.flush({ clienteId: 1, name: 'Client One' });
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logs out through the portal endpoint', () => {
    sessionStorage.setItem('gem_clientes_authenticated', 'true');
    service.logout().subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/portal-cliente/auth/logout`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
    expect(service.isAuthenticated()).toBeFalse();
  });
});

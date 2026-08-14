import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { credentialsInterceptor } from '../credentials.interceptor';
import { PortalClientPasswordService } from './portal-client-password.service';

describe('PortalClientPasswordService', () => {
  let service: PortalClientPasswordService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PortalClientPasswordService, provideHttpClient(withInterceptors([credentialsInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortalClientPasswordService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the password change through the authenticated portal endpoint', () => {
    const payload = { currentPassword: 'old-password', newPassword: 'new-password1', confirmation: 'new-password1' };
    service.changePassword(payload).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/portal-cliente/auth/password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual(payload);
    request.flush({ authenticated: true });
  });
});

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { credentialsInterceptor } from '../credentials.interceptor';
import { GemClientesPasswordService } from './gem-clientes-password.service';

describe('GemClientesPasswordService', () => {
  let service: GemClientesPasswordService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GemClientesPasswordService, provideHttpClient(withInterceptors([credentialsInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(GemClientesPasswordService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the password change through the authenticated GEM Clientes endpoint', () => {
    const payload = { currentPassword: 'old-password', newPassword: 'new-password1', confirmation: 'new-password1' };
    service.changePassword(payload).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/auth/password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual(payload);
    request.flush({ authenticated: true });
  });
});

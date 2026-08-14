import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  it('adds credentials to API requests', () => {
    const request = new HttpRequest('GET', '/v1/portal-cliente/tickets');
    let forwarded = false;

    credentialsInterceptor(request, (nextRequest) => {
      forwarded = true;
      expect(nextRequest.withCredentials).toBeTrue();
      return of(new HttpResponse({ body: nextRequest }));
    });

    expect(forwarded).toBeTrue();
  });
});

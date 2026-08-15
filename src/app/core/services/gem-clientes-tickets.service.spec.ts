import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { credentialsInterceptor } from '../credentials.interceptor';
import { GemClientesTicketsService } from './gem-clientes-tickets.service';

describe('GemClientesTicketsService', () => {
  let service: GemClientesTicketsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GemClientesTicketsService,
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(GemClientesTicketsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists tickets through the authenticated, client-scoped endpoint', () => {
    service.listTickets().subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets`);

    expect(request.request.method).toBe('GET');
    expect(request.request.urlWithParams).not.toContain('clienteId');
    expect(request.request.withCredentials).toBeTrue();
    request.flush([]);
  });

  it('gets ticket details without sending clienteId', () => {
    service.getTicket(42).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/42`);

    expect(request.request.method).toBe('GET');
    expect(request.request.urlWithParams).not.toContain('clienteId');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ comments: [], events: [] });
  });

  it('creates a ticket through the session-scoped endpoint', () => {
    service.createTicket({ subject: 'Access request', description: 'Please review access.' }).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('asunto')).toBe('Access request');
    expect((request.request.body as FormData).get('descripcion')).toBe('Please review access.');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({});
  });

  it('sends an external reference when provided', () => {
    service.createTicket({ subject: 'Access request', description: 'Please review access.', externalReference: 'CASE-1' }).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets`);

    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('referenciaExterna')).toBe('CASE-1');
    request.flush({});
  });

  it('adds a comment without sending tenant identifiers', () => {
    service.addComment(42, 'More information').subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/42/comments`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('texto')).toBe('More information');
    expect(request.request.urlWithParams).not.toContain('clienteId');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({});
  });

  it('sends comment attachments in the comment FormData', () => {
    const file = new File(['content'], 'report.txt', { type: 'text/plain' });
    service.addComment(42, 'More information', [file]).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/42/comments`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('texto')).toBe('More information');
    expect((request.request.body as FormData).get('archivos')).toEqual(jasmine.objectContaining({ name: 'report.txt', type: 'text/plain' }));
    expect(request.request.urlWithParams).not.toContain('clienteId');
    expect(request.request.withCredentials).toBeTrue();
    request.flush([]);
  });

  it('updates or clears the external reference through the owned ticket endpoint', () => {
    service.updateExternalReference(42, 'CASE-1').subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/42/referencia-externa`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ referenciaExterna: 'CASE-1' });
    expect(request.request.withCredentials).toBeTrue();
    request.flush({});
  });
});

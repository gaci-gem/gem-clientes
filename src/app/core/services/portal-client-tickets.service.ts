import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePortalClientTicket,
  PortalClientTicket,
  PortalClientTicketComment,
  PortalClientTicketDetail,
} from '../models/portal-client-ticket.model';

@Injectable({ providedIn: 'root' })
export class PortalClientTicketsService {
  private readonly http = inject(HttpClient);

  listTickets(): Observable<PortalClientTicket[]> {
    return this.http.get<PortalClientTicket[]>(
      `${environment.apiBaseUrl}/v1/portal-cliente/tickets`,
    );
  }

  createTicket(ticket: CreatePortalClientTicket): Observable<PortalClientTicket> {
    const body = new FormData();
    body.append('asunto', ticket.subject);
    body.append('descripcion', ticket.description);
    if (ticket.externalReference !== undefined) body.append('referenciaExterna', ticket.externalReference);
    for (const file of ticket.files ?? []) body.append('archivos', file, file.name);
    return this.http.post<PortalClientTicket>(
      `${environment.apiBaseUrl}/v1/portal-cliente/tickets`,
      body,
    );
  }

  getTicket(id: number): Observable<PortalClientTicketDetail> {
    return this.http.get<PortalClientTicketDetail>(
      `${environment.apiBaseUrl}/v1/portal-cliente/tickets/${id}`,
    );
  }

  addComment(id: number, text: string, files: File[] = []): Observable<PortalClientTicketComment> {
    const body = new FormData();
    body.append('texto', text);
    for (const file of files) body.append('archivos', file, file.name);
    return this.http.post<PortalClientTicketComment>(
      `${environment.apiBaseUrl}/v1/portal-cliente/tickets/${id}/comments`,
      body,
    );
  }

  updateExternalReference(id: number, reference: string | null): Observable<PortalClientTicket> {
    return this.http.patch<PortalClientTicket>(
      `${environment.apiBaseUrl}/v1/portal-cliente/tickets/${id}/referencia-externa`,
      { referenciaExterna: reference },
    );
  }
}

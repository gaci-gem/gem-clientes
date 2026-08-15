import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateGemClientesTicket,
  GemClientesTicket,
  GemClientesTicketComment,
  GemClientesTicketDetail,
} from '../models/gem-clientes-ticket.model';

@Injectable({ providedIn: 'root' })
export class GemClientesTicketsService {
  private readonly http = inject(HttpClient);

  listTickets(): Observable<GemClientesTicket[]> {
    return this.http.get<GemClientesTicket[]>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets`,
    );
  }

  createTicket(ticket: CreateGemClientesTicket): Observable<GemClientesTicket> {
    const body = new FormData();
    body.append('asunto', ticket.subject);
    body.append('descripcion', ticket.description);
    if (ticket.externalReference !== undefined) body.append('referenciaExterna', ticket.externalReference);
    for (const file of ticket.files ?? []) body.append('archivos', file, file.name);
    return this.http.post<GemClientesTicket>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets`,
      body,
    );
  }

  getTicket(id: number): Observable<GemClientesTicketDetail> {
    return this.http.get<GemClientesTicketDetail>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}`,
    );
  }

  addComment(id: number, text: string, files: File[] = []): Observable<GemClientesTicketComment> {
    const body = new FormData();
    body.append('texto', text);
    for (const file of files) body.append('archivos', file, file.name);
    return this.http.post<GemClientesTicketComment>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}/comments`,
      body,
    );
  }

  updateExternalReference(id: number, reference: string | null): Observable<GemClientesTicket> {
    return this.http.patch<GemClientesTicket>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}/referencia-externa`,
      { referenciaExterna: reference },
    );
  }
}

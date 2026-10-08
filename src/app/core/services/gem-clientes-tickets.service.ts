import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateGemClientesTicket,
  GemClientesTicket,
  GemClientesTicketPage,
  GemClientesTicketComment,
  GemClientesTicketDetail,
} from '../models/gem-clientes-ticket.model';

export interface GemClientesTicketFilters {
  search?: string;
  estado?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
  prioridad?: string;
  tipo?: string;
}

@Injectable({ providedIn: 'root' })
export class GemClientesTicketsService {
  private readonly http = inject(HttpClient);

  listTickets(filters: GemClientesTicketFilters = {}): Observable<GemClientesTicketPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) if (value) params = params.set(key, value);
    return this.http.get<GemClientesTicketPage>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets`,
      { params },
    );
  }

  createTicket(ticket: CreateGemClientesTicket): Observable<GemClientesTicket> {
    const body = new FormData();
    body.append('asunto', ticket.subject);
    body.append('descripcion', ticket.description);
    if (ticket.externalReference !== undefined) body.append('referenciaExterna', ticket.externalReference);
    if (ticket.type) body.append('tipo', ticket.type);
    for (const file of ticket.files ?? []) body.append('archivos', file, file.name);
    return this.http.post<GemClientesTicket>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets`,
      body,
    );
  }

  updatePriority(id: number, priority: GemClientesTicket['priority']): Observable<GemClientesTicket> { return this.http.patch<GemClientesTicket>(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}/priority`, { priority }); }
  updateType(id: number, type: GemClientesTicket['type']): Observable<GemClientesTicket> { return this.http.patch<GemClientesTicket>(`${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}/type`, { type }); }

  getTicket(id: number): Observable<GemClientesTicketDetail> {
    return this.http.get<GemClientesTicketDetail>(
      `${environment.apiBaseUrl}/v1/gem-clientes/tickets/${id}`,
    );
  }

  resolveSharedTicket(token: string): Observable<{ id: number }> {
    return this.http.get<{ id: number }>(
      `${environment.apiBaseUrl}/shared/ticket/${encodeURIComponent(token)}/ticket`,
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

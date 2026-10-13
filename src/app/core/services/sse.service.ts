import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TicketMutationNotification } from '../interfaces/ticket-mutation';

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly destroyRef = inject(DestroyRef);
  private eventSource: EventSource | null = null;
  readonly connected = signal(false);
  readonly ticketMutations = signal<TicketMutationNotification[]>([]);

  constructor() { this.destroyRef.onDestroy(() => this.disconnect()); }

  connect(): void {
    if (this.eventSource) return;
    this.eventSource = new EventSource(`${environment.apiBaseUrl}/notificacion/sse`, { withCredentials: true });
    this.eventSource.onopen = () => this.connected.set(true);
    this.eventSource.onmessage = ({ data }) => {
      try {
        const event = JSON.parse(data);
        if (event?.type === 'TICKET_MUTATION') this.ticketMutations.update((items) => [event, ...items].slice(0, 50));
      } catch { /* Ignorar mensajes inválidos. */ }
    };
    this.eventSource.onerror = () => { this.eventSource?.close(); this.eventSource = null; this.connected.set(false); };
  }

  disconnect(): void { this.eventSource?.close(); this.eventSource = null; this.connected.set(false); }
}

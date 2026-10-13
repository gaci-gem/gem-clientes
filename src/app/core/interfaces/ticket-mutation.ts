export interface TicketMutationNotification {
  type: 'TICKET_MUTATION'; ticketId: number; operation: 'CREATED' | 'UPDATED';
  changedFields: string[]; clienteId?: number; source: string; timestamp: string;
}

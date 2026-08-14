export interface PortalClientTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortalClientTicketEvent {
  id: string;
  type: string;
  code: string;
  title: string;
  visibleState: 'OPEN' | 'CLOSED';
}

export interface PortalClientTicketDetail extends PortalClientTicket {
  comments: PortalClientTicketComment[];
  events: PortalClientTicketEvent[];
  attachments?: PortalClientTicketAttachment[];
}

export interface PortalClientTicketComment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  attachments?: PortalClientTicketAttachment[];
}

export interface PortalClientTicketAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  checksum: string;
  createdAt: string;
  downloadUrl: string;
}

export interface CreatePortalClientTicket {
  subject: string;
  description: string;
  externalReference?: string;
  files?: File[];
}
